import nodemailer from "nodemailer";
import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { checkMailbox } from "./mail-store";
import { placesBudget } from "./google-business";
import { getCronHealth } from "./admin-data";

/**
 * Does the machinery actually work right now.
 *
 * Every failure this page exists to catch has already happened here once: a
 * cron job that sat in hPanel looking healthy while the follow-up sequence
 * was dead, a mailbox that could not be read so the day 3 and day 5 emails
 * were held back silently, a Places allowance spent with the search box
 * simply returning nothing. None of them announced themselves. Each was
 * found days later, by accident, by a person wondering why something felt
 * quiet.
 *
 * So this asks the questions out loud, in one place, on demand. It makes
 * real connections rather than reading configuration: a password that is set
 * and wrong looks exactly like a correct one from the environment.
 *
 * It never returns a secret. A check says whether something is configured
 * and whether it answered, never what the value was.
 */

export type CheckState = "ok" | "warn" | "fail" | "off";

export type Check = {
  name: string;
  state: CheckState;
  detail: string;
  /** What to do about it, when there is something to do. */
  fix?: string;
};

/** Nothing here may hang the page. A mail server that accepts the connection
 *  and then says nothing would otherwise hold the request open until the
 *  platform kills it. */
async function within<T>(ms: number, job: Promise<T>, onTimeout: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(onTimeout), ms);
  });
  try {
    return await Promise.race([job, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

async function databaseCheck(): Promise<Check> {
  const counts = await withDb(async (db) => {
    const [rows] = await db.query<
      (RowDataPacket & { prospects: number; leads: number; emails: number })[]
    >(
      `SELECT (SELECT COUNT(*) FROM prospects) AS prospects,
              (SELECT COUNT(*) FROM scan_leads) AS leads,
              (SELECT COUNT(*) FROM prospect_emails WHERE status = 'sent') AS emails`,
    );
    return rows[0];
  });

  if (!counts) {
    return {
      name: "Database",
      state: "fail",
      detail: "No connection. Nothing is being saved — not leads, not prospects, not scans.",
      fix: "Check DB_HOST, DB_NAME, DB_USER and DB_PASS in hPanel, then redeploy.",
    };
  }

  return {
    name: "Database",
    state: "ok",
    detail: `Connected. ${Number(counts.prospects)} prospects, ${Number(counts.leads)} leads, ${Number(counts.emails)} outreach emails sent.`,
  };
}

async function smtpCheck(): Promise<Check> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return {
      name: "Sending email",
      state: "fail",
      detail: "SMTP is not configured, so nothing can be sent at all.",
      fix: "Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in hPanel.",
    };
  }

  // verify() opens the connection and logs in, which is the only way to tell
  // a correct password from a wrong one that is present.
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
  });

  const result = await within(
    10_000,
    transporter
      .verify()
      .then(() => ({ ok: true, message: "" }))
      .catch((err: unknown) => ({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      })),
    { ok: false, message: "timed out" },
  );
  transporter.close();

  return result.ok
    ? {
        name: "Sending email",
        state: "ok",
        detail: `${SMTP_HOST} accepted the login. Outreach and follow-ups can go out.`,
      }
    : {
        name: "Sending email",
        state: "fail",
        detail: `${SMTP_HOST} refused: ${result.message}`,
        fix: "Check SMTP_HOST, SMTP_PORT and the mailbox password in hPanel — a refused connection is usually the host or port, a rejected login is the password. Nothing can be sent until this answers.",
      };
}

async function mailboxCheck(): Promise<Check> {
  const result = await within(12_000, checkMailbox(), {
    ok: false,
    detail: "The mailbox did not answer in time.",
  });

  return result.ok
    ? {
        name: "Reading the inbox",
        state: "ok",
        detail: `${result.detail} Replies are seen, and sent copies are filed.`,
      }
    : {
        name: "Reading the inbox",
        state: "fail",
        detail: result.detail,
        fix: "Day 3 and day 5 follow-ups are held back until this works, because without it the sequence cannot tell who has already replied. Sent copies are not filed either. IMAP_HOST overrides the host if it is not imap. on your mail domain.",
      };
}

function placesCheck(): Check {
  const budget = placesBudget();
  if (!budget.hasKey) {
    return {
      name: "Finding businesses",
      state: "fail",
      detail: "No Google Places key, so the prospect search returns nothing.",
      fix: "Set GOOGLE_PLACES_KEY in hPanel.",
    };
  }

  const spent = budget.today >= budget.dailyBudget || budget.thisMonth >= budget.monthlyBudget;
  return {
    name: "Finding businesses",
    state: spent ? "warn" : "ok",
    detail: spent
      ? `The allowance is spent for now — ${budget.today} searches today, ${budget.thisMonth} this month. Searching will return nothing until it resets.`
      : `Key is set. ${budget.today} of ${budget.dailyBudget} searches used today, ${budget.thisMonth} of ${budget.monthlyBudget} this month.`,
    fix: "These counts are held in memory and reset whenever the site restarts, so they read low after a deploy. The real limit is the quota on the key in Google Cloud.",
  };
}

async function schedulerCheck(): Promise<Check> {
  const cron = await getCronHealth();
  if (!cron || cron.lastRunAt === null) {
    return {
      name: "The daily job",
      state: "fail",
      detail: "It has never reported finishing a run.",
      fix: "Check the cron job in hPanel under Advanced → Cron Jobs. Nothing automatic happens without it: no follow-ups, no prospect sequence.",
    };
  }

  const stale = cron.hoursSince !== null && cron.hoursSince >= 48;
  const held = cron.lastDetail?.startsWith("inbox unreadable") ?? false;

  if (stale) {
    return {
      name: "The daily job",
      state: "fail",
      detail: `Last finished ${cron.hoursSince} hours ago. It should run every day.`,
      fix: "Check the cron job in hPanel under Advanced → Cron Jobs.",
    };
  }

  return {
    name: "The daily job",
    state: held ? "warn" : "ok",
    detail: `Ran ${cron.hoursSince ?? 0} hours ago. ${cron.runsLast7Days} runs and ${cron.sentLast7Days} emails in the last week.${cron.lastDetail ? ` Last run: ${cron.lastDetail}.` : ""}`,
    fix: held ? "It is running but holding follow-ups back — see the inbox check above." : undefined,
  };
}

function secretsCheck(): Check {
  const missing: string[] = [];
  if (!process.env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  const cronSecret = process.env.CRON_SECRET ?? "";
  if (cronSecret.length < 16) missing.push("CRON_SECRET (needs 16+ characters)");

  return missing.length
    ? {
        name: "Keys and passwords",
        state: "fail",
        detail: `Missing or too short: ${missing.join(", ")}.`,
        fix: "Set them in hPanel. CRON_SECRET also signs the unsubscribe links, so without it emails fall back to asking people to reply.",
      }
    : {
        name: "Keys and passwords",
        state: "ok",
        detail: "The admin password and the cron secret are both set. Unsubscribe links can be signed.",
      };
}

/** Everything at once, in parallel, because several of these wait on a
 *  network round trip and a person is watching the page load. */
export async function runHealthChecks(): Promise<Check[]> {
  const [database, smtp, mailbox, scheduler] = await Promise.all([
    databaseCheck(),
    smtpCheck(),
    mailboxCheck(),
    schedulerCheck(),
  ]);

  return [database, smtp, mailbox, placesCheck(), scheduler, secretsCheck()];
}

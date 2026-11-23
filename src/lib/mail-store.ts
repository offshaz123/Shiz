import { ImapFlow } from "imapflow";
import { looksLikeBounce, parseBounce, type DeadAddress } from "./bounces";

/**
 * The mailbox itself, over IMAP, for the two things SMTP cannot do.
 *
 * Sending through the server means nothing lands in the Sent folder, so a
 * copy has to be filed there by hand — otherwise the only record of what was
 * said lives in our own database and never appears in the mail client where
 * the reply will arrive.
 *
 * The second job is knowing when somebody has answered. A follow-up that
 * arrives after a reply is the thing that makes an agency look like a robot,
 * and the only way to avoid it is to read the inbox and see.
 *
 * Everything here is best-effort and must stay that way. IMAP being slow,
 * refusing a login, or not being reachable at all is never allowed to fail a
 * send or stop a cron run — the caller gets null or false and carries on.
 */

/** Short, because this runs inside a cron request on shared hosting. A
 *  mailbox that is not answering must not hold a run open. */
const TIMEOUTS = { greetingTimeout: 8000, socketTimeout: 20_000, connectionTimeout: 10_000 };

/** How many bounce messages to open in one run. Each one is a full download,
 *  and the newest are the ones that matter, so an inbox with a backlog gets
 *  worked through over several runs rather than holding one of them open. */
const MAX_BOUNCES_PER_RUN = 25;

/**
 * Hostinger's IMAP host is the SMTP one with the service name swapped, so
 * there is nothing new to configure. IMAP_HOST overrides it if the mail ever
 * moves somewhere that does not follow that pattern.
 */
function imapHost(): string | null {
  const explicit = process.env.IMAP_HOST;
  if (explicit) return explicit;
  const smtp = process.env.SMTP_HOST;
  if (!smtp) return null;
  return smtp.replace(/^smtp\./i, "imap.");
}

function client(): ImapFlow | null {
  const host = imapHost();
  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!host || !SMTP_USER || !SMTP_PASS) return null;

  return new ImapFlow({
    host,
    port: Number(process.env.IMAP_PORT) || 993,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // ImapFlow logs every command at info level by default, which on a cron
    // route means a megabyte of protocol chatter per run.
    logger: false,
    ...TIMEOUTS,
  });
}

/** Runs one job against the mailbox and always closes the connection. */
async function withMailbox<T>(job: (c: ImapFlow) => Promise<T>): Promise<T | null> {
  const c = client();
  if (!c) return null;
  try {
    await c.connect();
    return await job(c);
  } catch (err) {
    console.error("IMAP:", err);
    return null;
  } finally {
    await c.logout().catch(() => c.close());
  }
}

/**
 * Puts a copy of a sent message in the Sent folder.
 *
 * The folder is found by its special-use flag rather than its name, because
 * what it is called depends on the server and the language it was set up in
 * — "Sent", "Sent Items", "INBOX.Sent" are all real answers.
 */
export async function fileInSent(raw: Buffer | string): Promise<boolean> {
  const done = await withMailbox(async (c) => {
    const boxes = await c.list();
    const sent =
      boxes.find((b) => b.specialUse === "\\Sent")?.path ??
      boxes.find((b) => /^(inbox\.)?sent( items| messages)?$/i.test(b.path))?.path;
    if (!sent) return false;
    await c.append(sent, raw, ["\\Seen"], new Date());
    return true;
  });
  return done === true;
}

/**
 * Every address that has written to the inbox since a given date, lowercased.
 *
 * One search for the whole run rather than one per prospect: a follow-up pass
 * over thirty prospects must not open thirty connections, and the inbox of a
 * business this size holds few enough recent messages that reading the
 * envelopes of all of them is cheaper than asking thirty times.
 *
 * Null means the question could not be answered — no IMAP, a refused login, a
 * timeout. That is deliberately different from an empty set: one means nobody
 * replied, the other means we do not know, and sending a follow-up is only
 * safe on the first.
 */
export async function sendersSince(since: Date): Promise<Set<string> | null> {
  return withMailbox(async (c) => {
    const lock = await c.getMailboxLock("INBOX");
    try {
      const found = new Set<string>();
      for await (const message of c.fetch({ since }, { envelope: true })) {
        for (const from of message.envelope?.from ?? []) {
          if (from.address) found.add(from.address.toLowerCase());
        }
      }
      return found;
    } finally {
      lock.release();
    }
  });
}

/**
 * Every address a bounce message says is dead, from one read of the inbox.
 *
 * Done as a second pass over the same envelopes rather than by downloading
 * every message: a bounce has to be read in full to find out which address
 * failed, and pulling the body of sixty ordinary emails to find three of
 * them is a lot of a cron run's time for nothing. So the envelopes decide
 * what is worth opening, and only those get fetched.
 *
 * Null means the question could not be answered, exactly as in sendersSince,
 * and for the same reason: "no bounces" and "we could not look" must not
 * both read as an empty list.
 */
export async function bouncesSince(since: Date): Promise<DeadAddress[] | null> {
  return withMailbox(async (c) => {
    const lock = await c.getMailboxLock("INBOX");
    try {
      const worthOpening: number[] = [];
      for await (const message of c.fetch({ since }, { envelope: true, uid: true })) {
        const from = message.envelope?.from?.[0]?.address ?? "";
        const subject = message.envelope?.subject ?? "";
        if (looksLikeBounce(from, subject)) worthOpening.push(message.uid);
      }

      const found = new Map<string, DeadAddress>();
      // Bounded, so a mailbox that has filled up with failure reports costs
      // one run's worth of work rather than the run.
      for (const uid of worthOpening.slice(-MAX_BOUNCES_PER_RUN)) {
        const message = await c.fetchOne(String(uid), { source: true }, { uid: true });
        if (!message || typeof message === "boolean" || !message.source) continue;
        for (const dead of parseBounce(message.source.toString("utf8"))) {
          if (!found.has(dead.email)) found.set(dead.email, dead);
        }
      }
      return [...found.values()];
    } finally {
      lock.release();
    }
  });
}

/**
 * Can we reach the mailbox at all, and is there a Sent folder to file into?
 *
 * For the health page. Everything else in this file swallows its errors so a
 * mail problem cannot break a send or a cron run — which is right, and which
 * is also why nothing anywhere said the follow-ups were frozen. This one
 * hands the reason back so a person can read it.
 */
export async function checkMailbox(): Promise<{ ok: boolean; detail: string }> {
  const host = imapHost();
  if (!host) return { ok: false, detail: "No IMAP host, and no SMTP_HOST to derive one from." };

  const c = client();
  if (!c) return { ok: false, detail: "Mail credentials are not set on the server." };

  try {
    await c.connect();
    const boxes = await c.list();
    const sent = boxes.find((b) => b.specialUse === "\\Sent")?.path;
    await c.logout().catch(() => c.close());
    return sent
      ? { ok: true, detail: `Connected to ${host}, filing copies in "${sent}".` }
      : {
          ok: false,
          detail: `Connected to ${host}, but no Sent folder was found, so copies cannot be filed.`,
        };
  } catch (err) {
    await c.logout().catch(() => c.close());
    // The message, not the stack: it is read by a person, and it usually
    // says exactly what is wrong — wrong password, host not found, refused.
    return { ok: false, detail: `${host}: ${err instanceof Error ? err.message : String(err)}` };
  }
}

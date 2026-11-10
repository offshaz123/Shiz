import { ImapFlow } from "imapflow";

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

import nodemailer from "nodemailer";
import { listRemindersDue, listTodayByClient, markReminded, type DueReminder } from "./bookings";
import { siteConfig } from "./site-config";

/**
 * The two emails that make the diary worth keeping.
 *
 * The night before, one per job, so a booking cannot be forgotten. And at
 * nine each morning, one email listing the day, so the first thing a
 * business sees is what it is doing today.
 *
 * Email rather than push notifications, and that is a deliberate choice
 * rather than a shortcut. Push needs the person to grant permission, and on
 * iPhone it only works at all once the page has been added to the home
 * screen — so a client who has not done that, which will be most of them on
 * day one, would silently get nothing. Email reaches everybody on every
 * device with no permission and no install, and it is the thing a
 * tradesperson already checks. Push is worth adding on top later; it is not
 * worth depending on first.
 *
 * The night-before send stamps reminded_at, so a job can only ever produce
 * one reminder however many times the job runs. The morning summary has no
 * such stamp and does not need one: it is one email per client per run, and
 * running it twice sends the same list again rather than something wrong.
 */

type Transport = ReturnType<typeof nodemailer.createTransport>;

function transport(): Transport | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function from(): string {
  return process.env.MAIL_FROM || process.env.SMTP_USER || siteConfig.email;
}

function line(job: DueReminder): string {
  const time = job.startsAt ? `${job.startsAt}  ` : "";
  const what = job.job ? ` — ${job.job}` : "";
  return `${time}${job.customerName}${what}`;
}

function byClient(jobs: DueReminder[]): Map<number, DueReminder[]> {
  const grouped = new Map<number, DueReminder[]>();
  for (const job of jobs) {
    const list = grouped.get(job.clientId);
    if (list) list.push(job);
    else grouped.set(job.clientId, [job]);
  }
  return grouped;
}

export type ReminderRun = { clients: number; jobs: number; failed: number };

/**
 * Tomorrow's jobs, one email per client listing them.
 *
 * One email rather than one per job: a plumber with four jobs tomorrow
 * wants to see four, not receive four.
 */
export async function sendTomorrowReminders(): Promise<ReminderRun> {
  const run: ReminderRun = { clients: 0, jobs: 0, failed: 0 };
  const due = await listRemindersDue();
  if (!due || due.length === 0) return run;

  const mail = transport();
  if (!mail) return run;

  for (const [, jobs] of byClient(due)) {
    const client = jobs[0];
    const day = new Date(`${client.bookedOn}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const body = [
      `Hi,`,
      ``,
      jobs.length === 1
        ? `One job booked in for tomorrow, ${day}:`
        : `${jobs.length} jobs booked in for tomorrow, ${day}:`,
      ``,
      ...jobs.map(line),
      ``,
      `Your diary is at ${siteConfig.url}/portal/calendar`,
      ``,
      siteConfig.name,
    ].join("\n");

    try {
      await mail.sendMail({
        from: `"${siteConfig.shortName}" <${from()}>`,
        to: client.clientEmail,
        replyTo: siteConfig.email,
        subject: `Tomorrow: ${jobs.length} job${jobs.length === 1 ? "" : "s"} booked in`,
        text: body,
      });
      // Only after it has actually gone. Stamping first would lose the
      // reminder entirely if the send then failed.
      await markReminded(jobs.map((j) => j.bookingId));
      run.clients += 1;
      run.jobs += jobs.length;
    } catch (err) {
      console.error(`Tomorrow reminder for client ${client.clientId}:`, err);
      run.failed += 1;
    }
  }

  return run;
}

/** Today's jobs, sent each morning. */
export async function sendTodaySummaries(): Promise<ReminderRun> {
  const run: ReminderRun = { clients: 0, jobs: 0, failed: 0 };
  const today = await listTodayByClient();
  if (!today || today.length === 0) return run;

  const mail = transport();
  if (!mail) return run;

  for (const [, jobs] of byClient(today)) {
    const client = jobs[0];
    const body = [
      `Morning,`,
      ``,
      jobs.length === 1 ? `One job today:` : `${jobs.length} jobs today:`,
      ``,
      ...jobs.map(line),
      ``,
      `Full diary: ${siteConfig.url}/portal/calendar`,
      ``,
      siteConfig.name,
    ].join("\n");

    try {
      await mail.sendMail({
        from: `"${siteConfig.shortName}" <${from()}>`,
        to: client.clientEmail,
        replyTo: siteConfig.email,
        subject: `Today: ${jobs.length} job${jobs.length === 1 ? "" : "s"}`,
        text: body,
      });
      run.clients += 1;
      run.jobs += jobs.length;
    } catch (err) {
      console.error(`Today summary for client ${client.clientId}:`, err);
      run.failed += 1;
    }
  }

  return run;
}

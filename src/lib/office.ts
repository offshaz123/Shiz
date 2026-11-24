import type { RowDataPacket } from "mysql2";
import { blogPosts } from "@/content/blog";
import { withDb } from "./db";
import { getCronHealth, type CronHealth } from "./admin-data";
import { getEngineRoom, type Station } from "./engine-room";
import { runHealthChecks } from "./health";
import { whatCouldGoWrong, type Risk } from "./lookahead";
import { isConnected } from "./zadarma";
import { REGION_INFO, type Region } from "./regions";

/**
 * The machinery, drawn as a room with people in it.
 *
 * Walid asked for the automatic jobs to be shown as an office: a desk
 * each, a name over their head, and something to click on to find out
 * what that one is doing. The reason it is worth building is not that
 * it is pretty. Six background jobs described in a table of job names
 * and timestamps is a table nobody opens; six people at desks, one of
 * whom is plainly asleep, is a picture you can read from across the
 * room and immediately want to do something about.
 *
 * The rule that makes it worth having: every worker here is a real job
 * that really runs, and every number under them is counted from the
 * database. What they are doing on screen is decided by what the job is
 * actually doing — the one that has stopped working is the one sitting
 * down doing nothing. A cartoon that cheerfully types away while the
 * job behind it has not run for a week would be worse than no picture
 * at all, because it is the picture you would check instead of
 * checking.
 */

/** What the figure is doing on screen, which follows what the job is doing. */
/** The hairstyles the drawing knows how to do. */
export type Hair = "short" | "crop" | "side" | "long" | "bun" | "ponytail";

export type Doing =
  | "working" // running normally, and has something to get on with
  | "talking" // has something to report
  | "walking" // nothing waiting for it just now
  | "eating" // on a break, nothing due until later
  | "resting" // fine, but with nothing at all to do until its next turn
  | "asleep"; // switched off, or has not run when it should have

/**
 * Resting and stopped are drawn differently on purpose.
 *
 * Both have their eyes shut, and telling them apart is the whole point
 * of the room: resting is a job that is working perfectly and has
 * nothing to do until tonight, stopped is a job that should have run
 * and did not. One is fine and one needs you. So resting gets a normal
 * name tag and faint blue marks, and stopped gets a red tag and red
 * ones — and a glance across the room finds the red.
 */

export type Worker = {
  id: string;
  /** What this one is called. */
  name: string;
  /** The job title over their head. */
  title: string;
  /** The short word on the plate on the floor in front of the desk. */
  floorLabel: string;
  /** How this one is drawn, so fourteen people are not fourteen of
   *  the same person. Set per worker rather than worked out from the
   *  name: a name does not tell you what somebody looks like. */
  hair: Hair;
  doing: Doing;
  /** The one line that goes in the speech bubble and the panel heading. */
  says: string;
  /** The real figure, and what it counts. */
  value: number | null;
  unit: string;
  /** The longer explanation in the panel. */
  does: string;
  /** Where to go to see the work itself. */
  href?: string;
  /** False when this one is not running at all. */
  live: boolean;
  /** Only the one who watches the system: what he has found. */
  risks?: Risk[];
  /** True for the one who sits at the table at the front rather than
   *  at a desk in the rows. */
  atTheTable?: boolean;
};

export type Office = {
  /** Undefined means both countries at once. */
  region?: Region;
  workers: Worker[];
  /** Plain-language summary of the room, for the line above it. */
  summary: string;
};

/** The station ids from the engine room, so a rename is caught by the compiler. */
const DESKS: Record<string, { name: string; title: string; floorLabel: string; hair: Hair }> = {
  finder: { name: "Faisal", title: "Finds businesses", floorLabel: "FINDING", hair: "short" },
  scanner: { name: "Sana", title: "Checks their websites", floorLabel: "SCANNING", hair: "long" },
  postman: { name: "Hamza", title: "Sends the first email", floorLabel: "FIRST EMAIL", hair: "crop" },
  nudger: { name: "Nadia", title: "Sends the follow-ups", floorLabel: "FOLLOW-UPS", hair: "bun" },
  listener: { name: "Layla", title: "Reads the replies", floorLabel: "REPLIES", hair: "side" },
};

/**
 * How a station's real state becomes something to draw.
 *
 * A job that is off is asleep, a job holding something back is talking
 * about it, a job with a queue is working, and a job with an empty queue
 * is up and about. Nothing random: the same state always draws the same
 * way, so a glance at the room twice in a day means something.
 */
function doingFor(station: Station): Doing {
  if (!station.live) return "asleep";

  const state = station.state.toLowerCase();
  if (state.includes("can't") || state.includes("held") || state.includes("never")) {
    return "talking";
  }
  if (/\d/.test(state) && !state.includes("nothing")) return "working";
  // "nothing waiting", "nothing sent today" — running fine, no work in
  // front of it. That is a rest, not a wander.
  if (state.includes("nothing")) return "resting";
  return "walking";
}

/**
 * Everything else the site does on its own, counted in one go.
 *
 * One query rather than nine, because this page refreshes itself every
 * minute and nine round trips a minute to shared hosting is a cost with
 * nothing to show for it.
 */
type Tallies = {
  enquiries: number;
  enquiries_week: number;
  lead_emails: number;
  bookings: number;
  reminded: number;
  reviews: number;
  invoices: number;
  unpaid: number;
  calls: number;
  calls_week: number;
  views_week: number;
};

async function tallies(): Promise<Tallies | null> {
  return withDb(async (db) => {
    const [[row]] = await db.query<(RowDataPacket & Tallies)[]>(
      `SELECT
         (SELECT COUNT(*) FROM scan_leads) AS enquiries,
         (SELECT COUNT(*) FROM scan_leads
           WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS enquiries_week,
         (SELECT COUNT(*) FROM lead_emails WHERE status = 'sent') AS lead_emails,
         (SELECT COUNT(*) FROM client_bookings) AS bookings,
         (SELECT COUNT(*) FROM client_bookings WHERE reminded_at IS NOT NULL) AS reminded,
         (SELECT COUNT(*) FROM reviews WHERE status = 'approved') AS reviews,
         (SELECT COUNT(*) FROM client_invoices WHERE kind = 'invoice') AS invoices,
         (SELECT COUNT(*) FROM client_invoices
           WHERE kind = 'invoice' AND paid_at IS NULL) AS unpaid,
         (SELECT COUNT(*) FROM prospect_calls) AS calls,
         (SELECT COUNT(*) FROM prospect_calls
           WHERE called_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS calls_week,
         (SELECT COUNT(*) FROM page_views
           WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS views_week`,
    );
    return row;
  });
}

/** A job whose state is a cron that either ran recently or did not. */
function fromCron(health: CronHealth | null, neverRun: string): { doing: Doing; says: string } {
  if (!health || health.lastRunAt === null) return { doing: "asleep", says: neverRun };
  const hours = health.hoursSince ?? 0;
  if (hours > 48) return { doing: "asleep", says: `nothing for ${Math.floor(hours / 24)} days` };
  if (health.sentLast7Days > 0) {
    return { doing: "working", says: `${health.sentLast7Days} sent this week` };
  }
  return { doing: "walking", says: `ran ${hours}h ago, nothing due` };
}

export async function getOffice(region?: Region): Promise<Office> {
  const [engine, checks, counts, reviewCron, diaryCron, risks] = await Promise.all([
    getEngineRoom(region),
    runHealthChecks(),
    tallies(),
    getCronHealth("review-requests"),
    getCronHealth("reminders-tomorrow"),
    whatCouldGoWrong(),
  ]);

  // No database, no room. Drawing seven cheerful figures over figures we
  // could not read would be the one thing this page must never do.
  const workers: Worker[] = (engine?.stations ?? []).map((station) => {
    const desk = DESKS[station.id] ?? {
      name: station.name,
      title: station.does,
      floorLabel: station.name.toUpperCase(),
      hair: "short" as Hair,
    };
    return {
      id: station.id,
      name: desk.name,
      title: desk.title,
      floorLabel: desk.floorLabel,
      hair: desk.hair,
      doing: doingFor(station),
      says: station.state,
      value: station.value,
      unit: station.unit,
      does: station.does,
      href: station.href,
      live: station.live,
    };
  });

  // The writer. Not a job on this server — the posts are written to the
  // repository and go out with a deploy — so what is shown is the one
  // thing that is true either way: when the newest post is dated. A
  // worker drawn as busy because a job is "scheduled somewhere else"
  // would be the room telling a story nobody here can check.
  const newest = blogPosts
    .map((post) => post.publishedAt)
    .sort()
    .reverse()[0];
  const daysSincePost = newest
    ? Math.floor((Date.now() - new Date(`${newest}T12:00:00Z`).getTime()) / 86_400_000)
    : null;

  workers.splice(2, 0, {
    id: "writer",
    floorLabel: "BLOG",
    name: "Yusuf",
    hair: "crop",
    title: "Writes the blog",
    doing:
      daysSincePost === null
        ? "asleep"
        : daysSincePost <= 1
          ? "working"
          : daysSincePost <= 7
            ? "walking"
            : "eating",
    says:
      daysSincePost === null
        ? "nothing published yet"
        : daysSincePost === 0
          ? "posted today"
          : daysSincePost === 1
            ? "posted yesterday"
            : `${daysSincePost} days since the last one`,
    value: blogPosts.length,
    unit: "posts published",
    does: "writes a post for the site, one a day, each answering a question somebody actually asks",
    href: "/blog",
    live: true,
  });

  // The caretaker, whose state is the system check itself: anything
  // failing and he is on his feet about it.
  const failing = checks.filter((c) => c.state === "fail");
  const bad = risks.filter((r) => r.level === "bad");
  const ahead = risks.filter((r) => r.when === "tomorrow");

  // He sits at the table at the front rather than in the rows, facing
  // the room, because his job is the room rather than a queue of his
  // own. He is also the only one who looks forward: everybody else
  // reports what they have done, he reports what is about to go wrong.
  workers.push({
    id: "caretaker",
    floorLabel: "FRONT DESK",
    name: "Bilal",
    hair: "short",
    title: "Watches for trouble",
    doing:
      failing.length > 0 || bad.length > 0 ? "talking" : risks.length > 0 ? "working" : "walking",
    says:
      failing.length > 0
        ? `${failing[0].name} is broken`
        : bad.length > 0
          ? bad[0].title
          : ahead.length > 0
            ? `${ahead.length} thing${ahead.length === 1 ? "" : "s"} to watch for tomorrow`
            : "nothing coming that I can see",
    value: risks.length,
    unit: risks.length === 1 ? "thing on his list" : "things on his list",
    does: "walks the whole system looking for what is broken now and what will break tomorrow — an empty call list, a missed callback, a job that has quietly stopped, a budget running out",
    href: "/admin/health",
    live: true,
    risks,
    atTheTable: true,
  });

  // The rest of the room.
  //
  // The engine room only ever described the cold outreach, because that
  // is what it was built to watch. The site does a good deal more than
  // that on its own — it answers enquiries, chases them, takes
  // bookings, reminds people about them, asks for reviews, raises
  // invoices, places calls and tells search engines when something
  // changed — and all of it was running with nobody drawn against it.
  const n = (v: number | undefined) => (counts ? Number(v ?? 0) : null);

  const review = fromCron(reviewCron, "has never asked anybody for a review");
  const diary = fromCron(diaryCron, "the reminder job has never run");

  workers.push(
    {
      id: "receptionist",
    floorLabel: "ENQUIRIES",
      name: "Amina",
    hair: "ponytail",
      title: "Takes the enquiries",
      doing: (counts?.enquiries_week ?? 0) > 0 ? "working" : "walking",
      says:
        counts === null
          ? "can't read the database"
          : counts.enquiries_week > 0
            ? `${counts.enquiries_week} this week`
            : "nothing in this week",
      value: n(counts?.enquiries),
      unit: "enquiries taken",
      does: "catches every scan and contact form on the site and answers it straight away",
      href: "/admin/leads",
      live: counts !== null,
    },
    {
      id: "chaser",
    floorLabel: "CHASING",
      name: "Imran",
    hair: "crop",
      title: "Chases the enquiries",
      doing: (counts?.lead_emails ?? 0) > 0 ? "working" : "resting",
      says:
        counts === null
          ? "can't read the database"
          : counts.lead_emails > 0
            ? `${counts.lead_emails} follow-ups sent`
            : "nobody to chase yet",
      value: n(counts?.lead_emails),
      unit: "follow-ups sent",
      does: "sends the day 1, day 3 and day 6 emails to anybody who enquired and went quiet",
      href: "/admin/leads",
      live: counts !== null,
    },
    {
      id: "switchboard",
    floorLabel: "CALLS",
      name: "Zara",
    hair: "long",
      title: "Puts the calls through",
      doing: !isConnected() ? "asleep" : (counts?.calls_week ?? 0) > 0 ? "working" : "walking",
      says: !isConnected()
        ? "the phone system is not connected"
        : counts === null
          ? "can't read the database"
          : counts.calls_week > 0
            ? `${counts.calls_week} calls this week`
            : "no calls this week",
      value: n(counts?.calls),
      unit: "calls logged",
      does: "rings a business when somebody presses Call, and writes down how long it lasted",
      href: "/admin/prospects",
      live: isConnected(),
    },
    {
      id: "diary",
    floorLabel: "DIARY",
      name: "Rania",
    hair: "bun",
      title: "Minds the diary",
      doing: diary.doing,
      says: counts?.bookings === 0 ? "no bookings in the diary yet" : diary.says,
      value: n(counts?.bookings),
      unit: "bookings taken",
      does: "reminds people about a booking the day before and again on the morning",
      href: "/admin/clients",
      live: diary.doing !== "asleep",
    },
    {
      id: "reviewer",
    floorLabel: "REVIEWS",
      name: "Tariq",
    hair: "short",
      title: "Asks for reviews",
      doing: review.doing,
      says: review.says,
      value: n(counts?.reviews),
      unit: "reviews collected",
      does: "asks a customer for a review once the job is done, and never twice",
      href: "/admin/clients",
      live: review.doing !== "asleep",
    },
    {
      id: "bookkeeper",
    floorLabel: "INVOICES",
      name: "Saleem",
    hair: "crop",
      title: "Does the invoices",
      doing:
        counts === null
          ? "asleep"
          : counts.unpaid > 0
            ? "talking"
            : counts.invoices > 0
              ? "working"
              : "resting",
      says:
        counts === null
          ? "can't read the database"
          : counts.unpaid > 0
            ? `${counts.unpaid} invoice${counts.unpaid === 1 ? "" : "s"} unpaid`
            : counts.invoices > 0
              ? "everything paid"
              : "nothing raised yet",
      value: n(counts?.invoices),
      unit: "invoices raised",
      does: "raises quotes and invoices, and keeps track of which ones are still owed",
      href: "/admin/clients",
      live: counts !== null,
    },
    {
      id: "analyst",
    floorLabel: "VISITORS",
      name: "Hira",
    hair: "side",
      title: "Watches the visitors",
      doing: (counts?.views_week ?? 0) > 0 ? "working" : "walking",
      says:
        counts === null
          ? "can't read the database"
          : counts.views_week > 0
            ? `${counts.views_week} page views this week`
            : "nobody on the site this week",
      value: n(counts?.views_week),
      unit: "page views this week",
      does: "counts who comes to the site, where from, and which pages they read",
      href: "/admin",
      live: counts !== null,
    },
  );

  // Busiest at the front.
  //
  // Every value here is a count of things that one has handled, so they
  // can be put in order against each other without inventing a score:
  // the one that has dealt with the most sits at the front of the room.
  // A job we could not read a number for goes to the back rather than
  // being given a nought it has not earned.
  workers.sort((a, b) => {
    // The one at the table is not in the running for a desk.
    if (a.atTheTable) return 1;
    if (b.atTheTable) return -1;
    return (b.value ?? -1) - (a.value ?? -1);
  });

  const asleep = workers.filter((w) => w.doing === "asleep");
  const shouting = workers.filter((w) => w.doing === "talking");

  const summary =
    bad.length > 0
      ? `Bilal has found something: ${bad[0].title.toLowerCase()}.`
      :
    asleep.length > 0
      ? `${asleep.map((w) => w.name).join(" and ")} ${asleep.length === 1 ? "is" : "are"} not running. Press them to see why.`
      : shouting.length > 0
        ? `${shouting.map((w) => w.name).join(" and ")} ${shouting.length === 1 ? "has" : "have"} something to tell you.`
        : region
          ? `Everybody is working. This is the ${REGION_INFO[region].name} side of the room.`
          : "Everybody is working, across both countries.";

  return { region, workers, summary };
}

import type { ClientLead, ClientSummary, MonthPoint } from "./clients";

/**
 * What a client's page shows before they have any figures of their own.
 *
 * A brand new client logs in the day they sign and sees nothing, which
 * makes the thing they are paying for look broken on the one day they are
 * most interested in it. Walid's call, and he is right: show the shape of
 * it, so they know what is coming.
 *
 * The whole risk of doing that is a client mistaking these for their own
 * numbers, screenshotting them, or quoting them back. So this is never
 * shown quietly. The page it appears on carries a band across the top
 * before any figure is readable, every number is visibly in example mode,
 * and there is a line at the bottom saying when the real ones arrive. The
 * moment a single genuine enquiry exists, none of this is used again.
 *
 * The figures are deliberately ordinary. Nothing here is a real client's
 * data and nothing is flattering enough to set an expectation: a modest
 * month that looks like a modest month.
 */

const SAMPLE_MONTH = (() => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
})();

export const sampleSummary: ClientSummary = {
  month: SAMPLE_MONTH,
  leads: 24,
  bySource: [
    { source: "google", leads: 14 },
    { source: "meta", leads: 6 },
    { source: "maps", leads: 3 },
    { source: "website", leads: 1 },
  ],
  customers: 5,
  spend: 480,
  costPerLead: 20,
  medianHoursToReply: 2,
  answered: 21,
  wonValue: 3250,
  openValue: 1870,
  returnOnSpend: 6.8,
};

export const sampleTrend: MonthPoint[] = (() => {
  const counts = [9, 13, 16, 15, 21, 24];
  const customers = [1, 2, 3, 3, 4, 5];
  const spend = [300, 360, 420, 420, 480, 480];
  const now = new Date();

  return counts.map((leads, i) => {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1));
    return {
      month: `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}-01`,
      leads,
      customers: customers[i],
      spend: spend[i],
    };
  });
})();

/**
 * Example enquiries.
 *
 * Names and numbers are obviously not real on purpose: 07700 900xxx is the
 * range Ofcom reserves for drama and examples, so it can never reach a
 * person, and nobody can ring one of these by mistake.
 */
export const sampleLeads: ClientLead[] = [
  {
    id: -1,
    name: "Example enquiry",
    email: "example@example.com",
    phone: "07700 900123",
    message: "This is what an enquiry looks like when it arrives. Yours will show here instead.",
    source: "google",
    status: "customer",
    value: 850,
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    firstRepliedAt: new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    hoursToReply: 1,
  },
  {
    id: -2,
    name: "Example enquiry",
    email: "",
    phone: "07700 900456",
    message: "Somebody who rang rather than filled anything in.",
    source: "maps",
    status: "new",
    value: null,
    createdAt: new Date(Date.now() - 30 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    firstRepliedAt: null,
    hoursToReply: null,
  },
  {
    id: -3,
    name: "Example enquiry",
    email: "example@example.com",
    phone: "",
    message: "An enquiry from a Facebook or Instagram ad.",
    source: "meta",
    status: "quoted",
    value: 420,
    createdAt: new Date(Date.now() - 52 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    firstRepliedAt: new Date(Date.now() - 50 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    hoursToReply: 2,
  },
];

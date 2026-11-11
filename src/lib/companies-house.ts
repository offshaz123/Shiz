/**
 * Companies House, the official register.
 *
 * Free, no quota to speak of, and the only source that answers the question
 * the call list cannot: is this business a limited company, or a person
 * trading under a name? That is not trivia. Under PECR a limited company can
 * be emailed a sequence lawfully with an opt-out, and a sole trader counts as
 * an individual and cannot. Until now that was a judgement made by looking at
 * the name and hoping.
 *
 * It answers useful things besides: how long they have been going, whether
 * they are still active, what they say they do, and whether their accounts
 * are overdue — a company filing late is a company with its mind elsewhere.
 *
 * Deliberately its own corner of the admin rather than bolted onto a prospect
 * row. The register is about a legal entity; the call list is about a
 * business with a shop front, and the two do not always line up — plenty of
 * trades are a person, and plenty of listings are one of several companies at
 * the same address. Presenting a guess at the match as fact would be worse
 * than making somebody look.
 */

const API = "https://api.company-information.service.gov.uk";

export type CompanyHit = {
  number: string;
  title: string;
  status: string;
  kind: string;
  address: string;
  incorporatedOn: string;
};

export type CompanyDetail = CompanyHit & {
  sic: string[];
  accountsNextDue: string;
  accountsOverdue: boolean;
  confirmationNextDue: string;
  officers: { name: string; role: string; appointedOn: string; resigned: boolean }[];
};

export type ChResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "no_key" | "rejected" | "rate_limited" | "not_found" | "error" };

function authHeader(): string | null {
  const key = process.env.COMPANIES_HOUSE_KEY;
  // Basic auth with the key as the username and an empty password, which is
  // how Companies House does it rather than a bearer token.
  return key ? `Basic ${Buffer.from(`${key}:`).toString("base64")}` : null;
}

async function call<T>(path: string): Promise<ChResult<T>> {
  const auth = authHeader();
  if (!auth) return { ok: false, reason: "no_key" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: auth, Accept: "application/json" },
      signal: controller.signal,
    });
    if (res.status === 401 || res.status === 403) return { ok: false, reason: "rejected" };
    if (res.status === 404) return { ok: false, reason: "not_found" };
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok) return { ok: false, reason: "error" };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, reason: "error" };
  } finally {
    clearTimeout(timer);
  }
}

type RawAddress = {
  address_line_1?: string;
  address_line_2?: string;
  locality?: string;
  postal_code?: string;
};

function address(a: RawAddress = {}): string {
  return [a.address_line_1, a.address_line_2, a.locality, a.postal_code].filter(Boolean).join(", ");
}

type RawSearchItem = {
  company_number?: string;
  title?: string;
  company_status?: string;
  company_type?: string;
  address?: RawAddress;
  date_of_creation?: string;
};

/** What the register calls each company type, in words a person would use. */
const KIND: Record<string, string> = {
  ltd: "Limited company",
  plc: "Public limited company",
  llp: "Limited liability partnership",
  "private-limited-guarant-nsc": "Company limited by guarantee",
  "private-limited-guarant-nsc-limited-exemption": "Company limited by guarantee",
  "private-unlimited": "Unlimited company",
  "limited-partnership": "Limited partnership",
  "registered-society-non-jurisdictional": "Registered society",
  "charitable-incorporated-organisation": "Charity",
};

export function kindOf(raw: string | undefined): string {
  if (!raw) return "Unknown";
  return KIND[raw] ?? raw.replace(/-/g, " ");
}

export async function searchCompanies(query: string): Promise<ChResult<CompanyHit[]>> {
  const q = query.trim().slice(0, 120);
  if (!q) return { ok: true, data: [] };

  const result = await call<{ items?: RawSearchItem[] }>(
    `/search/companies?q=${encodeURIComponent(q)}&items_per_page=12`,
  );
  if (!result.ok) return result;

  return {
    ok: true,
    data: (result.data.items ?? []).map((item) => ({
      number: item.company_number ?? "",
      title: item.title ?? "",
      status: item.company_status ?? "",
      kind: kindOf(item.company_type),
      address: address(item.address),
      incorporatedOn: item.date_of_creation ?? "",
    })),
  };
}

type RawProfile = {
  company_number?: string;
  company_name?: string;
  company_status?: string;
  type?: string;
  registered_office_address?: RawAddress;
  date_of_creation?: string;
  sic_codes?: string[];
  accounts?: { next_due?: string; overdue?: boolean };
  confirmation_statement?: { next_due?: string };
};

type RawOfficers = {
  items?: {
    name?: string;
    officer_role?: string;
    appointed_on?: string;
    resigned_on?: string;
  }[];
};

export async function companyProfile(number: string): Promise<ChResult<CompanyDetail>> {
  const clean = number.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  if (!clean) return { ok: false, reason: "not_found" };

  const profile = await call<RawProfile>(`/company/${clean}`);
  if (!profile.ok) return profile;

  // Officers are a second request and a nicety, so a failure there loses the
  // list of names rather than the whole company.
  const officers = await call<RawOfficers>(`/company/${clean}/officers?items_per_page=20`);

  const p = profile.data;
  return {
    ok: true,
    data: {
      number: p.company_number ?? clean,
      title: p.company_name ?? "",
      status: p.company_status ?? "",
      kind: kindOf(p.type),
      address: address(p.registered_office_address),
      incorporatedOn: p.date_of_creation ?? "",
      sic: p.sic_codes ?? [],
      accountsNextDue: p.accounts?.next_due ?? "",
      accountsOverdue: Boolean(p.accounts?.overdue),
      confirmationNextDue: p.confirmation_statement?.next_due ?? "",
      officers: (officers.ok ? (officers.data.items ?? []) : [])
        .filter((o) => !o.resigned_on)
        .map((o) => ({
          name: o.name ?? "",
          role: (o.officer_role ?? "").replace(/-/g, " "),
          appointedOn: o.appointed_on ?? "",
          resigned: Boolean(o.resigned_on),
        })),
    },
  };
}

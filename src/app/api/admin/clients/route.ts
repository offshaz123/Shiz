import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import {
  createClient,
  listClients,
  setClientActive,
  setClientPassword,
  setClientBranding,
  setClientTrade,
  setClientReviews,
  setClientSpend,
  setDefaultLeadValue,
} from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Managing the people who pay us: creating them, resetting a password,
 * switching one off, and recording what they spent on advertising.
 *
 * Admin only, checked on every method. These are other businesses' logins
 * and other businesses' figures.
 */

async function guard() {
  return (await isAdmin()) ? null : NextResponse.json({ error: "unauthorised" }, { status: 401 });
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const clients = await listClients();
  return clients === null
    ? NextResponse.json({ error: "no_database" }, { status: 503 })
    : NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const name = typeof body?.name === "string" ? body.name : "";
  const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (password.length < 8) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  const id = await createClient({ slug, name, contactEmail, password });
  // A duplicate slug lands here too, since the unique key rejects it and
  // withDb turns the throw into null. Saying so is more useful than a 500.
  return id
    ? NextResponse.json({ id })
    : NextResponse.json({ error: "not_created" }, { status: 400 });
}

export async function PATCH(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  if (typeof body?.password === "string") {
    const ok = await setClientPassword(id, body.password);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  if (typeof body?.isActive === "boolean") {
    const ok = await setClientActive(id, body.isActive);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_saved" }, { status: 503 });
  }

  if (typeof body?.trade === "string") {
    const ok = await setClientTrade(id, body.trade);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "not_changed" }, { status: 400 });
  }

  if (
    typeof body?.logoUrl === "string" ||
    typeof body?.autoReplyOn === "boolean" ||
    typeof body?.autoReplyText === "string"
  ) {
    const ok = await setClientBranding(id, {
      logoUrl: typeof body?.logoUrl === "string" ? body.logoUrl : undefined,
      autoReplyOn: typeof body?.autoReplyOn === "boolean" ? body.autoReplyOn : undefined,
      autoReplyText: typeof body?.autoReplyText === "string" ? body.autoReplyText : undefined,
    });
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "bad_branding" }, { status: 400 });
  }

  if (body?.defaultLeadValue !== undefined) {
    const raw = body.defaultLeadValue;
    const value = raw === null || raw === "" ? null : Number(raw);
    const ok = await setDefaultLeadValue(id, value);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "bad_value" }, { status: 400 });
  }

  if (typeof body?.reviewLink === "string" || typeof body?.reviewRequestsOn === "boolean") {
    const ok = await setClientReviews(id, {
      reviewLink: typeof body?.reviewLink === "string" ? body.reviewLink : undefined,
      reviewRequestsOn:
        typeof body?.reviewRequestsOn === "boolean" ? body.reviewRequestsOn : undefined,
    });
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "bad_review_link" }, { status: 400 });
  }

  if (typeof body?.month === "string") {
    const ok = await setClientSpend(
      id,
      body.month,
      typeof body?.channel === "string" ? body.channel : "google",
      Number(body?.amount),
    );
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "bad_spend" }, { status: 400 });
  }

  return NextResponse.json({ error: "nothing_to_do" }, { status: 400 });
}

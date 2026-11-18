import { NextResponse } from "next/server";
import { currentClient } from "@/lib/client-auth";
import {
  createBooking,
  deleteBooking,
  listBookingsBetween,
  listBookingsForMonth,
  updateBookingStatus,
} from "@/lib/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The client's diary, read and written by the client themselves.
 *
 * Every handler starts from currentClient() and passes that id into the
 * query. The id is never taken from the request, so there is no parameter
 * anybody can change to reach another business's diary.
 */

async function who() {
  const client = await currentClient();
  return client ?? null;
}

export async function GET(request: Request) {
  const client = await who();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const from = params.get("from");
  const to = params.get("to");

  // A week straddles two months, so the week view asks for a range while
  // the month grid still asks for a month.
  const bookings =
    from && to
      ? await listBookingsBetween(client.id, from, to)
      : await listBookingsForMonth(client.id, params.get("month") ?? "");

  return bookings === null
    ? NextResponse.json({ error: "bad_dates" }, { status: 400 })
    : NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const client = await who();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const text = (name: string) =>
    typeof body?.[name] === "string" ? (body[name] as string) : "";
  const number = (name: string) => {
    const value = Number(body?.[name]);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const id = await createBooking(client.id, {
    customerName: text("customerName"),
    phone: text("phone"),
    email: text("email"),
    job: text("job"),
    notes: text("notes"),
    bookedOn: text("bookedOn"),
    startsAt: text("startsAt"),
    durationMinutes: number("durationMinutes"),
    price: number("price"),
    leadId: number("leadId"),
  });

  return id
    ? NextResponse.json({ id })
    : NextResponse.json({ error: "not_saved" }, { status: 400 });
}

export async function PATCH(request: Request) {
  const client = await who();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  const status = typeof body?.status === "string" ? body.status : "";
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  const ok = await updateBookingStatus(client.id, id, status);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "not_saved" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const client = await who();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  const ok = await deleteBooking(client.id, id);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}

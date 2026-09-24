import { NextResponse } from "next/server";
import { publicUser, StorageError, updateProfile, type Address } from "@/lib/auth";
import { currentUser } from "@/lib/session";

const str = (value: unknown, max: number) =>
  typeof value === "string" ? value.slice(0, max) : "";

export async function PATCH(request: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const firstName = str(body.firstName, 80).trim();
  const lastName = str(body.lastName, 80).trim();
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
  }

  const a = (body.address ?? {}) as Record<string, unknown>;
  const address: Address = {
    line1: str(a.line1, 120).trim(),
    line2: str(a.line2, 120).trim(),
    city: str(a.city, 80).trim(),
    postcode: str(a.postcode, 20).trim(),
    country: str(a.country, 80).trim(),
  };

  try {
    // The email is not in the patch on purpose. Changing it is a change of
    // identity — it would need the new address verified before it takes
    // effect, or an account can be moved to someone else's inbox.
    // Clamped rather than trusted: this drives a figure shown back to the
    // person, and a negative or absurd number would render as nonsense.
    const rawVolume = Number(body.monthlyVolume);
    const monthlyVolume =
      Number.isFinite(rawVolume) && rawVolume > 0 ? Math.min(Math.round(rawVolume), 100_000_000) : 0;

    const updated = await updateProfile(me.id, {
      monthlyVolume,
      firstName,
      lastName,
      phone: str(body.phone, 40).trim(),
      company: str(body.company, 120).trim(),
      address,
    });
    if (!updated) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    return NextResponse.json({ user: publicUser(updated) });
  } catch (err) {
    if (err instanceof StorageError) {
      console.error(`Profile update: ${err.message}`, err.cause);
      return NextResponse.json({ error: "We could not save that just now." }, { status: 500 });
    }
    throw err;
  }
}

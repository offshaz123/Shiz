import { NextResponse } from "next/server";
import { currentClient } from "@/lib/client-auth";
import { MAX_LOGO_BYTES, deleteLogo, saveLogo } from "@/lib/client-logo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A client uploading their own logo.
 *
 * The client id comes from the session, never from the request, so there
 * is no field anybody can set to overwrite another business's logo.
 *
 * The browser shrinks the picture before it gets here, which matters
 * because the file is usually a photo off a phone and the limit below is
 * a tenth of what one of those weighs. The limit is still checked here:
 * what the browser does is a convenience, not a guarantee.
 */
export async function POST(request: Request) {
  const client = await currentClient();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("logo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  if (file.size > MAX_LOGO_BYTES) {
    return NextResponse.json({ error: "too_big" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const saved = await saveLogo(client.id, bytes);
  return saved.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: saved.reason }, { status: 400 });
}

export async function DELETE() {
  const client = await currentClient();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const done = await deleteLogo(client.id);
  return done
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "not_removed" }, { status: 400 });
}

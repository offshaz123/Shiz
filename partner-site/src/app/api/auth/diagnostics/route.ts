import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { dataFile } from "@/lib/auth";

/**
 * Why the account store will not write.
 *
 * A signup failure tells the visitor the server has nowhere to put the
 * account, and logs the path and errno — but reaching a Node log on shared
 * hosting is its own errand. This answers the same question over HTTP.
 *
 * It is NOT public. It describes the filesystem, so it is gated on a header
 * carrying AUTH_SECRET, compared in constant time, and anything without a
 * valid one gets a plain 404 rather than a 401 — an endpoint that denies you
 * has told you it exists.
 *
 *   curl -H "x-diagnostics-token: $AUTH_SECRET" https://ovaropay.com/api/auth/diagnostics
 *
 * The token is sent as a header, not a query string, so it does not end up in
 * access logs or browser history.
 */

const notFound = () => new NextResponse("Not found", { status: 404 });

export async function GET(request: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return notFound();

  const given = request.headers.get("x-diagnostics-token") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return notFound();

  const file = dataFile();
  const dir = path.dirname(file);

  async function check(target: string) {
    try {
      const stat = await fs.stat(target);
      return { exists: true, isDirectory: stat.isDirectory(), mode: (stat.mode & 0o777).toString(8) };
    } catch (err) {
      return { exists: false, error: (err as NodeJS.ErrnoException).code ?? String(err) };
    }
  }

  // The real question: can this process actually create a file there?
  let probe: { ok: boolean; error?: string };
  const temp = path.join(dir, `.probe-${Date.now()}`);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(temp, "probe", "utf8");
    await fs.rm(temp, { force: true });
    probe = { ok: true };
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    probe = { ok: false, error: `${e.code ?? "unknown"}: ${e.message}` };
  }

  return NextResponse.json({
    AUTH_DATA_DIR_set: Boolean(process.env.AUTH_DATA_DIR),
    AUTH_DATA_DIR_value: process.env.AUTH_DATA_DIR ?? "(unset — defaulting to .data beside the app)",
    resolvedStorePath: file,
    storeDirectory: dir,
    directory: await check(dir),
    storeFile: await check(file),
    canWriteHere: probe,
    processCwd: process.cwd(),
    processUid: typeof process.getuid === "function" ? process.getuid() : "n/a",
    homedir: os.homedir(),
    platform: process.platform,
  });
}

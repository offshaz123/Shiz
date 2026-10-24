import { createHmac, createHash, timingSafeEqual } from "node:crypto";

/**
 * Signed one-way references to a lead.
 *
 * Two places need to point at a row from outside: the browser finishing a
 * scan, and an unsubscribe link in an email. Both would otherwise need the
 * row id in the clear, and the ids are sequential — anyone could count up
 * through them and overwrite other people's audits or unsubscribe strangers.
 *
 * So each is a signed token with a purpose baked into the signature. A token
 * minted to attach a scan result cannot be replayed as an unsubscribe, and
 * neither can be forged without the key.
 */

type Purpose = "result" | "unsubscribe";

function key(): string | null {
  const value = process.env.CRON_SECRET;
  return value && value.length >= 16 ? value : null;
}

function signature(purpose: Purpose, id: number, secret: string): string {
  return createHmac("sha256", secret).update(`${purpose}:${id}`).digest("hex").slice(0, 32);
}

export function mintToken(purpose: Purpose, id: number): string | null {
  const secret = key();
  if (!secret) return null;
  return `${id}.${signature(purpose, id, secret)}`;
}

/** Returns the lead id a token refers to, or null if it doesn't verify. */
export function readToken(purpose: Purpose, token: string): number | null {
  const secret = key();
  if (!secret) return null;

  const [idPart, provided] = token.split(".");
  const id = Number(idPart);
  if (!idPart || !provided || !Number.isInteger(id) || id <= 0) return null;

  const expected = signature(purpose, id, secret);
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b) ? id : null;
}

// Spots a likely typo in a common email domain ("gmial.com", "hotmail.co")
// so checkout can ask "Did you mean …?". Order emails to a mistyped address
// bounce and the customer never hears from us.

const DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "live.co.uk",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "icloud.com",
  "me.com",
  "aol.com",
  "btinternet.com",
  "sky.com",
  "virginmedia.com",
  "talktalk.net",
  "protonmail.com",
  // Real addresses that are close to the ones above, so they're never "corrected".
  "mac.com",
  "ymail.com",
  "gmx.com",
  "gmx.co.uk",
  "aol.co.uk",
  "proton.me",
];

// How many single-letter changes turn one word into the other.
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length];
}

// The corrected address, or null if it looks fine (or isn't close to a common one).
export function suggestEmail(email: string): string | null {
  const at = email.trim().toLowerCase().lastIndexOf("@");
  if (at < 1) return null;
  const local = email.trim().slice(0, at);
  const domain = email.trim().toLowerCase().slice(at + 1);
  if (!domain || DOMAINS.includes(domain)) return null;
  let best: string | null = null;
  let bestScore = 3;
  for (const d of DOMAINS) {
    const score = distance(domain, d);
    if (score < bestScore) {
      best = d;
      bestScore = score;
    }
  }
  return best ? `${local}@${best}` : null;
}

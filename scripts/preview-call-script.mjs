// Prints the call script for a few shapes of prospect, so the words can be
// read as a person would read them rather than reviewed as source.
import { callScript } from "../src/lib/call-script.ts";

const base = {
  id: 1, name: "Barking Detailing", phone: "020 1234 5678", email: "info@x.co.uk",
  website: "https://x.co.uk", reviews: 14, rating: 4.6, industry: "automotive",
  findings: [{ label: "Tappable phone number", why: "" }, { label: "Enquiry form", why: "" }],
};

const cases = [
  ["A scanned site with problems, never emailed", { ...base }, 0],
  ["No website at all", { ...base, name: "Romford Mobile Valeting", website: "", findings: [] }, 0],
  ["Had all three emails, no reply", { ...base }, 3],
];

for (const [title, p, sent] of cases) {
  const s = callScript(p, sent);
  console.log("=".repeat(76));
  console.log(title.toUpperCase());
  console.log("Reason:", s.reason);
  console.log("-".repeat(76));
  s.sections.forEach((sec, i) => {
    console.log(`${i + 1}. ${sec.heading}`);
    if (sec.say) console.log(`   "${sec.say}"`);
    console.log();
  });
  console.log("   OBJECTIONS");
  s.objections.forEach((o) => console.log(`   - "${o.they}"\n     "${o.you}"\n`));
}

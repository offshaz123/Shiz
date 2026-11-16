// Prints the three outreach emails exactly as a prospect receives them, so
// the copy can be read rather than reviewed as a diff.
import { buildDraft } from "../src/lib/prospect-outreach.ts";

const prospect = {
  id: 1,
  name: "Barking Detailing",
  findings: [
    { label: "Tappable phone number", why: "" },
    { label: "Enquiry form", why: "" },
    { label: "Meta Pixel", why: "" },
  ],
};

for (const step of [1, 2, 3]) {
  const draft = buildDraft(step, prospect, "https://shazmarketing.com/unsubscribe?p=1&t=example");
  console.log("=".repeat(74));
  console.log(`STEP ${step}`);
  console.log("SUBJECT:", draft.subject);
  console.log("-".repeat(74));
  console.log(draft.body);
  console.log();
}

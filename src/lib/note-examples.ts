import type { CallOutcome } from "./prospect-types";

/**
 * What a good note looks like, shown next to the box.
 *
 * The box used to say "what they said, who you spoke to, anything the
 * next person needs", which describes a note without showing one.
 * Somebody in a hurry reads that as a form to get past, types "spoke to
 * him", and the next person to open that business learns nothing.
 *
 * An example is a different instruction. It shows the length, the
 * shape, and the three things that make a note worth having: who, what
 * they actually said, and what happens next.
 *
 * Shown beside the box and never inside it. A placeholder that looks
 * like a real note is a note somebody saves by accident, and a made-up
 * conversation in the record is worse than no record.
 */
export function exampleNote(outcome: CallOutcome): string {
  switch (outcome) {
    case "spoke":
      return "Spoke to Dave, he owns it. Two vans, wants a third. Says the website was done by his nephew years ago and he knows it is bad. Asked for a price by email.";
    case "call-back":
      return "Spoke to Dave. He is on a job until Thursday, said ring him after 2pm when he is back at the yard.";
    case "no-answer":
      return "Rang twice, no answer either time. Tried the mobile off their website as well.";
    case "voicemail":
      return "Left a voicemail. Said who I was, that I had looked at their website, and asked him to ring back.";
    case "gatekeeper":
      return "Got the receptionist, she would not put me through. Owner is called Mark, she said he is in on Tuesdays and reads the info@ address himself.";
    case "wrong-number":
      return "A taxi firm picked up. Not them, the number on their listing is out of date.";
    case "bad-number":
      return "Rings out to a fax tone, tried twice. No other number on their site.";
    case "not-interested":
      return "Spoke to the owner. His son in law does the website and he is happy with it. Said not to ring again, so I will not.";
  }
}

/** The one-line nudge above the example. */
export const NOTE_RULE =
  "Who you spoke to, what they actually said, and what happens next.";

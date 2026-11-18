// Checks the MX guard against the addresses from this morning's real send.
import { domainAcceptsMail } from "../src/lib/mx-check.ts";

const bounced = ["info@refinedrides.com", "info@ogcarworld.co.uk"];
const delivered = [
  "info@tracgroup.co.uk", "mrcarzltd@hotmail.com", "sales@iautoworks.co.uk",
  "info@tenmods.com", "info@narcoworks.com", "sales@thamespc.co.uk",
];

for (const e of bounced) console.log(`BOUNCED   ${e.padEnd(28)} accepts mail? ${await domainAcceptsMail(e)}`);
for (const e of delivered) console.log(`DELIVERED ${e.padEnd(28)} accepts mail? ${await domainAcceptsMail(e)}`);

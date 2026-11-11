/**
 * Higgsfield API example — Seedance 2.5, text to video.
 *
 * Run it with:
 *   npm run higgsfield:example
 *
 * which is `node --env-file=.env.local --experimental-strip-types index.ts`.
 * Node 22 reads the env file itself, so there is no dotenv dependency and no
 * build step: the credential is loaded at runtime and never baked into
 * anything on disk.
 *
 * Credentials come from HF_CREDENTIALS in .env.local, which .gitignore
 * already covers (".env*", line 34). Higgsfield issues one of two shapes
 * depending on the console that made it — a single API key, or a key id and
 * secret joined by a colon. Both go in that one variable and the SDK sends
 * whichever it is as `Authorization: Key <value>`.
 *
 * The value is never read, printed or logged here. Server-side only: the v2
 * client refuses to run in a browser for exactly this reason.
 *
 * Running this submits a real generation and is billable. Requests that end
 * failed, canceled or moderated are not charged.
 */

import { config, higgsfield } from "@higgsfield/client/v2";

const ENDPOINT = "bytedance/seedance-2.5/text-to-video";

const credentials = process.env.HF_CREDENTIALS;

if (!credentials || credentials.startsWith("replace-with-")) {
  console.error(
    "HF_CREDENTIALS is not set. Put your Higgsfield API key in .env.local as\n" +
      "  HF_CREDENTIALS=<your key>\n" +
      "or, for a key-and-secret pair, HF_CREDENTIALS=<key-id>:<key-secret>.",
  );
  process.exit(1);
}

// The SDK splits this on ":" and insists on exactly two parts, so a single
// API key is rejected here rather than at the API. Catch it and say so,
// instead of letting a stack trace out that quotes the config call.
try {
  config({ credentials });
} catch {
  console.error(
    'The SDK rejected HF_CREDENTIALS: it requires the "KEY_ID:KEY_SECRET" pair.\n' +
      "A single API key will not work through the SDK — create a key with a\n" +
      "secret at console.higgsfield.ai, or call the REST API directly, which\n" +
      "does accept a lone key.",
  );
  process.exit(1);
}

/**
 * Terminal states that are not success. The SDK's own union covers failed and
 * nsfw; the REST API can also return canceled, so it is matched by name
 * rather than by type.
 */
function describeFailure(status: string): string {
  switch (status) {
    case "failed":
      return "the generation failed";
    case "nsfw":
      return "the generation was blocked by content moderation";
    case "canceled":
      return "the generation was canceled";
    default:
      return `the generation ended as "${status}"`;
  }
}

async function main() {
  console.log(`Submitting to ${ENDPOINT} …`);

  const result = await higgsfield.subscribe(ENDPOINT, {
    input: {
      prompt: "A cinematic scene at sunset",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
    withPolling: true,
  });

  if (result.status !== "completed") {
    console.error(`Request ${result.request_id}: ${describeFailure(result.status)}.`);
    console.error("Not charged. Status URL:", result.status_url);
    process.exit(1);
  }

  const url = result.video?.url;

  if (!url) {
    // Completed but with nothing to show is still not success.
    console.error(
      `Request ${result.request_id} completed but carried no video URL.`,
      "Status URL:",
      result.status_url,
    );
    process.exit(1);
  }

  console.log("Completed.");
  console.log("Video URL:", url);
}

main().catch((error: unknown) => {
  // Never print the error object wholesale: a thrown request error can carry
  // the request headers, and those hold the credential.
  console.error("Request failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});

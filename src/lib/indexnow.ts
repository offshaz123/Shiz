/**
 * IndexNow — tells Bing (and Yandex, Seznam, Naver) that a URL has changed,
 * instead of waiting for a crawler to notice. Google does not take part.
 *
 * This matters here because of the blog: a post a day, and without this each
 * one waits on Bing's own crawl schedule. Bing's index is what sits behind
 * Microsoft Copilot and ChatGPT's search, so the gap between publishing and
 * being indexed there is the gap between writing something and it being
 * quotable by an assistant.
 *
 * The key is deliberately public. The protocol works by us serving it at a
 * known URL on our own domain, which is what proves the submission came from
 * someone who controls the site. There is nothing to protect here — anyone
 * can read it, and it only ever grants the ability to say "this page of ours
 * changed".
 */
import { siteConfig } from "@/lib/site-config";

export const INDEXNOW_KEY = "9693612e7166ca3646cb4060c8dd765e";

const ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowResult = {
  submitted: number;
  status: number | null;
  ok: boolean;
  detail: string;
};

/**
 * Submits up to 10,000 URLs in one request, which is the protocol's limit and
 * far more than we will ever have changed in a day.
 *
 * Submitting pages that have not changed is what gets a site ignored, so
 * callers pass only what actually moved. An empty list is not an error, it is
 * the normal answer on a day nothing was published.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  if (urls.length === 0) {
    return { submitted: 0, status: null, ok: true, detail: "nothing changed" };
  }

  const host = new URL(siteConfig.url).host;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${siteConfig.url}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000),
      }),
    });

    // 200 accepted, 202 accepted but the key is still being verified. Both are
    // fine. 403 means the key file is not reachable, which is the one failure
    // worth shouting about because every later submission will fail the same way.
    return {
      submitted: urls.length,
      status: res.status,
      ok: res.status === 200 || res.status === 202,
      detail:
        res.status === 403
          ? `key file not reachable at ${siteConfig.url}/${INDEXNOW_KEY}.txt`
          : res.statusText,
    };
  } catch (error) {
    return {
      submitted: 0,
      status: null,
      ok: false,
      detail: error instanceof Error ? error.message : "request failed",
    };
  }
}

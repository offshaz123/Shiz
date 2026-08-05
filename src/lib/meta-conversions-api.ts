import { createHash } from "crypto";
import { siteConfig } from "@/lib/site-config";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1];
}

export async function sendMetaLeadEvent({
  request,
  eventId,
  email,
  phone,
}: {
  request: Request;
  eventId: string;
  email: string;
  phone: string;
}): Promise<void> {
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!accessToken || !siteConfig.metaPixelId) return;

  const cookieHeader = request.headers.get("cookie");
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const fbc = getCookieValue(cookieHeader, "_fbc");
  const fbp = getCookieValue(cookieHeader, "_fbp");

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: siteConfig.url,
        user_data: {
          em: [sha256(email)],
          ph: [sha256(phone.replace(/[^\d]/g, ""))],
          client_ip_address: clientIp,
          client_user_agent: userAgent,
          fbc,
          fbp,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${siteConfig.metaPixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      console.error("Meta Conversions API: request failed", await res.text());
    }
  } catch (err) {
    console.error("Meta Conversions API: request errored", err);
  }
}

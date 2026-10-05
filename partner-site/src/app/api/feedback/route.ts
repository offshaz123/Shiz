import { NextResponse } from "next/server";
import { mailer, mailFrom } from "@/lib/mailer";
import { brand } from "@/lib/brand";

/** Feedback goes to the same inbox as everything else, marked so it sorts. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, string> | null;

  // Honeypot: a real person never fills a hidden field.
  if (!body || body._honey) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Tell us what you think first." }, { status: 400 });
  }

  const transporter = mailer();
  if (!transporter) {
    console.error("Feedback: SMTP is not configured");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const lines = [
    `Rating: ${body.rating || "not given"}`,
    `About: ${body.topic || "not given"}`,
    "",
    message,
    "",
    "—",
    `Name: ${body.name || "not given"}`,
    `Email: ${body.email || "not given"}`,
    `Page: ${body.source || "Feedback page"}`,
  ];

  try {
    await transporter.sendMail({
      from: `"${brand.name} website" <${mailFrom()}>`,
      to: brand.email,
      replyTo: body.email || undefined,
      subject: `Feedback${body.rating ? ` (${body.rating})` : ""}: ${message.slice(0, 60)}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Feedback: failed to send", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

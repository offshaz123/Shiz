import { NextResponse } from "next/server";
import { mailer, mailFrom } from "@/lib/mailer";
import { brand } from "@/lib/brand";

const FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "business", label: "Company" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "businessType", label: "Business type" },
  { key: "volume", label: "Monthly volume in" },
  { key: "currency", label: "Pays suppliers in" },
  { key: "currentProvider", label: "Currently banks with" },
  { key: "message", label: "Message" },
  { key: "source", label: "Came from" },
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || (body as Record<string, unknown>)._honey) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const data = body as Record<string, string>;
  if (!data.name || !data.email || !data.phone) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const transporter = mailer();
  if (!transporter) {
    console.error("Enquiry form: SMTP environment variables are not configured");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const rows = FIELDS.filter((field) => data[field.key])
    .map((field) => `${field.label}: ${data[field.key]}`)
    .join("\n");

  try {
    await transporter.sendMail({
      from: `"${brand.name} website" <${mailFrom()}>`,
      to: brand.email,
      replyTo: data.email,
      subject: `New enquiry: ${data.business || data.name}`,
      text: rows,
    });
  } catch (err) {
    console.error("Enquiry form: failed to send email", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

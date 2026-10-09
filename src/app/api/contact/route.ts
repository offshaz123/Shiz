import { field, sendToShop } from "@/lib/mail";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Your message could not be read. Please try again." }, { status: 400 });
  }
  const name = field(form, "name");
  const email = field(form, "email");
  const phone = field(form, "phone", 40);
  const ref = field(form, "ref", 20);
  const message = field(form, "message", 5000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message)
    return Response.json({ error: "Please fill in your name, email and message." }, { status: 400 });

  try {
    await sendToShop({
      subject: `Website enquiry from ${name}${ref ? ` (order ${ref})` : ""}`,
      text: [`Name: ${name}`, `Email: ${email}`, phone && `Phone: ${phone}`, ref && `Order: ${ref}`, "", message]
        .filter((l) => l !== "")
        .join("\n"),
      replyTo: email,
    });
  } catch (err) {
    console.error("Contact email failed", err);
    return Response.json({ error: "Your message couldn't be sent. Please call or WhatsApp us." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

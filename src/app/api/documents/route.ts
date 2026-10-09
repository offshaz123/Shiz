import { field, readUploads, sendToShop } from "@/lib/mail";
import { isDbConfigured } from "@/lib/db";
import { getOrder, markDocsReceived, saveDocuments } from "@/lib/orders";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Your upload could not be read. Please try again." }, { status: 400 });
  }
  const ref = field(form, "ref", 20).toUpperCase();
  const email = field(form, "email");
  if (!ref || !/^\S+@\S+\.\S+$/.test(email))
    return Response.json({ error: "Please enter your order number and email." }, { status: 400 });

  const uploads = await readUploads(form, [
    { name: "entitlement", label: "proof of entitlement", required: true },
    { name: "identity", label: "ID", required: true },
  ]);
  if ("error" in uploads) return Response.json({ error: uploads.error }, { status: 400 });

  // Attach them to the order in the admin portal when the order number and email match.
  let matched = false;
  if (isDbConfigured()) {
    try {
      const order = await getOrder(ref);
      if (order && order.email.toLowerCase() === email.toLowerCase()) {
        await saveDocuments(order.id, uploads.attachments, ["entitlement", "identity"]);
        await markDocsReceived(order.id);
        matched = true;
      }
    } catch (err) {
      console.error("Saving documents failed", err);
    }
  }

  try {
    await sendToShop({
      subject: `Documents for order ${ref}`,
      text: `Documents uploaded for order ${ref}\nCustomer email: ${email}\n${matched ? "Saved to the order in the admin portal." : "WARNING: no order matched this order number and email. Check before making."}\n\nCheck them before making the plates.`,
      replyTo: email,
      attachments: uploads.attachments,
    });
  } catch (err) {
    console.error("Documents email failed", err);
    return Response.json({ error: "Upload failed. Please try again or email them to us." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

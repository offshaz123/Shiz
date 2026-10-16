import { isAdmin } from "@/lib/auth";
import { shopAddress } from "@/lib/mail";
import { sendWeeklyReport } from "@/lib/weekly-report";

// "Email me this report now" on the Insights page.
export async function POST() {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  try {
    await sendWeeklyReport();
    return Response.json({ message: `Sent to ${shopAddress()}` });
  } catch (err) {
    console.error("Sending the weekly report failed", err);
    return Response.json({ error: "The email couldn't be sent. Check the email settings." }, { status: 502 });
  }
}

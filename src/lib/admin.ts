import { redirect } from "next/navigation";
import { isAdmin } from "./auth";

// Use at the top of every admin page and route.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/login");
}

export function fmtDateTime(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

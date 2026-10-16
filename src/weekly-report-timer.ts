import { maybeSendWeeklyReport } from "./lib/weekly-report";

// Checks every 30 minutes whether it's time for the Monday report email.
const check = () => maybeSendWeeklyReport().catch((err) => console.error("Weekly report failed", err));
setTimeout(check, 2 * 60 * 1000).unref();
setInterval(check, 30 * 60 * 1000).unref();

import { maybeSendWeeklyReport } from "./lib/weekly-report";
import { maybeSendPriceRiseReminder } from "./lib/price-rise";

// Checks every 30 minutes whether it's time for the Monday report email
// (and the reminder before the launch prices end).
const check = () => {
  maybeSendWeeklyReport().catch((err) => console.error("Weekly report failed", err));
  maybeSendPriceRiseReminder().catch((err) => console.error("Price rise reminder failed", err));
};
setTimeout(check, 2 * 60 * 1000).unref();
setInterval(check, 30 * 60 * 1000).unref();

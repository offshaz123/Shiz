import { maybeSendWeeklyReport } from "./lib/weekly-report";
import { maybeSendPriceRiseReminder } from "./lib/price-rise";
import { sendDueDocsReminders } from "./lib/orders";
import { loadPriceChanges } from "./lib/prices";

// Checks every 30 minutes whether it's time for the Monday report email
// (and the reminder before the launch prices end, and document reminders).
const check = () => {
  maybeSendWeeklyReport().catch((err) => console.error("Weekly report failed", err));
  loadPriceChanges()
    .then(() => maybeSendPriceRiseReminder())
    .catch((err) => console.error("Price rise reminder failed", err));
  sendDueDocsReminders().catch((err) => console.error("Documents reminders failed", err));
};
setTimeout(check, 2 * 60 * 1000).unref();
setInterval(check, 30 * 60 * 1000).unref();

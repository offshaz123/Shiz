import { startScheduler } from "@/lib/scheduler";

/**
 * Runs once when a Next server instance starts.
 *
 * The only thing here is arming the follow-up scheduler. Next waits for
 * `register` to finish before the server accepts requests, so this must stay
 * cheap: startScheduler sets a timer and returns, it does not send anything.
 */
export function register() {
  startScheduler();
}

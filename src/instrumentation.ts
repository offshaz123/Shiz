// Runs once when the server starts. Starts the Monday report check (Node only).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./weekly-report-timer");
}

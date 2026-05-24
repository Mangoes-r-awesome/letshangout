// Structured logger. Outputs JSON-shaped lines so Vercel/Datadog/Axiom can parse.
// Drop-in for console.error. Swap to Sentry/Axiom later by editing this file only.

type Level = "info" | "warn" | "error";

function emit(level: Level, route: string, message: string, meta?: Record<string, unknown>) {
  const line = {
    level,
    route,
    message,
    ...(meta && { meta }),
    ts: new Date().toISOString(),
  };
  // Use the appropriate console method so Vercel surfaces severity correctly.
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(JSON.stringify(line));
}

export const log = {
  info: (route: string, message: string, meta?: Record<string, unknown>) => emit("info", route, message, meta),
  warn: (route: string, message: string, meta?: Record<string, unknown>) => emit("warn", route, message, meta),
  error: (route: string, message: string, meta?: Record<string, unknown>) => emit("error", route, message, meta),
};

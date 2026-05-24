// In-memory rate limiter. Defensive only.
//
// LIMITATION: On Vercel serverless each lambda instance has its own Map, so a
// determined attacker hitting different cold-start instances can bypass these
// limits. This raises the abuse cost (especially for SMS via Supabase/Twilio)
// without adding infra.
//
// When you're ready for real distributed limiting, swap the implementation here
// to @upstash/ratelimit (free tier covers 10k commands/day). The callsite
// signature stays the same.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodic prune to keep the map small. Runs once per ~5 min of actual activity.
let lastPrune = Date.now();
function prune(now: number) {
  if (now - lastPrune < 5 * 60_000) return;
  lastPrune = now;
  buckets.forEach((b, k) => { if (b.resetAt < now) buckets.delete(k); });
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Check whether `key` is within the limit. Increments on every call.
 *
 * @param key   stable identifier (e.g. IP, phone number, user id, route+ip combo)
 * @param limit max requests within the window
 * @param windowMs window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return { ok: existing.count <= limit, remaining, resetAt: existing.resetAt };
}

/**
 * Best-effort client IP extraction. Vercel sets x-forwarded-for to the chain.
 * Fall back to a constant so a missing header doesn't bypass the limit entirely
 * (it just means all unidentifiable requests share a bucket).
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter.
 * Limits each IP to RATE_LIMIT_MAX requests per RATE_LIMIT_WINDOW_MS.
 * NOTE: This is per-instance. For multi-instance production, use Redis (e.g. Upstash).
 */
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10);
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

const ipMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

// Periodically clean up old entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipMap.entries()) {
    if (now > entry.resetAt) ipMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

export function proxy(req: NextRequest) {
  // Only apply rate limiting to API routes
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip rate limiting for LINE webhook (LINE platform sends from multiple IPs)
  if (req.nextUrl.pathname === "/api/line/webhook") {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
        },
      }
    );
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: "/api/:path*",
};

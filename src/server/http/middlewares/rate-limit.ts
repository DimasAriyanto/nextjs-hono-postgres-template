import { createMiddleware } from 'hono/factory';
import { RateLimitError } from '@/server/errors';
import { getClientIp } from '@/server/utils/request';

interface RateLimitOptions {
	/** Size of the fixed window, in seconds */
	windowSeconds: number;
	/** Max requests allowed per key within the window */
	max: number;
}

interface Bucket {
	count: number;
	resetAt: number;
}

/**
 * Fixed-window rate limiter, keyed by client IP + route.
 *
 * In-memory (per server instance) — fine for this template's default single-instance/VPS
 * deployment. A multi-instance/serverless deployment would need a shared store
 * (e.g. Redis/Upstash) instead, since each instance would otherwise track its own count.
 *
 * The IP itself (see `getClientIp`) is only as trustworthy as the reverse proxy in
 * front of this app — this is best-effort brute-force friction, not a hard guarantee,
 * and is fully bypassable if the app is ever exposed directly to the internet.
 */
const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this map doesn't grow unbounded.
setInterval(
	() => {
		const now = Date.now();
		for (const [key, bucket] of buckets) {
			if (bucket.resetAt <= now) buckets.delete(key);
		}
	},
	5 * 60 * 1000,
).unref?.();

export const rateLimit = ({ windowSeconds, max }: RateLimitOptions) =>
	createMiddleware(async (c, next) => {
		const key = `${c.req.path}:${getClientIp(c)}`;
		const now = Date.now();

		let bucket = buckets.get(key);
		if (!bucket || bucket.resetAt <= now) {
			bucket = { count: 0, resetAt: now + windowSeconds * 1000 };
			buckets.set(key, bucket);
		}

		bucket.count += 1;

		if (bucket.count > max) {
			throw new RateLimitError();
		}

		await next();
	});

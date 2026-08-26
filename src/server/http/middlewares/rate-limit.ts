import { createMiddleware } from 'hono/factory';
import { RateLimitError } from '@/server/errors';

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

function getClientIp(headerValue: string | undefined): string {
	if (!headerValue) return 'unknown';
	return headerValue.split(',')[0].trim();
}

export const rateLimit = ({ windowSeconds, max }: RateLimitOptions) =>
	createMiddleware(async (c, next) => {
		const ip = getClientIp(c.req.header('x-forwarded-for')) !== 'unknown'
			? getClientIp(c.req.header('x-forwarded-for'))
			: getClientIp(c.req.header('x-real-ip'));

		const key = `${c.req.path}:${ip}`;
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

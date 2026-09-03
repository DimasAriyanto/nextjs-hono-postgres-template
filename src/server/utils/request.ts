import type { Context } from 'hono';

/**
 * Best-effort client IP, used for rate limiting and as a hint to Cloudflare Turnstile.
 *
 * Next.js Route Handlers never expose the raw TCP peer address (unlike a plain Node
 * `http.Server`, there's no `req.socket.remoteAddress` here) — a header is the only
 * signal available, and it's only as trustworthy as whatever reverse proxy sits in
 * front of this app.
 *
 * A well-behaved reverse proxy (Nginx's `$proxy_add_x_forwarded_for`, most CDNs/load
 * balancers) APPENDS the real connecting IP as the last entry of `X-Forwarded-For`
 * rather than replacing it — so the trustworthy value is the *last* one; every earlier
 * entry is whatever the original client (or a spoofed request) chose to send.
 *
 * If this app is ever reachable directly from the internet — no reverse proxy/CDN in
 * front overwriting or appending this header — `X-Forwarded-For` is entirely
 * client-controlled and this function cannot be trusted at all: a client can rotate a
 * fake value per request to defeat rate limiting outright. Always deploy behind a
 * reverse proxy (Nginx, Caddy, Cloudflare, Vercel's edge, ...) in production; never
 * expose the Node process's port directly.
 */
export function getClientIp(c: Context): string {
	const forwardedFor = c.req.header('x-forwarded-for');
	if (forwardedFor) {
		const hops = forwardedFor
			.split(',')
			.map((hop) => hop.trim())
			.filter(Boolean);
		if (hops.length > 0) return hops[hops.length - 1];
	}

	return c.req.header('x-real-ip') ?? 'unknown';
}

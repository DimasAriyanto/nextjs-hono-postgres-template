import sanitizeHtml_ from 'sanitize-html';

/**
 * Tags/attributes the Tiptap editor (see package.json @tiptap/extension-*) can produce.
 * Anything else — scripts, event handlers, iframes, forms, etc. — is stripped.
 *
 * Uses `sanitize-html` instead of `isomorphic-dompurify` because the latter
 * pulls in `jsdom` which has an ESM-only transitive dependency
 * (`@exodus/bytes/encoding-lite.js`) that crashes Vercel's CJS runtime with
 * ERR_REQUIRE_ESM. `sanitize-html` is pure CJS and ships no DOM emulator.
 */
const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'];
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
	a: ['href', 'title', 'target', 'rel'],
	img: ['src', 'alt', 'title'],
	'*': ['style'],
};

/**
 * Sanitize admin-authored rich-text HTML before it's rendered via
 * `dangerouslySetInnerHTML`. Without this, a compromised editor/admin account could
 * store a `<script>`/`onerror=` payload that runs in every visitor's browser (stored XSS).
 */
export function sanitizeHtml(html: string): string {
	return sanitizeHtml_(html, {
		allowedTags: ALLOWED_TAGS,
		allowedAttributes: ALLOWED_ATTRIBUTES,
	});
}

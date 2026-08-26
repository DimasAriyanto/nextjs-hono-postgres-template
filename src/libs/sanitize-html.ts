import DOMPurify from 'isomorphic-dompurify';

/**
 * Tags/attributes the Tiptap editor (see package.json @tiptap/extension-*) can produce.
 * Anything else — scripts, event handlers, iframes, forms, etc. — is stripped.
 */
const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'];
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'style'];

/**
 * Sanitize admin-authored rich-text HTML before it's rendered via
 * `dangerouslySetInnerHTML`. Without this, a compromised editor/admin account could
 * store a `<script>`/`onerror=` payload that runs in every visitor's browser (stored XSS).
 */
export function sanitizeHtml(html: string): string {
	return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}

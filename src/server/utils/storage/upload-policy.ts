/**
 * Server-trusted upload policy, shared by the controller and every storage driver.
 *
 * Two things must never come from client-controlled input:
 * - The destination folder — an arbitrary string here let `path.join()` (local driver)
 *   collapse `..` segments and write outside `public/uploads` entirely.
 * - The file extension — it used to be parsed from the client-supplied `file.name`,
 *   so a file could be uploaded with `Content-Type: image/png` and filename `x.html`
 *   and get served back as HTML (stored XSS). The extension is now derived from the
 *   verified MIME type via the maps below instead.
 */

export const ALLOWED_UPLOAD_FOLDERS = ['avatars', 'articles', 'settings', 'banners', 'uploads'] as const;

export function isAllowedUploadFolder(folder: string): folder is (typeof ALLOWED_UPLOAD_FOLDERS)[number] {
	return (ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(folder);
}

// SVG is intentionally excluded — it can embed <script>/event handlers.
export const IMAGE_MIME_EXT: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/gif': 'gif',
	'image/webp': 'webp',
};

export const VIDEO_MIME_EXT: Record<string, string> = {
	'video/mp4': 'mp4',
	'video/webm': 'webm',
	'video/quicktime': 'mov',
	'video/ogg': 'ogv',
};

export const DOCUMENT_MIME_EXT: Record<string, string> = {
	'application/pdf': 'pdf',
	'application/msword': 'doc',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
	'application/vnd.ms-excel': 'xls',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
	'application/vnd.ms-powerpoint': 'ppt',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
	'text/plain': 'txt',
	'text/csv': 'csv',
};

/**
 * Document MIME allowlist can be extended via UPLOAD_ALLOWED_DOCUMENT_TYPES, so unlike
 * images/videos it can't be a fixed lookup. Known types map to their real extension;
 * anything else falls back to a sanitized version of the MIME subtype (never the
 * client-supplied filename) so the result is always a short, safe, predictable extension.
 */
export function documentExtFromMime(mime: string): string {
	const known = DOCUMENT_MIME_EXT[mime];
	if (known) return known;

	const subtype = mime.split('/')[1] ?? '';
	const safe = subtype.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10);
	return safe || 'bin';
}

/**
 * Magic-byte ("file signature") validation for uploads.
 *
 * The upload controller only knew the client-declared `file.type` (from the multipart
 * request), which the client fully controls — nothing stops a request from labeling
 * arbitrary bytes as `image/png`. Combined with the extension-from-MIME mapping in
 * `upload-policy.ts`, that was enough to stop the extension-confusion attack, but the
 * stored file's actual content was never checked against what it claims to be.
 *
 * This checks the first bytes of the file against the known binary signature for its
 * declared MIME type before it's accepted. Formats without a reliable signature
 * (text/plain, text/csv — any byte sequence is "valid" text) are intentionally skipped.
 */

interface ByteCheck {
	offset: number;
	bytes: number[];
}

// Each MIME maps to a list of alternative signatures (OR); every ByteCheck within one
// alternative must match (AND) — e.g. WEBP needs both the RIFF header and the WEBP tag.
const FILE_SIGNATURES: Record<string, ByteCheck[][]> = {
	'image/png': [[{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }]],
	'image/jpeg': [[{ offset: 0, bytes: [0xff, 0xd8, 0xff] }]],
	'image/gif': [
		[{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }], // GIF87a
		[{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }], // GIF89a
	],
	'image/webp': [
		[
			{ offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // 'RIFF'
			{ offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // 'WEBP'
		],
	],
	'video/mp4': [[{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }]], // 'ftyp' box
	'video/quicktime': [
		[{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }], // 'ftyp'
		[{ offset: 4, bytes: [0x6d, 0x6f, 0x6f, 0x76] }], // 'moov'
		[{ offset: 4, bytes: [0x66, 0x72, 0x65, 0x65] }], // 'free'
		[{ offset: 4, bytes: [0x6d, 0x64, 0x61, 0x74] }], // 'mdat'
		[{ offset: 4, bytes: [0x77, 0x69, 0x64, 0x65] }], // 'wide'
	],
	'video/webm': [[{ offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] }]], // EBML header
	'video/ogg': [[{ offset: 0, bytes: [0x4f, 0x67, 0x67, 0x53] }]], // 'OggS'
	'application/pdf': [[{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }]], // '%PDF'
	// Legacy Office formats (OLE Compound File)
	'application/msword': [[{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }]],
	'application/vnd.ms-excel': [[{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }]],
	'application/vnd.ms-powerpoint': [[{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }]],
	// Modern Office formats are zip containers — signature only confirms "is a zip",
	// not the specific subtype, since docx/xlsx/pptx share the same outer format.
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }]],
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [[{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }]],
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': [[{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }]],
};

/** Reads just the leading bytes of a File — cheap, and doesn't consume it (Files/Blobs are re-readable). */
export async function readFileHeader(file: File, length = 16): Promise<Uint8Array> {
	const buffer = await file.slice(0, length).arrayBuffer();
	return new Uint8Array(buffer);
}

/**
 * Checks whether `header` (the file's leading bytes) matches a known signature for `mime`.
 * MIME types with no registered signature (e.g. text/plain, text/csv) always pass —
 * there's nothing meaningful to sniff for plain text.
 */
export function matchesFileSignature(header: Uint8Array, mime: string): boolean {
	const alternatives = FILE_SIGNATURES[mime];
	if (!alternatives) return true;

	return alternatives.some((checks) => checks.every(({ offset, bytes }) => bytes.every((byte, i) => header[offset + i] === byte)));
}

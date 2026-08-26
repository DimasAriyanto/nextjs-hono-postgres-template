import type { Metadata, ResolvingMetadata } from 'next';

/** The app's public base URL, used for `metadataBase`, canonical/OG `url` fields and JSON-LD `@id`s. */
export function getAppUrl(): string {
	return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Serializes a JSON-LD object for embedding in a `<script type="application/ld+json">` tag via
 * `dangerouslySetInnerHTML`. `JSON.stringify` does not escape angle brackets, so admin-editable
 * text (article tags, FAQ answers, business address, ...) containing a literal closing script tag
 * would otherwise terminate the tag early and let the rest be parsed as live HTML/script — this
 * replaces every angle bracket with its unicode escape, which is a no-op inside a JSON string but
 * is no longer a tag delimiter once it reaches the browser's HTML parser.
 */
export function toJsonLdScript(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Extends the parent (root layout) `openGraph`/`twitter` metadata with this page's own
 * title/description/url instead of replacing them outright. Next.js merges nested metadata
 * objects (like `openGraph`) by full replacement, not deep merge — so a route that sets its
 * own `openGraph` without this would silently drop the root layout's `siteName`, `locale` and
 * fallback image.
 */
export async function extendParentSocialMetadata(
	parent: ResolvingMetadata,
	page: { title: string; url: string; description?: string },
): Promise<{ openGraph: Metadata['openGraph']; twitter: Metadata['twitter'] }> {
	const { openGraph, twitter } = await parent;

	return {
		openGraph: {
			...openGraph,
			title: page.title,
			description: page.description ?? openGraph?.description,
			url: page.url,
		},
		twitter: {
			...twitter,
			title: page.title,
			description: page.description ?? twitter?.description,
		},
	};
}

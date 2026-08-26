import type { Metadata, ResolvingMetadata } from 'next';

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

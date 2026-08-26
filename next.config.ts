import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			// AWS S3
			{
				protocol: 'https',
				hostname: '*.s3.*.amazonaws.com',
			},
			// Supabase Storage
			{
				protocol: 'https',
				hostname: '*.supabase.co',
				pathname: '/storage/v1/object/public/**',
			},
			// Google (OAuth avatar)
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			// Gravatar
			{
				protocol: 'https',
				hostname: '*.gravatar.com',
			},
			// Unsplash (seeded banner images)
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
		],
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
					{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
				],
			},
		];
	},
};

export default withNextIntl(nextConfig);

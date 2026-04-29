import type { NextConfig } from 'next';

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
		],
	},
};

export default nextConfig;

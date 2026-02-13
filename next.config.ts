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
		],
	},
};

export default nextConfig;

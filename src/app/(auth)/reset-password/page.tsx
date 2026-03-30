import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResetPasswordWrapper } from '@/features/auth';

export const metadata: Metadata = {
	robots: 'noindex, nofollow',
	title: 'Reset Password',
};

interface PageProps {
	searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
	const params = await searchParams;
	const token = params.token;

	// Redirect if no token provided
	if (!token) {
		redirect('/forgot-password');
	}

	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-4xl">
				<ResetPasswordWrapper token={token} />
			</div>
		</div>
	);
}

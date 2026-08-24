import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ResetPasswordWrapper } from '@/features/auth';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('auth.resetPassword');
	return { robots: 'noindex, nofollow', title: t('title') };
}

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

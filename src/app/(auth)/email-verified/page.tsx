import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EmailVerifiedWrapper } from '@/features/auth';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('auth.emailVerified');
	return { robots: 'noindex, nofollow', title: t('title') };
}

interface PageProps {
	searchParams: Promise<{ status?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
	const params = await searchParams;

	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-4xl">
				<EmailVerifiedWrapper status={params.status} />
			</div>
		</div>
	);
}

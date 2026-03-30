import type { Metadata } from 'next';
import { ForgotPasswordWrapper } from '@/features/auth';

export const metadata: Metadata = {
	robots: 'noindex, nofollow',
	title: 'Lupa Password',
};

export default function Page() {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-4xl">
				<ForgotPasswordWrapper />
			</div>
		</div>
	);
}

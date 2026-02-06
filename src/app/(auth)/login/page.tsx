import { LoginWrapper } from '@/features/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	robots: 'noindex, nofollow',
};

export default function Page() {
	return <LoginWrapper />;
}

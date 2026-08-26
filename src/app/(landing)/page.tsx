import type { Metadata } from 'next';
import { HomeWrapper } from '@/features/home';

export const metadata: Metadata = {
	alternates: { canonical: '/' },
};

export default function Page() {
	return <HomeWrapper />;
}

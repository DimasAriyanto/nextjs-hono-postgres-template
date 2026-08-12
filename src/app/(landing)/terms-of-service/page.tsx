import type { Metadata } from 'next';
import { LegalPageWrapper } from '@/features/setting';

export const metadata: Metadata = {
	title: 'Terms of Service',
};

export default function TermsOfServicePage() {
	return <LegalPageWrapper title="Terms of Service" field="terms_of_service" />;
}

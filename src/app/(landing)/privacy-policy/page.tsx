import type { Metadata } from 'next';
import { LegalPageWrapper } from '@/features/setting';

export const metadata: Metadata = {
	title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
	return <LegalPageWrapper title="Privacy Policy" field="privacy_policy" />;
}

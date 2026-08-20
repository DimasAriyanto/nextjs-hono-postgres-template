import type { Metadata } from 'next';
import { LegalPageWrapper } from '@/features/setting';

export const metadata: Metadata = {
	title: 'About Us',
};

export default function AboutPage() {
	return <LegalPageWrapper title="About Us" field="about_content" />;
}

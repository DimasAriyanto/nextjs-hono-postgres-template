import type { Metadata } from 'next';
import { ContactPageWrapper } from '@/features/setting';

export const metadata: Metadata = {
	title: 'Contact Us',
};

export default function ContactPage() {
	return <ContactPageWrapper />;
}

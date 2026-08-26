import type { Metadata } from 'next';
import { AdminLayout } from '@/layouts/admin-layout';

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AdminLayout>{children}</AdminLayout>;
}

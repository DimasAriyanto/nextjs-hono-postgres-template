import { AuthLayout } from '@/layouts/auth-layout';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AuthLayout>{children}</AuthLayout>;
}

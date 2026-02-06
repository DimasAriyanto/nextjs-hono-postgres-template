import React, { ReactNode } from 'react';
import { AppLayout } from '@/layouts/app-layout';
import type { Metadata } from 'next';

type Props = { children: ReactNode };

export const metadata: Metadata = {
	robots: 'noindex, nofollow',
};

export default async function Layout({ children }: Props) {
	return <AppLayout>{children}</AppLayout>;
}

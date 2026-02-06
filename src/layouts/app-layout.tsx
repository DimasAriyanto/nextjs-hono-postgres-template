'use client';

import { AppHeader } from '@/layouts/app-layout-components/header';
import { AppFooter } from '@/layouts/app-layout-components/footer';
import { ErrorScreen } from '@/components/error-screen';
import { ErrorContent } from '@/components/error-content';
import { ErrorBoundaries } from '@/providers/error-provider';
import type { PropsWithChildren } from 'react';

export const AppLayout = ({ children, ...props }: PropsWithChildren) => {
	return (
		<ErrorBoundaries ErrorContent={ErrorScreen}>
			<AppHeader />

			<main className="" {...props}>
				<ErrorBoundaries ErrorContent={ErrorContent}>{children}</ErrorBoundaries>
			</main>

			<AppFooter />
		</ErrorBoundaries>
	);
};

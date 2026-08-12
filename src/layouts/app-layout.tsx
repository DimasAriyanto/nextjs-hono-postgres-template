'use client';

import { AppHeader } from '@/layouts/app-layout-components/app-header';
import { AppFooter } from '@/layouts/app-layout-components/app-footer';
import { ErrorScreen } from '@/components/error-screen';
import { ErrorContent } from '@/components/error-content';
import { ErrorBoundaries } from '@/providers/error-provider';
import { useSettings } from '@/features/setting/hooks/use-setting';
import type { PropsWithChildren } from 'react';

export const AppLayout = ({ children, ...props }: PropsWithChildren) => {
	const { data: settingsRes } = useSettings();

	return (
		<ErrorBoundaries ErrorContent={ErrorScreen}>
			<AppHeader settings={settingsRes?.data} />

			<main className="" {...props}>
				<ErrorBoundaries ErrorContent={ErrorContent}>{children}</ErrorBoundaries>
			</main>

			<AppFooter settings={settingsRes?.data} />
		</ErrorBoundaries>
	);
};

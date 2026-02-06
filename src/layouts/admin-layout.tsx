'use client';

import { AdminHeaderbar } from '@/layouts/admin-layout-components/headerbar';
import { AdminSidebar } from '@/layouts/admin-layout-components/sidebar';
import { ErrorScreen } from '@/components/error-screen';
import { ErrorContent } from '@/components/error-content';
import { ErrorBoundaries } from '@/providers/error-provider';
import type { PropsWithChildren } from 'react';

export const AdminLayout = ({ children, ...props }: PropsWithChildren) => {
	return (
		<ErrorBoundaries ErrorContent={ErrorScreen}>
			<div className="flex h-svh w-full">
				<AdminSidebar />

				<ErrorBoundaries ErrorContent={ErrorContent}>
					<main className="relative flex w-full flex-1 flex-col" {...props}>
						<AdminHeaderbar />

						<ErrorBoundaries ErrorContent={ErrorContent}>{children}</ErrorBoundaries>
					</main>
				</ErrorBoundaries>
			</div>
		</ErrorBoundaries>
	);
};

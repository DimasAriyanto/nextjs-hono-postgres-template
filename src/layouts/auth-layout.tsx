'use client';

import { ErrorScreen } from '@/components/error-screen';
import { ErrorBoundaries } from '@/providers/error-provider';

export const AuthLayout = ({ children, ...props }: { children: React.ReactNode }) => {
	return (
		<ErrorBoundaries ErrorContent={ErrorScreen}>
			<div {...props}>
				<p>Auth Layout</p>

				{children}
			</div>
		</ErrorBoundaries>
	);
};

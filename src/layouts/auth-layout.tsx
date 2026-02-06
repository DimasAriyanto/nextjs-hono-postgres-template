'use client';

import { ErrorScreen } from '@/components/error-screen';
import { ErrorBoundaries } from '@/providers/error-provider';

export const AuthLayout = ({ children, ...props }: { children: React.ReactNode }) => {
	return (
		<ErrorBoundaries ErrorContent={ErrorScreen}>
			<div className="min-h-screen bg-background" {...props}>
				{children}
			</div>

		</ErrorBoundaries>
	);
};

'use client';

import { ErrorScreen } from '@/components/error-screen';
import { ErrorBoundaries } from '@/providers/error-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useSettings } from '@/features/setting/hooks/use-setting';

export const AuthLayout = ({ children, ...props }: { children: React.ReactNode }) => {
	const { data: settingsRes } = useSettings();
	const languageSwitcherEnabled = settingsRes?.data.language_switcher_enabled !== false;

	return (
		<ErrorBoundaries ErrorContent={ErrorScreen}>
			<div className="relative min-h-screen bg-background" {...props}>
				{languageSwitcherEnabled && (
					<div className="absolute right-4 top-4 z-10">
						<LanguageSwitcher />
					</div>
				)}
				{children}
			</div>

		</ErrorBoundaries>
	);
};

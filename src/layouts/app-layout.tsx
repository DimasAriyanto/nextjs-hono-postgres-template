'use client';

import { useLocale } from 'next-intl';
import { AppHeader } from '@/layouts/app-layout-components/app-header';
import { AppFooter } from '@/layouts/app-layout-components/app-footer';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { ErrorScreen } from '@/components/error-screen';
import { ErrorContent } from '@/components/error-content';
import { ErrorBoundaries } from '@/providers/error-provider';
import { useSettings } from '@/features/setting/hooks/use-setting';
import type { TContentLocale } from '@/contracts';
import type { PropsWithChildren } from 'react';

export const AppLayout = ({ children, ...props }: PropsWithChildren) => {
	const locale = useLocale() as TContentLocale;
	const { data: settingsRes } = useSettings(locale);
	const settings = settingsRes?.data;

	return (
		<ErrorBoundaries ErrorContent={ErrorScreen}>
			<div className="flex min-h-screen flex-col">
				<AppHeader settings={settings} />

				<main className="flex-1" {...props}>
					<ErrorBoundaries ErrorContent={ErrorContent}>{children}</ErrorBoundaries>
				</main>

				<AppFooter settings={settings} />

				<WhatsAppButton
					enabled={settings?.whatsapp_enabled}
					phone={settings?.contact_phone}
					name={settings?.app_name}
					welcomeMessage={settings?.whatsapp_welcome_message || undefined}
					greetings={settings?.whatsapp_greetings?.length ? settings.whatsapp_greetings : undefined}
					quickReplies={settings?.whatsapp_quick_replies?.length ? settings.whatsapp_quick_replies : undefined}
				/>
			</div>
		</ErrorBoundaries>
	);
};

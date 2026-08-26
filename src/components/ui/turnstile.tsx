'use client';

import { useEffect, useId, useRef } from 'react';

declare global {
	interface Window {
		turnstile?: {
			render: (container: string | HTMLElement, options: TurnstileOptions) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
		};
		onTurnstileLoad?: () => void;
	}
}

interface TurnstileOptions {
	sitekey: string;
	callback?: (token: string) => void;
	'error-callback'?: () => void;
	'expired-callback'?: () => void;
	theme?: 'light' | 'dark' | 'auto';
	size?: 'normal' | 'compact';
}

interface TurnstileWidgetProps {
	/** Called when user successfully completes the challenge — pass token to form */
	onVerify: (token: string) => void;
	/** Called when the token expires; clear token from form state */
	onExpire?: () => void;
	/** Called on CAPTCHA error; clear token from form state */
	onError?: () => void;
	/** Ref exposed so parent can call reset() after submit */
	widgetRef?: React.MutableRefObject<{ reset: () => void } | null>;
	theme?: 'light' | 'dark' | 'auto';
}

const SCRIPT_ID = 'cf-turnstile-script';
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

/**
 * Cloudflare Turnstile CAPTCHA widget.
 *
 * - Loads the Turnstile script once globally.
 * - Renders an invisible/managed challenge widget.
 * - Dev bypass: renders nothing if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is not set.
 *
 * @example
 * const tokenRef = useRef<string>('');
 * const widgetRef = useRef(null);
 *
 * <TurnstileWidget
 *   onVerify={(token) => { tokenRef.current = token; }}
 *   onExpire={() => { tokenRef.current = ''; }}
 *   widgetRef={widgetRef}
 * />
 */
export function TurnstileWidget({ onVerify, onExpire, onError, widgetRef, theme = 'auto' }: TurnstileWidgetProps) {
	const uid = useId().replace(/:/g, '-');
	const containerId = `cf-turnstile-${uid}`;
	const internalWidgetId = useRef<string | null>(null);

	useEffect(() => {
		// Dev bypass — skip if no site key configured
		if (!SITE_KEY) return;

		const renderWidget = () => {
			const container = document.getElementById(containerId);
			if (!container || !window.turnstile) return;

			internalWidgetId.current = window.turnstile.render(container, {
				sitekey: SITE_KEY,
				callback: onVerify,
				'expired-callback': onExpire,
				'error-callback': onError,
				theme,
			});
		};

		// Expose reset handle to parent
		if (widgetRef) {
			widgetRef.current = {
				reset: () => {
					if (internalWidgetId.current && window.turnstile) {
						window.turnstile.reset(internalWidgetId.current);
					}
				},
			};
		}

		// Load script if not already present
		if (!document.getElementById(SCRIPT_ID)) {
			window.onTurnstileLoad = renderWidget;

			const script = document.createElement('script');
			script.id = SCRIPT_ID;
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		} else if (window.turnstile) {
			// Script already loaded — render immediately
			renderWidget();
		} else {
			// Script loading — wait for callback
			const prev = window.onTurnstileLoad;
			window.onTurnstileLoad = () => {
				prev?.();
				renderWidget();
			};
		}

		return () => {
			if (internalWidgetId.current && window.turnstile) {
				window.turnstile.remove(internalWidgetId.current);
				internalWidgetId.current = null;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [containerId]);

	// Dev bypass — render nothing
	if (!SITE_KEY) return null;

	return <div id={containerId} className="mt-1" />;
}

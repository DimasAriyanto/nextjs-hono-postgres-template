export interface GoogleUser {
	id: string;
	email: string;
	name: string;
	avatar_url?: string;
}

export class GoogleAuth {
	parseJwtPayload(token: string): GoogleUser & { sub: string } {
		try {
			if (token.includes('.') && token.split('.').length === 3) {
				const base64Url = token.split('.')[1];
				const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
				const jsonPayload = decodeURIComponent(
					atob(base64)
						.split('')
						.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
						.join(''),
				);
				return JSON.parse(jsonPayload);
			} else {
				// Base64 encoded JSON (from our OAuth callback)
				const jsonPayload = atob(token);
				return JSON.parse(jsonPayload);
			}
		} catch {
			throw new Error('Invalid token format');
		}
	}

	async loadGoogleScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (typeof window === 'undefined') {
				reject(new Error('Not in browser environment'));
				return;
			}

			if (window.google?.accounts?.id) {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.async = true;
			script.defer = true;

			script.onload = () => {
				resolve();
			};

			script.onerror = () => {
				reject(new Error('Failed to load Google script'));
			};

			document.head.appendChild(script);
		});
	}
}

// Global window types
declare global {
	interface Window {
		google?: {
			accounts?: {
				id?: {
					initialize: (config: {
						client_id: string;
						callback: (response: { credential: string }) => void;
						use_fedcm_for_prompt?: boolean;
						auto_select?: boolean;
						cancel_on_tap_outside?: boolean;
					}) => void;
					prompt: (callback?: (notification: unknown) => void) => void;
					renderButton: (
						element: HTMLElement,
						options: { theme?: string; size?: string; text?: string; shape?: string; width?: string },
					) => void;
				};
				oauth2?: {
					initTokenClient: (config: unknown) => unknown;
				};
			};
		};
	}
}

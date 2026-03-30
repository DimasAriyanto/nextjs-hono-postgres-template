'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/icon';
import { GoogleAuth } from '@/libs/google-auth';
import { toast } from 'sonner';

// Google Icon Component
export const GoogleIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path
			fill="#4285F4"
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
		/>
		<path
			fill="#34A853"
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
		/>
		<path
			fill="#FBBC05"
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
		/>
		<path
			fill="#EA4335"
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
		/>
	</svg>
);

interface GoogleAuthButtonProps {
	mode?: 'login' | 'register';
	onSuccess?: (credential: string) => void;
	onError?: (error: string) => void;
	className?: string;
	disabled?: boolean;
}

export const GoogleAuthButton = ({ mode = 'login', onSuccess, onError, className = '', disabled = false }: GoogleAuthButtonProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [googleAuth, setGoogleAuth] = useState<GoogleAuth | null>(null);
	const [isReady, setIsReady] = useState(false);
	const googleButtonRef = useRef<HTMLDivElement>(null);

	// Get Google Client ID from environment
	const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

	// Initialize Google Auth
	useEffect(() => {
		if (!googleClientId) {
			console.error('Google Client ID is not configured');
			return;
		}

		const auth = new GoogleAuth();
		setGoogleAuth(auth);

		auth.loadGoogleScript()
			.then(() => {
				setIsReady(true);
			})
			.catch((error) => {
				console.error('Failed to load Google script:', error);
				toast.error('Google Authentication Error', {
					description: 'Failed to load Google authentication',
				});
				if (onError) {
					onError('Failed to load Google authentication');
				}
			});
	}, [googleClientId, onError]);

	// Setup Google Button
	useEffect(() => {
		if (isReady && googleAuth && googleButtonRef.current && window.google?.accounts?.id) {
			// Clear previous content
			googleButtonRef.current.innerHTML = '';

			// Initialize Google Sign-In with callback
			window.google.accounts.id.initialize({
				client_id: googleClientId,
				callback: handleGoogleCallback,
				auto_select: false,
				cancel_on_tap_outside: true,
			});

			// Render the native Google button
			window.google.accounts.id.renderButton(googleButtonRef.current, {
				theme: 'outline',
				size: 'large',
				text: mode === 'login' ? 'signin_with' : 'signup_with',
				shape: 'rectangular',
			});

			// Apply custom styling to match email button
			setTimeout(() => {
				if (googleButtonRef.current) {
					const button = googleButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
					const iframe = googleButtonRef.current.querySelector('iframe') as HTMLElement;

					if (button) {
						// Apply custom styling to match email button exactly
						button.style.cssText = `
							width: 100% !important;
							height: 40px !important;
							border: 1px solid rgb(209, 213, 219) !important;
							border-radius: 8px !important;
							background-color: white !important;
							color: rgb(17, 24, 39) !important;
							font-size: 14px !important;
							font-weight: 400 !important;
							display: flex !important;
							align-items: center !important;
							justify-content: center !important;
							transition: all 0.15s ease-in-out !important;
							cursor: pointer !important;
							padding: 0 16px !important;
							font-family: system-ui, -apple-system, sans-serif !important;
							gap: 8px !important;
						`;

						// Clean up and restructure the button content
						const svgElement = button.querySelector('svg');
						const textSpan = button.querySelector('.nsm7Bb-HzV7m-LgbsSe-BPrWId');

						if (svgElement && textSpan) {
							// Clear button content
							button.innerHTML = '';

							// Create icon wrapper
							const iconWrapper = document.createElement('div');
							iconWrapper.style.cssText = `
								display: flex !important;
								align-items: center !important;
								flex-shrink: 0 !important;
							`;

							// Create text wrapper - match email button text style
							const textWrapper = document.createElement('span');
							textWrapper.style.cssText = `
								font-weight: 400 !important;
								color: rgb(17, 24, 39) !important;
								font-size: 14px !important;
								line-height: 1.5 !important;
								margin: 0 !important;
								font-family: system-ui, -apple-system, sans-serif !important;
							`;
							textWrapper.textContent = mode === 'login' ? 'Continue with Google' : 'Sign up with Google';

							// Style the SVG to match email icon size
							svgElement.style.cssText = `
								width: 16px !important;
								height: 16px !important;
								flex-shrink: 0 !important;
								margin: 0 !important;
							`;

							// Append in correct order
							iconWrapper.appendChild(svgElement);
							button.appendChild(iconWrapper);
							button.appendChild(textWrapper);
						}

						// Add hover effect
						button.addEventListener('mouseenter', () => {
							button.style.backgroundColor = 'rgb(249, 250, 251) !important';
						});
						button.addEventListener('mouseleave', () => {
							button.style.backgroundColor = 'white !important';
						});
					}

					// Hide iframe
					if (iframe) {
						iframe.style.cssText = 'display: none !important;';
					}
				}
			}, 100);
		}
	}, [isReady, googleAuth, mode, googleClientId]);

	const handleGoogleCallback = async (response: { credential: string }) => {
		if (!response.credential) {
			toast.error('Google Authentication Failed', {
				description: 'No credential received from Google',
			});
			if (onError) {
				onError('No credential received from Google');
			}
			return;
		}

		try {
			setIsLoading(true);

			// Parse the JWT token to get user info
			const userInfo = googleAuth?.parseJwtPayload(response.credential);

			toast.success('Google Authentication Successful', {
				description: `Welcome, ${userInfo?.name}!`,
			});

			if (onSuccess) {
				onSuccess(response.credential);
			}
		} catch (error) {
			console.error('Google authentication error:', error);
			toast.error('Google Authentication Failed', {
				description: error instanceof Error ? error.message : 'Failed to parse Google credential',
			});
			if (onError) {
				onError(error instanceof Error ? error.message : 'Authentication failed');
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Loading state
	if (!isReady) {
		return (
			<button
				type="button"
				disabled
				className={`w-full py-2.5 px-4 border border-input rounded-md font-medium text-sm text-muted-foreground bg-muted flex items-center justify-center gap-2 ${className}`}
			>
				<Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />
				<span>Loading Google Sign-In...</span>
			</button>
		);
	}

	return (
		<div className={`w-full ${className}`}>
			<div ref={googleButtonRef} className="w-full" style={{ minHeight: '40px' }} />
			{isLoading && (
				<div className="mt-2 text-center text-sm text-muted-foreground">
					<div className="flex items-center justify-center gap-2">
						<Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />
						<span>Processing Google sign-in...</span>
					</div>
				</div>
			)}
		</div>
	);
};

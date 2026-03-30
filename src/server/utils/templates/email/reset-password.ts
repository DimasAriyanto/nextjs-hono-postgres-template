import { baseEmailTemplate, baseEmailText } from './base';

interface ResetPasswordEmailParams {
	appName: string;
	resetUrl: string;
	userName?: string;
	expirationHours?: number;
}

export const resetPasswordEmailTemplate = (params: ResetPasswordEmailParams): string => {
	const { appName, resetUrl, userName, expirationHours = 1 } = params;

	const content = `
		<p>Hi${userName ? ` ${userName}` : ''},</p>
		<p>We received a request to reset the password for your <strong>${appName}</strong> account. Click the button below to set a new password:</p>

		<div class="button-container">
			<a href="${resetUrl}" class="button">Reset Password</a>
		</div>

		<div class="info-box">
			This link will expire in <strong>${expirationHours} hour${expirationHours > 1 ? 's' : ''}</strong>.
			If you did not request a password reset, no action is needed.
		</div>

		<p style="font-size: 13px; color: #666;">
			If the button doesn't work, copy and paste this link into your browser:
		</p>
		<p class="link-fallback">${resetUrl}</p>
	`;

	return baseEmailTemplate({ appName, title: 'Reset Your Password', content });
};

export const resetPasswordEmailText = (params: ResetPasswordEmailParams): string => {
	const { appName, resetUrl, userName, expirationHours = 1 } = params;

	return baseEmailText(
		appName,
		`Hi${userName ? ` ${userName}` : ''},

We received a request to reset your ${appName} password. Use the link below:

${resetUrl}

This link will expire in ${expirationHours} hour${expirationHours > 1 ? 's' : ''}.
If you did not request this, no action is needed.`
	);
};

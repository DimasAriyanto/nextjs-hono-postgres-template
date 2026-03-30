import { baseEmailTemplate, baseEmailText } from './base';

interface VerificationEmailParams {
	appName: string;
	verificationUrl: string;
	userName?: string;
	expirationHours?: number;
}

export const verificationEmailTemplate = (params: VerificationEmailParams): string => {
	const { appName, verificationUrl, userName, expirationHours = 24 } = params;

	const content = `
		<p>Hi${userName ? ` ${userName}` : ''},</p>
		<p>Thank you for registering with <strong>${appName}</strong>. Please verify your email address by clicking the button below:</p>

		<div class="button-container">
			<a href="${verificationUrl}" class="button">Verify Email Address</a>
		</div>

		<div class="info-box">
			This verification link will expire in <strong>${expirationHours} hours</strong>.
		</div>

		<p style="font-size: 13px; color: #666;">
			If the button doesn't work, copy and paste this link into your browser:
		</p>
		<p class="link-fallback">${verificationUrl}</p>
	`;

	return baseEmailTemplate({ appName, title: 'Verify Your Email', content });
};

export const verificationEmailText = (params: VerificationEmailParams): string => {
	const { appName, verificationUrl, userName, expirationHours = 24 } = params;

	return baseEmailText(
		appName,
		`Hi${userName ? ` ${userName}` : ''},

Thank you for registering with ${appName}. Please verify your email address:

${verificationUrl}

This link will expire in ${expirationHours} hours.`
	);
};

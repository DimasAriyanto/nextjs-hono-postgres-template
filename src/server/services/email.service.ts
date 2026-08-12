import nodemailer from 'nodemailer';
import {
	verificationEmailTemplate,
	verificationEmailText,
	resetPasswordEmailTemplate,
	resetPasswordEmailText,
} from '@/server/utils/templates/email';
import { settingService } from '@/server/services/setting.service';

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
	appName?: string;
}

export class EmailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: Number(process.env.MAIL_PORT) || 465,
			secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		});
	}

	/**
	 * Resolve the app name — settings value takes priority, falling back to
	 * the APP_NAME env var, then a hardcoded default (see SettingService).
	 */
	private async getAppName(): Promise<string> {
		const { app_name } = await settingService.getSettings();
		return app_name;
	}

	/**
	 * Send email
	 */
	async send(options: SendEmailOptions): Promise<boolean> {
		try {
			const appName = options.appName ?? await this.getAppName();

			await this.transporter.sendMail({
				from: `"${appName}" <${process.env.MAIL_FROM_ADDRESS}>`,
				to: options.to,
				subject: options.subject,
				html: options.html,
				text: options.text,
			});
			return true;
		} catch (error) {
			console.error('Email sending failed:', error);
			return false;
		}
	}

	/**
	 * Send verification email
	 */
	async sendVerificationEmail(params: { to: string; token: string; userName?: string }): Promise<boolean> {
		const { to, token, userName } = params;
		const appName = await this.getAppName();
		const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

		const verificationUrl = `${appUrl}/api/v1/auths/verify-email?token=${token}`;

		return this.send({
			to,
			appName,
			subject: `Verify your email - ${appName}`,
			html: verificationEmailTemplate({ appName, verificationUrl, userName, expirationHours: 24 }),
			text: verificationEmailText({ appName, verificationUrl, userName, expirationHours: 24 }),
		});
	}

	/**
	 * Send password reset email
	 */
	async sendPasswordResetEmail(params: { to: string; token: string; userName?: string }): Promise<boolean> {
		const { to, token, userName } = params;
		const appName = await this.getAppName();
		const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

		const resetUrl = `${appUrl}/reset-password?token=${token}`;

		return this.send({
			to,
			appName,
			subject: `Reset your password - ${appName}`,
			html: resetPasswordEmailTemplate({ appName, resetUrl, userName, expirationHours: 1 }),
			text: resetPasswordEmailText({ appName, resetUrl, userName, expirationHours: 1 }),
		});
	}
}

export const emailService = new EmailService();

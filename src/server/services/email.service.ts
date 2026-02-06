import nodemailer from 'nodemailer';
import { verificationEmailTemplate, verificationEmailText } from '@/server/utils/templates/email';

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
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
	 * Send email
	 */
	async send(options: SendEmailOptions): Promise<boolean> {
		try {
			await this.transporter.sendMail({
				from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
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
		const appName = process.env.APP_NAME || 'App';
		const appUrl = process.env.APP_URL || 'http://localhost:3000';

		const verificationUrl = `${appUrl}/api/v1/auths/verify-email?token=${token}`;

		const html = verificationEmailTemplate({
			appName,
			verificationUrl,
			userName,
			expirationHours: 24,
		});

		const text = verificationEmailText({
			appName,
			verificationUrl,
			userName,
			expirationHours: 24,
		});

		return this.send({
			to,
			subject: `Verify your email - ${appName}`,
			html,
			text,
		});
	}

	/**
	 * Send password reset email
	 */
	async sendPasswordResetEmail(params: { to: string; token: string; userName?: string }): Promise<boolean> {
		const { to, token, userName } = params;
		const appName = process.env.APP_NAME || 'App';
		const appUrl = process.env.APP_URL || 'http://localhost:3000';

		const resetUrl = `${appUrl}/reset-password?token=${token}`;

		const html = `
			<h1>Reset Your Password</h1>
			<p>Hi${userName ? ` ${userName}` : ''},</p>
			<p>You requested to reset your password. Click the link below:</p>
			<a href="${resetUrl}">Reset Password</a>
			<p>This link will expire in 1 hour.</p>
			<p>If you didn't request this, please ignore this email.</p>
		`;

		return this.send({
			to,
			subject: `Reset your password - ${appName}`,
			html,
		});
	}
}

export const emailService = new EmailService();

interface VerificationEmailParams {
	appName: string;
	verificationUrl: string;
	userName?: string;
	expirationHours?: number;
}

/**
 * Generate HTML email template for email verification
 */
export const verificationEmailTemplate = (params: VerificationEmailParams): string => {
	const { appName, verificationUrl, userName, expirationHours = 24 } = params;

	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ${appName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .link {
            word-break: break-all;
            color: #2563eb;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${appName}</h1>
        </div>
        <div class="content">
            <p>Hi${userName ? ` ${userName}` : ''},</p>
            <p>Thank you for registering with ${appName}. Please verify your email address by clicking the button below:</p>

            <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>

            <p>This verification link will expire in <strong>${expirationHours} hours</strong>.</p>

            <p>If you didn't create an account with ${appName}, you can safely ignore this email.</p>

            <p style="margin-top: 20px; font-size: 13px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p class="link">${verificationUrl}</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
};

/**
 * Generate plain text email for email verification
 */
export const verificationEmailText = (params: VerificationEmailParams): string => {
	const { appName, verificationUrl, userName, expirationHours = 24 } = params;

	return `
Hi${userName ? ` ${userName}` : ''},

Thank you for registering with ${appName}. Please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in ${expirationHours} hours.

If you didn't create an account with ${appName}, you can safely ignore this email.

---
${appName}
`;
};

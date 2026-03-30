interface BaseEmailParams {
	appName: string;
	title: string;
	content: string;
}

/**
 * Shared HTML wrapper for all email templates.
 * Provides consistent layout, typography, and styling across all emails.
 */
export const baseEmailTemplate = ({ appName, title, content }: BaseEmailParams): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${appName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid #eeeeee;
        }
        .header h1 {
            color: #111111;
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.3px;
        }
        .content p {
            margin: 0 0 16px;
            font-size: 15px;
            color: #444444;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background-color: #111111;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
        }
        .info-box {
            background-color: #f9f9f9;
            border: 1px solid #eeeeee;
            border-radius: 6px;
            padding: 16px 20px;
            margin: 24px 0;
            font-size: 13px;
            color: #666666;
        }
        .link-fallback {
            word-break: break-all;
            color: #111111;
            font-size: 12px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #999999;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>${appName}</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                <p>If you didn't request this email, you can safely ignore it.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

/**
 * Shared plain text footer
 */
export const baseEmailText = (appName: string, body: string): string =>
	`${body}

---
${appName}
If you didn't request this email, you can safely ignore it.
`;

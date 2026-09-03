import crypto from 'crypto';

/**
 * One-off CLI: prints a fresh APP_KEY / APP_COOKIE_KEY pair to paste into `.env`.
 * Never reuse the values shipped in `.env.example` — they're public (checked into git),
 * so anyone who clones this template can forge JWTs signed with them.
 */
function generateAppKey(): string {
	return `base64:${crypto.randomBytes(32).toString('base64')}`;
}

function generateCookieKey(): string {
	return crypto.randomBytes(32).toString('base64url');
}

console.log('\nGenerated secrets — paste these into your .env (do not reuse the .env.example values):\n');
console.log(`APP_KEY=${generateAppKey()}`);
console.log(`APP_COOKIE_KEY="${generateCookieKey()}"`);
console.log('');

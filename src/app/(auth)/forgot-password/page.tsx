import type { Metadata } from 'next';

export const metadata: Metadata = {
	robots: 'noindex, nofollow',
};

export default function Page() {
	return (
		<div>
			<p>Forgot Password</p>
		</div>
	);
}

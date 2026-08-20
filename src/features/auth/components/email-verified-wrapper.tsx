import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type TVerificationStatus = 'success' | 'already-verified' | 'expired' | 'invalid';

const STATUS_CONTENT: Record<TVerificationStatus, { icon: typeof CheckCircle2; title: string; description: string }> = {
	success: {
		icon: CheckCircle2,
		title: 'Email verified',
		description: 'Your email has been verified successfully. You can now sign in to your account.',
	},
	'already-verified': {
		icon: CheckCircle2,
		title: 'Already verified',
		description: 'This email address has already been verified. You can sign in to your account.',
	},
	expired: {
		icon: Clock,
		title: 'Link expired',
		description: 'This verification link has expired. Sign in and request a new one from your account settings.',
	},
	invalid: {
		icon: XCircle,
		title: 'Invalid link',
		description: 'This verification link is invalid. Sign in and request a new one from your account settings.',
	},
};

interface EmailVerifiedWrapperProps {
	status?: string;
}

export const EmailVerifiedWrapper = ({ status }: EmailVerifiedWrapperProps) => {
	const content = STATUS_CONTENT[status as TVerificationStatus] ?? STATUS_CONTENT.invalid;
	const Icon = content.icon;
	const isSuccess = content === STATUS_CONTENT.success || content === STATUS_CONTENT['already-verified'];

	return (
		<div className={cn('flex flex-col gap-6')}>
			<Link href="/" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft size={16} />
				Back to home
			</Link>
			<Card className="overflow-hidden p-0">
				<CardContent className="p-6 md:p-8">
					<div className="flex flex-col items-center gap-3 text-center">
						<span
							className={cn(
								'flex size-12 items-center justify-center rounded-full',
								isSuccess ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive',
							)}
						>
							<Icon className="size-6" />
						</span>
						<h1 className="text-2xl font-bold">{content.title}</h1>
						<p className="text-balance text-sm text-muted-foreground">{content.description}</p>
					</div>

					<Button asChild className="mt-6 w-full">
						<Link href="/login">Sign in</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

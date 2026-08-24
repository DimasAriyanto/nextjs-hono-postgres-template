import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type TVerificationStatus = 'success' | 'already-verified' | 'expired' | 'invalid';

const STATUS_ICONS: Record<TVerificationStatus, typeof CheckCircle2> = {
	success: CheckCircle2,
	'already-verified': CheckCircle2,
	expired: Clock,
	invalid: XCircle,
};

const STATUS_MESSAGE_KEYS: Record<TVerificationStatus, string> = {
	success: 'success',
	'already-verified': 'alreadyVerified',
	expired: 'expired',
	invalid: 'invalid',
};

interface EmailVerifiedWrapperProps {
	status?: string;
}

export const EmailVerifiedWrapper = async ({ status }: EmailVerifiedWrapperProps) => {
	const verificationStatus: TVerificationStatus = (status as TVerificationStatus) in STATUS_ICONS ? (status as TVerificationStatus) : 'invalid';
	const Icon = STATUS_ICONS[verificationStatus];
	const isSuccess = verificationStatus === 'success' || verificationStatus === 'already-verified';

	const [t, tStatus] = await Promise.all([
		getTranslations('auth'),
		getTranslations(`auth.emailVerified.status.${STATUS_MESSAGE_KEYS[verificationStatus]}`),
	]);

	return (
		<div className={cn('flex flex-col gap-6')}>
			<Link href="/" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft size={16} />
				{t('backToHome')}
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
						<h1 className="text-2xl font-bold">{tStatus('title')}</h1>
						<p className="text-balance text-sm text-muted-foreground">{tStatus('description')}</p>
					</div>

					<Button asChild className="mt-6 w-full">
						<Link href="/login">{t('emailVerified.signIn')}</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

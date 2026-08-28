'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { forgotPasswordSchema, type TForgotPasswordRequest } from '@/contracts';
import { useForgotPassword } from '@/features/auth/hooks/use-auth';
import { ApiError } from '@/libs/api';
import Link from 'next/link';
import { TurnstileWidget } from '@/components/ui/turnstile';

export const ForgotPasswordWrapper = () => {
	const [isSuccess, setIsSuccess] = useState(false);
	const [turnstileToken, setTurnstileToken] = useState('');
	const turnstileRef = useRef<{ reset: () => void } | null>(null);
	const t = useTranslations('auth');
	const tForgot = useTranslations('auth.forgotPassword');
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
		watch,
	} = useForm<TForgotPasswordRequest>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const { mutate, isPending } = useForgotPassword({
		onSuccess: () => {
			setIsSuccess(true);
		},
		onError: (error) => {
			if (error instanceof ApiError) {
				if (error.isValidationError()) {
					const emailErrors = error.getFieldErrors('email');
					if (emailErrors.length > 0) {
						setError('email', { message: emailErrors[0] });
					}
				} else {
					toast.error(tForgot('errorTitle'), { description: error.message });
				}
			} else {
				toast.error(tForgot('errorTitle'), { description: tForgot('genericError') });
			}
		},
	});

	const onSubmit = (values: TForgotPasswordRequest) => {
		mutate({ ...values, cf_turnstile_token: turnstileToken || undefined });
		turnstileRef.current?.reset();
		setTurnstileToken('');
	};

	const emailValue = watch('email');

	return (
		<div className={cn('flex flex-col gap-6')}>
			<Link href="/" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft size={16} />
				{t('backToHome')}
			</Link>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-12">
					<div className="p-6 md:p-8 lg:p-10 md:col-span-7">
						{!isSuccess ? (
							<form onSubmit={handleSubmit(onSubmit)}>
								<FieldGroup>
									<div className="flex flex-col items-center gap-2 text-center">
										<h1 className="text-2xl font-bold">{tForgot('heading')}</h1>
										<p className="text-muted-foreground text-balance text-sm">
											{tForgot('subtitle')}
										</p>
									</div>

									<Field>
										<FieldLabel htmlFor="email">{tForgot('email')}</FieldLabel>
										<Input
											id="email"
											type="email"
											placeholder="m@example.com"
											{...register('email')}
										/>
										<FieldError errors={[errors.email]} />
									</Field>

									<Button type="submit" disabled={isPending} className="w-full">
										{isPending ? tForgot('submitting') : tForgot('submit')}
									</Button>

									<TurnstileWidget
										onVerify={setTurnstileToken}
										onExpire={() => setTurnstileToken('')}
										onError={() => setTurnstileToken('')}
										widgetRef={turnstileRef}
									/>

									<FieldDescription className="text-center">
										{tForgot('rememberPassword')}{' '}
										<Link href="/login" className="underline underline-offset-4">
											{tForgot('signIn')}
										</Link>
									</FieldDescription>
								</FieldGroup>
							</form>
						) : (
							<FieldGroup>
								<div className="flex flex-col items-center gap-2 text-center">
									<h1 className="text-2xl font-bold">{tForgot('checkEmailHeading')}</h1>
									<p className="text-muted-foreground text-balance text-sm">
										{tForgot('checkEmailSubtitle')}
									</p>
									<p className="font-medium">{emailValue}</p>
									<p className="text-muted-foreground text-balance text-sm">
										{tForgot('checkEmailExpiry')}
									</p>
								</div>

								<Button asChild className="w-full">
									<Link href="/login">{tForgot('backToLogin')}</Link>
								</Button>
							</FieldGroup>
						)}
					</div>
					<div className="bg-muted relative hidden md:col-span-5 md:block overflow-hidden">
						<img
							src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000&auto=format&fit=crop"
							alt="Forgot Password"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.7]"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

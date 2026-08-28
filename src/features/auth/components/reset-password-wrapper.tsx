'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { resetPasswordSchema, type TResetPasswordRequest } from '@/contracts';
import { useResetPassword } from '@/features/auth/hooks/use-auth';
import { ApiError } from '@/libs/api';
import Link from 'next/link';

interface ResetPasswordWrapperProps {
	token: string;
}

export const ResetPasswordWrapper = ({ token }: ResetPasswordWrapperProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
	const t = useTranslations('auth');
	const tReset = useTranslations('auth.resetPassword');

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<TResetPasswordRequest>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			token,
			password: '',
			password_confirmation: '',
		},
	});

	const { mutate, isPending } = useResetPassword({
		onSuccess: () => {
			toast.success(tReset('successTitle'), { description: tReset('successDescription') });
		},
		onError: (error) => {
			if (error instanceof ApiError) {
				if (error.isValidationError()) {
					const passwordErrors = error.getFieldErrors('password');
					const confirmErrors = error.getFieldErrors('password_confirmation');

					if (passwordErrors.length > 0) {
						setError('password', { message: passwordErrors[0] });
					}
					if (confirmErrors.length > 0) {
						setError('password_confirmation', { message: confirmErrors[0] });
					}
				} else {
					toast.error(tReset('errorTitle'), { description: error.message });
				}
			} else {
				toast.error(tReset('errorTitle'), { description: tReset('genericError') });
			}
		},
	});

	const onSubmit = (values: TResetPasswordRequest) => {
		mutate(values);
	};

	return (
		<div className={cn('flex flex-col gap-6')}>
			<Link href="/" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft size={16} />
				{t('backToHome')}
			</Link>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-12">
					<form className="p-6 md:p-8 lg:p-10 md:col-span-7" onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">{tReset('heading')}</h1>
								<p className="text-muted-foreground text-balance text-sm">
									{tReset('subtitle')}
								</p>
							</div>

							<Field>
								<FieldLabel htmlFor="password">{tReset('newPassword')}</FieldLabel>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										placeholder={tReset('passwordPlaceholder')}
										className="pr-9"
										{...register('password')}
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onClick={() => setShowPassword((v) => !v)}
										tabIndex={-1}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								<FieldError errors={[errors.password]} />
							</Field>

							<Field>
								<FieldLabel htmlFor="password_confirmation">{tReset('confirmPassword')}</FieldLabel>
								<div className="relative">
									<Input
										id="password_confirmation"
										type={showPasswordConfirm ? 'text' : 'password'}
										placeholder={tReset('confirmPlaceholder')}
										className="pr-9"
										{...register('password_confirmation')}
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onClick={() => setShowPasswordConfirm((v) => !v)}
										tabIndex={-1}
									>
										{showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								<FieldError errors={[errors.password_confirmation]} />
							</Field>

							<Button type="submit" disabled={isPending} className="w-full">
								{isPending ? tReset('submitting') : tReset('submit')}
							</Button>

							<FieldDescription className="text-center">
								{tReset('rememberPassword')}{' '}
								<Link href="/login" className="underline underline-offset-4">
									{tReset('signIn')}
								</Link>
							</FieldDescription>
						</FieldGroup>
					</form>
					<div className="bg-muted relative hidden md:col-span-5 md:block overflow-hidden">
						<img
							src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop"
							alt="Reset Password"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.7]"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

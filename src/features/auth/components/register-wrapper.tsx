'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { GoogleAuthButton } from '@/components/google-auth-button';
import { registerSchema, type TRegisterRequest } from '@/contracts';
import { useRegister, useGoogleAuth } from '@/features/auth/hooks/use-auth';
import { ApiError } from '@/libs/api';

export const RegisterWrapper = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const t = useTranslations('auth');
	const tRegister = useTranslations('auth.register');

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<TRegisterRequest>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			title: '',
			email: '',
			password: '',
			password_confirmation: '',
		},
	});

	const { mutate, isPending } = useRegister({
		onSuccess: () => {
			toast.success(tRegister('successTitle'), {
				description: tRegister('successDescription'),
			});
		},
		onError: (error) => {
			if (error instanceof ApiError) {
				if (error.isValidationError()) {
					const titleErrors = error.getFieldErrors('title');
					const emailErrors = error.getFieldErrors('email');
					const passwordErrors = error.getFieldErrors('password');
					const confirmErrors = error.getFieldErrors('password_confirmation');

					if (titleErrors.length > 0) {
						setError('title', { message: titleErrors[0] });
					}
					if (emailErrors.length > 0) {
						setError('email', { message: emailErrors[0] });
					}
					if (passwordErrors.length > 0) {
						setError('password', { message: passwordErrors[0] });
					}
					if (confirmErrors.length > 0) {
						setError('password_confirmation', { message: confirmErrors[0] });
					}
				} else {
					toast.error(tRegister('errorTitle'), { description: error.message });
				}
			} else {
				toast.error(tRegister('errorTitle'), { description: tRegister('genericError') });
			}
		},
	});

	const { mutate: googleAuthMutate } = useGoogleAuth({
		onError: (error) => {
			toast.error(t('googleErrorTitle'), { description: error.message });
		},
	});

	const onSubmit = (values: TRegisterRequest) => {
		mutate(values);
	};

	const handleGoogleSuccess = (credential: string) => {
		googleAuthMutate({ token: credential });
	};

	const handleGoogleError = (error: string) => {
		toast.error(t('googleErrorTitle'), { description: error });
	};

	return (
		<div className={cn('flex flex-col gap-6')}>
			<Link href="/" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft size={16} />
				{t('backToHome')}
			</Link>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">{tRegister('heading')}</h1>
								<p className="text-muted-foreground text-sm text-balance">
									{tRegister('subtitle')}
								</p>
							</div>

							<Field>
								<FieldLabel htmlFor="title">{tRegister('fullName')}</FieldLabel>
								<Input id="title" type="text" placeholder="John Doe" {...register('title')} />
								<FieldError errors={[errors.title]} />
							</Field>

							<Field>
								<FieldLabel htmlFor="email">{tRegister('email')}</FieldLabel>
								<Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
								<FieldError errors={[errors.email]} />
								<FieldDescription>
									{tRegister('emailHint')}
								</FieldDescription>
							</Field>

							<Field>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="password">{tRegister('password')}</FieldLabel>
										<div className="relative">
											<Input id="password" type={showPassword ? 'text' : 'password'} className="pr-10" {...register('password')} />
											<button
												type="button"
												onClick={() => setShowPassword((prev) => !prev)}
												className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
												tabIndex={-1}
											>
												{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
											</button>
										</div>
										<FieldError errors={[errors.password]} />
									</Field>
									<Field>
										<FieldLabel htmlFor="password_confirmation">{tRegister('confirmPassword')}</FieldLabel>
										<div className="relative">
											<Input id="password_confirmation" type={showConfirmPassword ? 'text' : 'password'} className="pr-10" {...register('password_confirmation')} />
											<button
												type="button"
												onClick={() => setShowConfirmPassword((prev) => !prev)}
												className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
												tabIndex={-1}
											>
												{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
											</button>
										</div>
										<FieldError errors={[errors.password_confirmation]} />
									</Field>
								</div>
								<FieldDescription>{tRegister('passwordHint')}</FieldDescription>
							</Field>

							<Button type="submit" disabled={isPending} className="w-full">
								{isPending ? tRegister('submitting') : tRegister('submit')}
							</Button>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">{t('orContinueWith')}</FieldSeparator>

							<GoogleAuthButton mode="register" onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

							<div className="text-center text-sm">
								{tRegister('haveAccount')}{' '}
								<a href="/login" className="underline underline-offset-4">
									{tRegister('signIn')}
								</a>
							</div>
						</FieldGroup>
					</form>
					<div className="bg-muted relative hidden md:block">
						<img
							src="/placeholder.svg"
							alt="Image"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
						/>
					</div>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				{t.rich('termsAgreement', {
					terms: (chunks) => <a href="/terms-of-service">{chunks}</a>,
					privacy: (chunks) => <a href="/privacy-policy">{chunks}</a>,
				})}
			</FieldDescription>
		</div>
	);
};

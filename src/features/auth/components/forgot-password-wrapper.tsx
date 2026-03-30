'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { forgotPasswordSchema, type TForgotPasswordRequest } from '@/contracts';
import { useForgotPassword } from '@/features/auth/hooks/use-auth';
import { ApiError } from '@/libs/api';
import Link from 'next/link';

export const ForgotPasswordWrapper = () => {
	const [isSuccess, setIsSuccess] = useState(false);
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
					toast.error('Failed to send reset email', { description: error.message });
				}
			} else {
				toast.error('Failed to send reset email', { description: 'An error occurred, please try again.' });
			}
		},
	});

	const onSubmit = (values: TForgotPasswordRequest) => {
		mutate(values);
	};

	const emailValue = watch('email');

	return (
		<div className={cn('flex flex-col gap-6')}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<div className="p-6 md:p-8">
						{!isSuccess ? (
							<form onSubmit={handleSubmit(onSubmit)}>
								<FieldGroup>
									<div className="flex flex-col items-center gap-2 text-center">
										<h1 className="text-2xl font-bold">Forgot your password?</h1>
										<p className="text-muted-foreground text-balance text-sm">
											Enter your email and we&apos;ll send you a reset link
										</p>
									</div>

									<Field>
										<FieldLabel htmlFor="email">Email</FieldLabel>
										<Input
											id="email"
											type="email"
											placeholder="m@example.com"
											{...register('email')}
										/>
										<FieldError errors={[errors.email]} />
									</Field>

									<Button type="submit" disabled={isPending} className="w-full">
										{isPending ? 'Sending...' : 'Send Reset Link'}
									</Button>

									<FieldDescription className="text-center">
										Remember your password?{' '}
										<Link href="/login" className="underline underline-offset-4">
											Sign in
										</Link>
									</FieldDescription>
								</FieldGroup>
							</form>
						) : (
							<FieldGroup>
								<div className="flex flex-col items-center gap-2 text-center">
									<h1 className="text-2xl font-bold">Check your email</h1>
									<p className="text-muted-foreground text-balance text-sm">
										We sent a reset link to
									</p>
									<p className="font-medium">{emailValue}</p>
									<p className="text-muted-foreground text-balance text-sm">
										The link will expire in 1 hour.
									</p>
								</div>

								<Button asChild className="w-full">
									<Link href="/login">Back to Login</Link>
								</Button>
							</FieldGroup>
						)}
					</div>
					<div className="bg-muted relative hidden md:block">
						<img
							src="/placeholder.svg"
							alt="Image"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

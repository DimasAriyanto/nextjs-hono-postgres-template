'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { GoogleAuthButton } from '@/components/google-auth-button';
import { loginSchema, type TLoginRequest } from '@/contracts';
import { useLogin, useGoogleAuth } from '@/features/auth/hooks/use-auth';
import { ApiError } from '@/libs/api';

export const LoginWrapper = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<TLoginRequest>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const { mutate, isPending } = useLogin({
		onError: (error) => {
			if (error instanceof ApiError) {
				if (error.isValidationError()) {
					const emailErrors = error.getFieldErrors('email');
					const passwordErrors = error.getFieldErrors('password');

					if (emailErrors.length > 0) {
						setError('email', { message: emailErrors[0] });
					}
					if (passwordErrors.length > 0) {
						setError('password', { message: passwordErrors[0] });
					}
				} else {
					toast.error('Login Error', { description: error.message });
				}
			} else {
				toast.error('Login Error', { description: 'An error occurred during login' });
			}
		},
	});

	const { mutate: googleAuthMutate } = useGoogleAuth();

	const onSubmit = (values: TLoginRequest) => {
		mutate(values);
	};

	const handleGoogleSuccess = (credential: string) => {
		googleAuthMutate({ token: credential });
	};

	const handleGoogleError = (error: string) => {
		toast.error('Google Authentication Failed', { description: error });
	};

	return (
		<div className={cn('flex flex-col gap-6')}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">Welcome back</h1>
								<p className="text-muted-foreground text-balance">Login to your account</p>
							</div>

							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
								<FieldError errors={[errors.email]} />
							</Field>

							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<a href="/forgot-password" className="ml-auto text-sm underline-offset-2 hover:underline">
										Forgot your password?
									</a>
								</div>
								<Input id="password" type="password" {...register('password')} />
								<FieldError errors={[errors.password]} />
							</Field>

							<Button type="submit" disabled={isPending} className="w-full">
								{isPending ? 'Logging in...' : 'Login'}
							</Button>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

							<GoogleAuthButton mode="login" onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

							<FieldDescription className="text-center">
								Don&apos;t have an account?{' '}
								<a href="/register" className="underline underline-offset-4">
									Sign up
								</a>
							</FieldDescription>
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
				By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
};

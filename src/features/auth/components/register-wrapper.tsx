'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { registerSchema, type TRegisterRequest } from '@/contracts';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { ApiError } from '@/libs/api';

export const RegisterWrapper = () => {
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
			toast.success('Register successful', {
				description: 'Your account has been created successfully.',
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
					toast.error('Register Error', { description: error.message });
				}
			} else {
				toast.error('Register Error', { description: 'An error occurred during registration.' });
			}
		},
	});

	const onSubmit = (values: TRegisterRequest) => {
		mutate(values);
	};

	return (
		<div className={cn('flex flex-col gap-6')}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">Create your account</h1>
								<p className="text-muted-foreground text-sm text-balance">
									Enter your details below to create your account
								</p>
							</div>

							<Field>
								<FieldLabel htmlFor="title">Full Name</FieldLabel>
								<Input id="title" type="text" placeholder="John Doe" {...register('title')} />
								<FieldError errors={[errors.title]} />
							</Field>

							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
								<FieldError errors={[errors.email]} />
								<FieldDescription>
									We&apos;ll use this to contact you. We will not share your email with any other.
								</FieldDescription>
							</Field>

							<Field>
								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<Input id="password" type="password" {...register('password')} />
										<FieldError errors={[errors.password]} />
									</Field>
									<Field>
										<FieldLabel htmlFor="password_confirmation">Confirm Password</FieldLabel>
										<Input id="password_confirmation" type="password" {...register('password_confirmation')} />
										<FieldError errors={[errors.password_confirmation]} />
									</Field>
								</div>
								<FieldDescription>Must be at least 6 characters long.</FieldDescription>
							</Field>

							<Button type="submit" disabled={isPending} className="w-full">
								{isPending ? 'Creating account...' : 'Create Account'}
							</Button>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

							<div className="flex justify-center">
								<Button variant="outline" type="button" className="w-full">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
										<path
											d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
											fill="currentColor"
										/>
									</svg>
									Sign up with Google
								</Button>
							</div>

							<div className="text-center text-sm">
								Already have an account?{' '}
								<a href="/login" className="underline underline-offset-4">
									Sign in
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
				By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
};

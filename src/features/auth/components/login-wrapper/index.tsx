'use client';

import { Icon } from '@/components/icon';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { signinRequest } from '../../apis/authentication';
import { type TSigninRequest } from '../../types/authentication';

const schema = z.object({
	email: z.email({ message: 'Please provide with email' }),
	password: z.string({ message: 'Please provide with password' }),
});

type TFormValues = z.infer<typeof schema>;

export const LoginWrapper = () => {
	const router = useRouter();

	const form = useForm<TFormValues>({
		resolver: zodResolver(schema),
	});

	const { mutate, isPending, isSuccess } = useMutation({
		mutationFn: signinRequest,
		onSuccess: () => {
			toast.success('Signin successful. Redirecting to dashboard...');
			// const { data } = response;

			router.replace('/gundala-admin/d');
		},
		onError: (error) => {
			toast.error('Signin Error', { description: error.message || 'An error occurred during login' });
			// console.error('[ERROR]: ', error);
		},
	});

	const onSubmit = (data: TSigninRequest) => {
		mutate(data);
	};

	return (
		<form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
			<p>Login Form</p>

			<button type="submit" tabIndex={4} disabled={isPending || isSuccess}>
				{(isPending || isSuccess) && <Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />}
				Let&lsquo;s Go..
			</button>
		</form>
	);
};

'use client';

import { Icon } from '@/components/icon';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

// import { registerRequest } from '../../apis/authentication';
import { type TRegisterRequest } from '../../types/authentication';

const schema = z.object({
	name: z.string({ message: 'Please provide with your name' }),
	email: z.email({ message: 'Please provide with email' }),
	password: z
		.string()
		.min(6, { message: 'Please give Password min 6 character.' })
		.refine((val) => val.includes('*') && val.includes('#'), { message: 'Password must contain both * and # characters' }),
});

type TFormValues = z.infer<typeof schema>;

export const RegisterWrapper = () => {
	const router = useRouter();

	const form = useForm<TFormValues>({
		resolver: zodResolver(schema),
	});

	const { mutate, isPending, isSuccess } = useMutation({
		mutationFn: (data: TRegisterRequest) => {
			// Replace with actual API call, e.g.:
			// return registerCustomersRequest(data);
			console.log(data);

			return Promise.resolve(data as TRegisterRequest);
		},
		onSuccess: () => {
			toast('Register successful', {
				description: 'Please wait you will redirect back. Our representative will contact you by email you submitted.',
			});
			router.replace('/');
		},
		onError: (error) => {
			toast.error('Register Error', { description: error.message || 'An error occurred during registration.' });
		},
	});

	const onSubmit = (data: TRegisterRequest) => {
		mutate(data);
	};

	return (
		<form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
			<div>
				<p>Form Register</p>
			</div>

			<button type="submit" className="mt-2 w-full" tabIndex={5} disabled={isPending || isSuccess}>
				{(isPending || isSuccess) && <Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />}
				Register now
			</button>
		</form>
	);
};

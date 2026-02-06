import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as authApi from '@/features/auth/apis/auth.api';
import type { TLoginRequest, TRegisterRequest } from '@/contracts';

/**
 * Query keys for auth
 */
export const authKeys = {
	all: ['auth'] as const,
	profile: () => [...authKeys.all, 'profile'] as const,
};

/**
 * Hook to get current user profile
 */
export function useProfile() {
	return useQuery({
		queryKey: authKeys.profile(),
		queryFn: authApi.getProfile,
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook for login mutation
 */
export function useLogin(options?: { onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (data: TLoginRequest) => authApi.login(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			router.push('/dashboard');
		},
		onError: options?.onError,
	});
}

/**
 * Hook for register mutation
 */
export function useRegister(options?: { onError?: (error: Error) => void; onSuccess?: () => void }) {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (data: TRegisterRequest) => authApi.register(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			options?.onSuccess?.();
			router.push('/dashboard');
		},
		onError: options?.onError,
	});
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: authApi.logout,
		onSuccess: () => {
			queryClient.clear();
			router.push('/login');
		},
	});
}

/**
 * Hook for resend verification email
 */
export function useResendVerification() {
	return useMutation({
		mutationFn: authApi.resendVerification,
	});
}

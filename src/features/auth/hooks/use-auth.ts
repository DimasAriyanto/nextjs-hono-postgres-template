import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as authApi from '@/features/auth/apis/auth.api';
import type { TForgotPasswordRequest, TLoginRequest, TLoginResponse, TRegisterRequest, TResetPasswordRequest, TUpdateProfileRequest, TChangePasswordRequest } from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

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
export function useLogin(options?: { onSuccess?: (result: ApiSuccessResponse<TLoginResponse>) => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (data: TLoginRequest) => authApi.login(data),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			const hasAdminAccess = result.data.is_admin || result.data.permissions.length > 0;
			router.push(hasAdminAccess ? '/gundala-admin/d' : '/');
			router.refresh();
			options?.onSuccess?.(result);
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
			router.refresh();
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
			router.refresh();
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

/**
 * Hook for forgot password mutation
 */
export function useForgotPassword(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	return useMutation({
		mutationFn: (data: TForgotPasswordRequest) => authApi.forgotPassword(data),
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	});
}

/**
 * Hook for reset password mutation
 */
export function useResetPassword(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const router = useRouter();

	return useMutation({
		mutationFn: (data: TResetPasswordRequest) => authApi.resetPassword(data),
		onSuccess: () => {
			options?.onSuccess?.();
			router.push('/login');
		},
		onError: options?.onError,
	});
}

/**
 * Hook for updating own profile
 */
export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TUpdateProfileRequest) => authApi.updateProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.profile() });
		},
	});
}

/**
 * Hook for changing own password
 */
export function useChangePassword() {
	return useMutation({
		mutationFn: (data: TChangePasswordRequest) => authApi.changePassword(data),
	});
}

/**
 * Hook for deleting own account
 */
export function useDeleteAccount() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: authApi.deleteAccount,
		onSuccess: () => {
			queryClient.clear();
			router.replace('/');
		},
	});
}

/**
 * Hook for Google authentication
 */
export function useGoogleAuth(options?: { onSuccess?: (result: ApiSuccessResponse<TLoginResponse>) => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (data: { token: string }) => authApi.googleAuth(data),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			const hasAdminAccess = result.data.is_admin || result.data.permissions.length > 0;
			router.push(hasAdminAccess ? '/gundala-admin/d' : '/');
			router.refresh();
			options?.onSuccess?.(result);
		},
		onError: options?.onError,
	});
}
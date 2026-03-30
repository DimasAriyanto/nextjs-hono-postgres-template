import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as authApi from '@/features/auth/apis/auth.api';
import type { TForgotPasswordRequest, TLoginRequest, TRegisterRequest, TResetPasswordRequest, TUpdateProfileRequest, TChangePasswordRequest } from '@/contracts';
import { toast } from 'sonner';

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
		onSuccess: (result) => {
			toast.success('Login successful', { description: 'Welcome back!' });
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			router.push(result.data.is_admin ? '/gundala-admin/d' : '/');
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
			toast.success('Logged out', { description: 'You have been successfully logged out.' });
			queryClient.clear();
			router.push('/login');
		},
		onError: () => {
			toast.error('Logout failed', { description: 'An error occurred. Please try again.' });
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
			toast.success('Profile updated', { description: 'Your profile has been updated successfully.' });
		},
		onError: (error: Error) => {
			toast.error('Update failed', { description: error.message });
		},
	});
}

/**
 * Hook for changing own password
 */
export function useChangePassword() {
	return useMutation({
		mutationFn: (data: TChangePasswordRequest) => authApi.changePassword(data),
		onSuccess: () => {
			toast.success('Password changed', { description: 'Your password has been changed successfully.' });
		},
		onError: (error: Error) => {
			toast.error('Change failed', { description: error.message });
		},
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
		onError: (error: Error) => {
			toast.error('Delete failed', { description: error.message });
		},
	});
}

/**
 * Hook for Google authentication
 */
export function useGoogleAuth() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (data: { token: string }) => authApi.googleAuth(data),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			router.push(result.data.is_admin ? '/gundala-admin/d' : '/');
		},
		onError: (error: Error) => {
			toast.error('Google Authentication Failed', { description: error.message });
		},
	});
}
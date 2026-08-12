'use client';

import { createContext, useContext } from 'react';
import type { TProfileResponse } from '@/contracts';
import type { TMenuPermissionKey } from '@/constants/permissions';

export interface TAuthContextValue {
	user?: TProfileResponse;
	role?: string;
	permissions?: string[];
	token?: string;
}

export const AuthContext = createContext<TAuthContextValue | undefined>(undefined);

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuthContext must be used within an AuthContextProvider');
	}
	return context;
}

export function useCan(key: TMenuPermissionKey) {
	const { role, permissions } = useAuthContext();
	return role === 'admin' || (permissions ?? []).includes(key);
}

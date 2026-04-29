'use client';

import { createContext } from 'react';
import type { TProfileResponse } from '@/contracts';

export interface TAuthContextValue {
	user?: TProfileResponse;
	role?: string;
	permissions?: string[];
	// setPermissions?: (permissions: string[]) => void;
	token?: string;
}

export const AuthContext = createContext<TAuthContextValue | undefined>(undefined);

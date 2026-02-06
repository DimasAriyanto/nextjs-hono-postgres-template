'use client';

import { createContext } from 'react';
import type { TTokenDecoded } from '@/types/auth';

export interface TAuthContextValue {
	user?: TTokenDecoded;
	role?: string;
	permissions?: string[];
	// setPermissions?: (permissions: string[]) => void;
	token?: string;
}

export const AuthContext = createContext<TAuthContextValue | undefined>(undefined);

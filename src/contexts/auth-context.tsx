'use client';

import { createContext } from 'react';
import type { TTokenPayload } from '@/contracts';

export interface TAuthContextValue {
	user?: TTokenPayload;
	role?: string;
	permissions?: string[];
	// setPermissions?: (permissions: string[]) => void;
	token?: string;
}

export const AuthContext = createContext<TAuthContextValue | undefined>(undefined);

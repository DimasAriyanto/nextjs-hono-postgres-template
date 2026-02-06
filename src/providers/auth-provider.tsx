'use client';

import { AuthContext, type TAuthContextValue } from '@/contexts/auth-context';
import { type PropsWithChildren } from 'react';

export const AuthContextProvider = ({ children, user, role, token, permissions }: PropsWithChildren<TAuthContextValue>) => {
	// const [permissions, setPermissions] = useState<string[]>([]);

	const value: TAuthContextValue = {
		user,
		role,
		token,
		permissions,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import NextAuth from 'next-auth';

import { authConfig } from '@/shared/config/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

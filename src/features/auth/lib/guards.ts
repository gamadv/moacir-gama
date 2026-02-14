'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function useRequireAuth(redirectTo = '/login') {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  return { session, status, isAuthenticated: !!session };
}

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
  };
}

'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

export function usePopupSignIn(callbackUrl?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  const signInWithPopup = useCallback(() => {
    setIsLoading(true);

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/auth/popup',
      'google-signin',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const interval = setInterval(async () => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          const session = await update();
          setIsLoading(false);

          if (session?.user) {
            router.push(callbackUrl || '/dashboard');
            router.refresh();
          }
        }
      } catch {
        // COOP bloqueia acesso a popup.closed enquanto está no Google
      }
    }, 500);
  }, [update, router, callbackUrl]);

  return { signInWithPopup, isLoading };
}

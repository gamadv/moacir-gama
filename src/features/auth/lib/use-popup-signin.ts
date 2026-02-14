'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

export function usePopupSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { update } = useSession();

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
          await update();
          setIsLoading(false);
        }
      } catch {
        // COOP bloqueia acesso a popup.closed enquanto está no Google
        // Ignorar — o check funcionará quando o popup voltar para nossa origem
      }
    }, 500);
  }, [update]);

  return { signInWithPopup, isLoading };
}

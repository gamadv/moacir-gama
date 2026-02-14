'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Suspense, useEffect } from 'react';

function PopupContent() {
  const searchParams = useSearchParams();
  const done = searchParams.get('done');

  useEffect(() => {
    if (done) {
      window.close();
    } else {
      signIn('google', { callbackUrl: `${window.location.origin}/auth/popup?done=1` });
    }
  }, [done]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">
        {done ? 'Login realizado! Fechando...' : 'Redirecionando para Google...'}
      </p>
    </main>
  );
}

export default function AuthPopupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando...</p>
        </main>
      }>
      <PopupContent />
    </Suspense>
  );
}

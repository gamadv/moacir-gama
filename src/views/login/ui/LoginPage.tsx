'use client';

import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { GoogleIcon, usePopupSignIn } from '@/features/auth';
import { Button } from '@/shared/ui/button';

export function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const { signInWithPopup, isLoading } = usePopupSignIn();

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-thin text-white mb-2">Entrar</h1>
          <p className="text-gray-400 text-sm">Acesse sua conta para ver recursos exclusivos</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm text-center">
              {error === 'OAuthAccountNotLinked'
                ? 'Este email já está vinculado a outra conta.'
                : 'Ocorreu um erro ao fazer login. Tente novamente.'}
            </p>
          </div>
        )}

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <Button
            variant="outline"
            className="w-full justify-center gap-3 py-6 text-white border-gray-700 hover:bg-gray-800"
            onClick={signInWithPopup}
            disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                Continuar com Google
              </>
            )}
          </Button>

          <p className="mt-6 text-xs text-gray-500 text-center">
            Ao continuar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </div>
      </div>
    </main>
  );
}

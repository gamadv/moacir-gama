'use client';

import { Lock } from 'lucide-react';

import { usePopupSignIn } from '@/features/auth';

import { Button } from '../button';

interface AuthLockedMessageProps {
  title?: string;
  message?: string;
}

export function AuthLockedMessage({
  title = 'Conteúdo Restrito',
  message = 'Faça login para acessar esta funcionalidade.',
}: AuthLockedMessageProps) {
  const { signInWithPopup, isLoading } = usePopupSignIn();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-800 p-4">
        <Lock className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-400">{message}</p>
      <Button onClick={signInWithPopup} disabled={isLoading} variant="default" size="sm">
        {isLoading ? 'Entrando...' : 'Entrar com Google'}
      </Button>
    </div>
  );
}

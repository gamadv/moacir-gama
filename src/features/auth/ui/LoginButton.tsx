'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { usePopupSignIn } from '../lib/use-popup-signin';
import { GoogleIcon } from './GoogleIcon';

interface LoginButtonProps {
  isLoading?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

export function LoginButton({ isLoading = false, variant = 'outline' }: LoginButtonProps) {
  const { signInWithPopup } = usePopupSignIn();

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={signInWithPopup}
      disabled={isLoading}
      className="text-gray-300 border-gray-600 hover:bg-gray-800 gap-2">
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <GoogleIcon className="w-4 h-4" />
          Entrar
        </>
      )}
    </Button>
  );
}

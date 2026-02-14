'use client';

import { signOut } from 'next-auth/react';

import { Button } from '@/shared/ui/button';

interface LogoutButtonProps {
  callbackUrl?: string;
}

export function LogoutButton({ callbackUrl = '/' }: LogoutButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl })}
      className="text-gray-400 hover:text-white">
      Sair
    </Button>
  );
}

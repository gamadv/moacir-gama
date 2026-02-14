'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

import { UserAvatar } from '@/entities/user';

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row ">
      <Link
        href="/dashboard"
        className="flex  text-sm items-center gap-2 text-gray-300 hover:text-white transition-colors">
        <UserAvatar src={session.user.image} name={session.user.name} size="sm" />
        {session.user.name}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
        Sair
      </button>
    </div>
  );
}

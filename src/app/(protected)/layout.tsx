import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { auth } from '@/shared/lib/auth/session';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { JardaniNav } from '@/features/jardani/ui/JardaniNav';
import { auth } from '@/shared/lib/auth/session';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';

interface JardaniLayoutProps {
  children: ReactNode;
}

export default async function JardaniLayout({ children }: JardaniLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/tools/jardani');
  }

  return (
    <main className="min-h-screen pt-20 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/tools">Ferramentas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Jardani</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-thin text-glow mb-6">Jardani</h1>

        <JardaniNav />

        {children}
      </div>
    </main>
  );
}

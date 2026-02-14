'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { Tabs } from '@/shared/ui';

import { toolTabs } from '../config/tool-tabs';

const DEFAULT_TAB = 'dailykalk';
const validTabs = new Set(toolTabs.map((t) => t.value));

export function ToolsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab = tabParam && validTabs.has(tabParam) ? tabParam : DEFAULT_TAB;

  useEffect(() => {
    if (!tabParam || !validTabs.has(tabParam)) {
      router.replace(`${pathname}?tab=${DEFAULT_TAB}`, { scroll: false });
    }
  }, [tabParam, router, pathname]);

  const handleTabChange = useCallback(
    (value: string | number | null) => {
      const tab = String(value);
      router.replace(`${pathname}?tab=${tab}`, { scroll: false });
    },
    [router, pathname]
  );

  return (
    <main className="min-h-screen pt-20 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-thin text-glow mb-8">Tools</h1>
        <Tabs items={toolTabs} value={activeTab} onValueChange={handleTabChange} />
      </div>
    </main>
  );
}

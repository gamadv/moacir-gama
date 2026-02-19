'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth';
import { Tabs } from '@/shared/ui';

import { toolTabs } from '../config/tool-tabs';

const DEFAULT_TAB = 'dailykalk';
const validTabs = new Set(toolTabs.map((t) => t.value));

export function ToolsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const tabParam = searchParams.get('tab');
  const activeTab = tabParam && validTabs.has(tabParam) ? tabParam : DEFAULT_TAB;
  const activeTabLabel = toolTabs.find((t) => t.value === activeTab)?.label ?? '';

  const tabListRef = useRef<HTMLDivElement>(null);
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);

  useEffect(() => {
    if (!tabParam || !validTabs.has(tabParam)) {
      router.replace(`${pathname}?tab=${DEFAULT_TAB}`, { scroll: false });
    }
  }, [tabParam, router, pathname]);

  useEffect(() => {
    const el = tabListRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTabBarHidden(!entry.isIntersecting);
      },
      { rootMargin: '-80px 0px 0px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTabChange = useCallback(
    (value: string | number | null) => {
      const tab = String(value);
      if (tab === 'jardani') {
        router.push('/tools/jardani');
        return;
      }
      router.replace(`${pathname}?tab=${tab}`, { scroll: false });
    },
    [router, pathname]
  );

  return (
    <>
      {isTabBarHidden && (
        <div className="fixed top-[40px] sm:top-[56px] left-0 right-0 z-40 bg-[#111]/95 backdrop-blur-sm border-b border-gray-800 px-6">
          <div className="max-w-4xl mx-auto py-2">
            <span className="text-sm font-medium text-gray-400">{activeTabLabel}</span>
          </div>
        </div>
      )}

      <main className="min-h-screen pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-thin text-glow mb-8">Tools</h1>
          <Tabs
            items={toolTabs}
            value={activeTab}
            onValueChange={handleTabChange}
            isAuthenticated={isAuthenticated}
            tabListRef={tabListRef}
          />
        </div>
      </main>
    </>
  );
}

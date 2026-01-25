'use client';

import { Tabs } from '@/shared/ui';

import { toolTabs } from '../config/tool-tabs';

export function ToolsPage() {
  return (
    <main className="min-h-screen pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-thin text-glow mb-8">Tools</h1>
        <Tabs items={toolTabs} defaultValue="dailykalk" />
      </div>
    </main>
  );
}

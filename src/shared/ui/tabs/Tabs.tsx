'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import * as React from 'react';

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ items, defaultValue, className }: TabsProps) {
  const defaultTab = defaultValue || items[0]?.value;

  return (
    <BaseTabs.Root defaultValue={defaultTab} className={className}>
      <BaseTabs.List className="flex gap-1 border-b border-gray-700 mb-6">
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </BaseTabs.List>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {item.content}
        </TabsContent>
      ))}
    </BaseTabs.Root>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

function TabsTrigger({ value, children }: TabsTriggerProps) {
  return (
    <BaseTabs.Tab
      value={value}
      className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors
                 border-b-2 border-transparent data-[selected]:border-white data-[selected]:text-white
                 cursor-pointer focus:outline-none">
      {children}
    </BaseTabs.Tab>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

function TabsContent({ value, children }: TabsContentProps) {
  return (
    <BaseTabs.Panel value={value} className="focus:outline-none">
      {children}
    </BaseTabs.Panel>
  );
}

export { TabsTrigger, TabsContent };

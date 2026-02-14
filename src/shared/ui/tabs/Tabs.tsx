'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string | number | null) => void;
  className?: string;
}

export function Tabs({ items, defaultValue, value, onValueChange, className }: TabsProps) {
  const defaultTab = defaultValue || items[0]?.value;

  return (
    <BaseTabs.Root
      defaultValue={value ? undefined : defaultTab}
      value={value}
      onValueChange={onValueChange}
      className={className}>
      <BaseTabs.List className="flex gap-1 border-b border-gray-700 mb-6">
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value} isSelected={value === item.value}>
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
  isSelected: boolean;
}

function TabsTrigger({ value, children, isSelected = false }: TabsTriggerProps) {
  return (
    <BaseTabs.Tab
      value={value}
      className={cn(
        'px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors',
        isSelected ? 'text-white' : 'text-gray-400',
        'border-b-2 border-transparent data-[selected]:border-white',
        'data-selected:bg-white/10 rounded-t-md',
        'cursor-pointer focus:outline-none'
      )}>
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

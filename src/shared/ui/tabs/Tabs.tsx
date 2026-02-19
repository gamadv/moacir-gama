'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { Lock } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  isAuthRequired?: boolean;
  lockedContent?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string | number | null) => void;
  className?: string;
  isAuthenticated?: boolean;
  tabListRef?: React.Ref<HTMLDivElement>;
}

export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
  isAuthenticated,
  tabListRef,
}: TabsProps) {
  const defaultTab = defaultValue || items[0]?.value;

  return (
    <BaseTabs.Root
      defaultValue={value ? undefined : defaultTab}
      value={value}
      onValueChange={onValueChange}
      className={className}>
      <BaseTabs.List ref={tabListRef} className="flex gap-1 border-b border-gray-700 mb-6">
        {items.map((item) => {
          const isLocked = item.isAuthRequired && !isAuthenticated;
          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              isSelected={value === item.value}
              isLocked={isLocked}>
              {item.label}
            </TabsTrigger>
          );
        })}
      </BaseTabs.List>
      {items.map((item) => {
        const isLocked = item.isAuthRequired && !isAuthenticated;
        return (
          <TabsContent key={item.value} value={item.value}>
            {isLocked ? (item.lockedContent ?? item.content) : item.content}
          </TabsContent>
        );
      })}
    </BaseTabs.Root>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  isSelected: boolean;
  isLocked?: boolean;
}

function TabsTrigger({ value, children, isSelected = false, isLocked }: TabsTriggerProps) {
  return (
    <BaseTabs.Tab
      value={value}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors',
        'border-b-2 border-transparent data-selected:border-white',
        'data-selected:bg-white/10 rounded-t-md',
        'cursor-pointer focus:outline-none',
        isLocked
          ? 'text-gray-600 hover:text-gray-500'
          : isSelected
            ? 'text-white'
            : 'text-gray-400 hover:text-white'
      )}>
      <span className="flex items-center gap-1.5">
        {children}
        {isLocked && <Lock className="h-3 w-3" />}
      </span>
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/lib/utils';

const navItems = [
  { href: '/tools/jardani/pj', label: 'PJ' },
  { href: '/tools/jardani/pf', label: 'PF' },
];

export function JardaniNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-gray-700 mb-6">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              'border-b-2 rounded-t-md',
              isActive
                ? 'border-white text-white bg-white/10'
                : 'border-transparent text-gray-400 hover:text-white'
            )}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Breadcrumb({ children, className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav aria-label="breadcrumb" className={cn('mb-4', className)} {...props}>
      {children}
    </nav>
  );
}

function BreadcrumbList({ children, className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-gray-400',
        className
      )}
      {...props}>
      {children}
    </ol>
  );
}

function BreadcrumbItem({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li className={cn('inline-flex items-center gap-1.5', className)} {...props}>
      {children}
    </li>
  );
}

interface BreadcrumbLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode;
}

function BreadcrumbLink({ children, className, ...props }: BreadcrumbLinkProps) {
  return (
    <Link
      className={cn(
        'transition-colors hover:text-white truncate max-w-[120px] sm:max-w-none',
        className
      )}
      {...props}>
      {children}
    </Link>
  );
}

function BreadcrumbPage({ children, className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-white font-medium truncate max-w-[140px] sm:max-w-none', className)}
      {...props}>
      {children}
    </span>
  );
}

function BreadcrumbSeparator({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn('text-gray-600', className)}
      {...props}>
      <ChevronRight className="h-3.5 w-3.5" />
    </li>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};

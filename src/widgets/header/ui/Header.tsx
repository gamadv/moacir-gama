'use client';

import { FileText, Home, LayoutDashboard, User, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { ComponentType } from 'react';

import { LoginButton, UserMenu } from '@/features/auth';
const navItems = [
  { href: '/tools', label: 'Tools' },
  { href: '/resume', label: 'Resume' },
  { href: '/about', label: 'Sobre Mim' },
];

const mobileNavItems: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/resume', label: 'Resume', icon: FileText },
  { href: '/about', label: 'Sobre', icon: User },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <>
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#111]/80 backdrop-blur-sm border-b border-gray-800">
        <nav className="max-w-6xl mx-auto px-4 py-2 sm:px-6 sm:py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-white font-extralight text-lg hover:text-glow transition-all">
            Moacir G
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-gray-600">|</span>
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-sm transition-colors hover:text-white ${
                      pathname === item.href ? 'text-white' : 'text-gray-400'
                    }`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop auth */}
          <div className="hidden sm:flex items-center">
            {status === 'loading' ? (
              <div className="w-6 h-6 rounded-full bg-blue-500 animate-pulse" />
            ) : session ? (
              <UserMenu />
            ) : (
              <LoginButton />
            )}
          </div>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden mx-6 rounded-lg shadow-amber-50 shadow-sm fixed bottom-5 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur-sm border-t border-gray-800">
        <ul className="flex items-center justify-around py-2 px-2">
          {mobileNavItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

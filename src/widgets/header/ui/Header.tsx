'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/tools', label: 'Tools' },
  { href: '/resume', label: 'Resume' },
  { href: '/about', label: 'Sobre Mim' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111]/80 backdrop-blur-sm border-b border-gray-800">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-white font-extralight text-lg hover:text-glow transition-all">
          Moacir G
        </Link>
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
      </nav>
    </header>
  );
}

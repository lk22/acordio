'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavigationItem = {
  href: string;
  label: string;
  icon: string;
}

export default function Navigation() {
  const pathname = usePathname();

  const navItems: NavigationItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '◉' },
    { href: '/dashboard/clients', label: 'Kunder', icon: '○' },
    { href: '/dashboard/projects', label: 'Projekter', icon: '□' },
  ];

  return (
    <nav className="flex">
      <ul className="flex gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

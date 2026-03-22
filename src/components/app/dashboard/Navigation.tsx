'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ElementType;
}

export default function Navigation() {
  const pathname = usePathname();

  const navItems: NavigationItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/clients', label: 'Kunder', icon: Users },
    { href: '/dashboard/projects', label: 'Projekter', icon: FolderKanban },
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
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? 'bg-secondary text-secondary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

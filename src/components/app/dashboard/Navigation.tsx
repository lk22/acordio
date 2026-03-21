'use client';
import React from 'react'

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="w-64 p-4 flex">
      <ul className="flex gap-4">
        <li className="mb-2">
          <Link href="/dashboard/clients" className="text-black hover:underline">
            Clients
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/dashboard/projects" className="text-black hover:underline">
            Projects
          </Link>
        </li>
      </ul>
    </nav>
  );
}
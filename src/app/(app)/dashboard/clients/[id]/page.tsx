// dependencies
import React from 'react'
import Link from 'next/link';

import { NEXT_PUBLIC_BASE_URL } from '@/app/constants';

export default async function Page({params}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/dashboard/clients/${id}`, {
    cache: "no-store"
  });
  const client = await response.json();

  return (
    <div>
      <h1>{client.client.name}</h1>
      <p>Email: {client.client.email}</p>
      <p>Phone: {client.client.phone}</p>
      <Link href="/dashboard/clients">
        <button>Back to Clients</button>
      </Link>
    </div>
  );
}

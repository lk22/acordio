import React from 'react'
import Link from 'next/link';

import { NEXT_PUBLIC_BASE_URL } from '@/app/constants';

export default async function Page() {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/dashboard/clients`);
  const clients = await response.json();

  console.log(clients.clients);

  return (
    <div>
      <h1>Clients</h1>
      <ul>
        {clients.clients.map((client: any) => (
          <li key={client.id}>
            <Link href={`/dashboard/clients/${client.id}`}>
              {client.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
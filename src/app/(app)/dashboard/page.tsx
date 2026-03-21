'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  status: string;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const res = await fetch('/api/dashboard/clients');
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }

  const pipelineStages = {
    LEAD: { label: 'Leads', color: 'bg-yellow-500' },
    CUSTOMER: { label: 'Kunder', color: 'bg-blue-500' },
    HAS_RECEIVED_PROPOSAL: { label: 'Har tilbud', color: 'bg-purple-500' },
    HAS_SIGNED_AGREEMENT: { label: 'Har aftale', color: 'bg-green-500' },
    ACTIVE: { label: 'Aktive', color: 'bg-emerald-500' },
    INACTIVE: { label: 'Inaktive', color: 'bg-gray-500' },
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    Object.keys(pipelineStages).forEach((stage) => {
      counts[stage] = clients.filter((c) => c.status === stage).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return <div className="p-8">Indlæser...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Object.entries(pipelineStages).map(([key, stage]) => (
          <Link
            key={key}
            href={`/dashboard/clients?status=${key}`}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-3 h-3 rounded-full ${stage.color} mb-2`} />
            <p className="text-2xl font-bold">{statusCounts[key] || 0}</p>
            <p className="text-sm text-gray-500">{stage.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Hurtige handlinger</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/clients"
              className="block px-4 py-2 bg-blue-50 rounded hover:bg-blue-100"
            >
              Se alle kunder & leads →
            </Link>
            <Link
              href="/dashboard/projects"
              className="block px-4 py-2 bg-green-50 rounded hover:bg-green-100"
            >
              Se alle projekter →
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Pipeline status</h2>
          <div className="space-y-3">
            {Object.entries(pipelineStages).map(([key, stage]) => (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                <span className="flex-1 text-sm">{stage.label}</span>
                <span className="font-medium">{statusCounts[key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

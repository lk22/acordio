'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  type: string;
  description?: string;
  tasks: { id: string; price?: number }[];
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  status: string;
  notes?: string;
  createdAt: string;
  projects: Project[];
}

interface ProjectFormData {
  name: string;
  type: string;
  description: string;
}

const STATUS_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  CUSTOMER: 'Kunde',
  HAS_RECEIVED_PROPOSAL: 'Har modtaget tilbud',
  HAS_SIGNED_AGREEMENT: 'Har underskrevet aftale',
  ACTIVE: 'Aktiv',
  INACTIVE: 'Inaktiv',
};

const STATUS_COLORS: Record<string, string> = {
  LEAD: 'bg-yellow-100 text-yellow-700',
  CUSTOMER: 'bg-blue-100 text-blue-700',
  HAS_RECEIVED_PROPOSAL: 'bg-purple-100 text-purple-700',
  HAS_SIGNED_AGREEMENT: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    name: '',
    type: 'PROJECT',
    description: '',
  });

  useEffect(() => {
    params.then((p) => setClientId(p.id));
  }, [params]);

  const fetchClient = useCallback(async () => {
    if (!clientId) return;
    try {
      const res = await fetch(`/api/dashboard/clients/${clientId}`);
      const data = await res.json();
      if (data.client) {
        setClient(data.client);
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId, fetchClient]);

  function closeProjectForm() {
    setShowProjectForm(false);
    setProjectFormData({ name: '', type: 'PROJECT', description: '' });
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) return;

    try {
      const res = await fetch('/api/dashboard/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          ...projectFormData,
        }),
      });

      if (res.ok) {
        fetchClient();
        closeProjectForm();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm('Er du sikker på, at du vil slette dette projekt?')) return;

    try {
      const res = await fetch(`/api/dashboard/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchClient();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  function getProjectTotal(project: Project): number {
    return project.tasks.reduce((sum, t) => sum + (t.price || 0), 0);
  }

  if (loading) {
    return <div className="p-8">Indlæser...</div>;
  }

  if (!client) {
    return (
      <div className="p-8">
        <p>Kunde ikke fundet.</p>
        <Link href="/dashboard/clients" className="text-blue-600 hover:underline">
          Tilbage til kunder
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Tilbage til kunder
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            {client.company && (
              <p className="text-gray-500">{client.company}</p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded font-medium ${
              STATUS_COLORS[client.status] || 'bg-gray-100'
            }`}
          >
            {STATUS_LABELS[client.status] || client.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {client.email && (
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
          )}
          {client.phone && (
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="font-medium">{client.phone}</p>
            </div>
          )}
          {client.address && (
            <div>
              <p className="text-sm text-gray-500">Adresse</p>
              <p className="font-medium">{client.address}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Oprettet</p>
            <p className="font-medium">
              {new Date(client.createdAt).toLocaleDateString('da-DK')}
            </p>
          </div>
        </div>

        {client.notes && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-1">Noter</p>
            <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Projekter</h2>
          <button
            onClick={() => setShowProjectForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nyt projekt
          </button>
        </div>

        {showProjectForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Nyt projekt</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Navn</label>
                  <input
                    type="text"
                    required
                    value={projectFormData.name}
                    onChange={(e) =>
                      setProjectFormData({
                        ...projectFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={projectFormData.type}
                    onChange={(e) =>
                      setProjectFormData({
                        ...projectFormData,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="PROJECT">Projekt</option>
                    <option value="SUPPORT">Support</option>
                    <option value="RETAINER">Retainer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Beskrivelse
                  </label>
                  <textarea
                    value={projectFormData.description}
                    onChange={(e) =>
                      setProjectFormData({
                        ...projectFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={closeProjectForm}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Opret
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {client.projects.length === 0 ? (
          <p className="text-gray-500">Ingen projekter endnu.</p>
        ) : (
          <div className="space-y-3">
            {client.projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          project.type === 'PROJECT'
                            ? 'bg-blue-100 text-blue-700'
                            : project.type === 'SUPPORT'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {project.type === 'PROJECT'
                          ? 'Projekt'
                          : project.type === 'SUPPORT'
                          ? 'Support'
                          : 'Retainer'}
                      </span>
                      {' • '}
                      {project.tasks.length} opgaver
                    </p>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {getProjectTotal(project).toLocaleString('da-DK')} kr.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                  >
                    Se detaljer
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    Slet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

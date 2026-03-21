'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status: string;
  notes?: string;
  createdAt: string;
  projects?: { id: string; name: string }[];
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  status: string;
  notes: string;
}

const STATUS_COLORS: Record<string, string> = {
  LEAD: 'bg-yellow-100 text-yellow-700',
  CUSTOMER: 'bg-blue-100 text-blue-700',
  HAS_RECEIVED_PROPOSAL: 'bg-purple-100 text-purple-700',
  HAS_SIGNED_AGREEMENT: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  ALL: 'Alle',
  LEAD: 'Leads',
  CUSTOMER: 'Kunder',
  HAS_RECEIVED_PROPOSAL: 'Har tilbud',
  HAS_SIGNED_AGREEMENT: 'Har aftale',
  ACTIVE: 'Aktive',
  INACTIVE: 'Inaktive',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    status: 'LEAD',
    notes: '',
  });

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

  function openCreateForm() {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      status: 'LEAD',
      notes: '',
    });
    setShowForm(true);
  }

  function openEditForm(client: Client) {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      company: client.company || '',
      status: client.status,
      notes: client.notes || '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingClient(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const url = '/api/dashboard/clients';
    const method = editingClient ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingClient && { id: editingClient.id }),
          ...formData,
        }),
      });

      if (res.ok) {
        fetchClients();
        closeForm();
      }
    } catch (error) {
      console.error('Error saving client:', error);
    }
  }

  async function handleDelete(clientId: string) {
    if (!confirm('Er du sikker på, at du vil slette denne kunde?')) return;

    try {
      const res = await fetch(`/api/dashboard/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchClients();
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  }

  async function handleStatusChange(clientId: string, newStatus: string) {
    try {
      const res = await fetch('/api/dashboard/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, status: newStatus }),
      });

      if (res.ok) {
        fetchClients();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  if (loading) {
    return <div className="p-8">Indlæser...</div>;
  }

  const filteredClients = statusFilter === 'ALL'
    ? clients
    : clients.filter(c => c.status === statusFilter);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kunder & Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredClients.length} af {clients.length} kunder
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nyt lead
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg my-8">
            <h2 className="text-xl font-bold mb-4">
              {editingClient ? 'Rediger kunde' : 'Nyt lead'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Navn</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Firma</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="LEAD">Lead</option>
                  <option value="CUSTOMER">Kunde</option>
                  <option value="HAS_RECEIVED_PROPOSAL">Har modtaget tilbud</option>
                  <option value="HAS_SIGNED_AGREEMENT">Har underskrevet aftale</option>
                  <option value="ACTIVE">Aktiv</option>
                  <option value="INACTIVE">Inaktiv</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Noter</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Indledende noter om kunden..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Annuller
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingClient ? 'Gem' : 'Opret'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              statusFilter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            {key !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-75">
                ({clients.filter(c => key === 'ALL' || c.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredClients.length === 0 ? (
        <p className="text-gray-500">Ingen kunder i denne kategori.</p>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {client.name}
                  </Link>
                  {client.company && (
                    <p className="text-sm text-gray-500">{client.company}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    {client.email && <span>{client.email}</span>}
                    {client.phone && <span>{client.phone}</span>}
                  </div>
                </div>
                <select
                  value={client.status}
                  onChange={(e) => handleStatusChange(client.id, e.target.value)}
                  className={`px-3 py-1 rounded text-sm font-medium border-0 ${STATUS_COLORS[client.status] || 'bg-gray-100'}`}
                >
                  <option value="LEAD">Lead</option>
                  <option value="CUSTOMER">Kunde</option>
                  <option value="HAS_RECEIVED_PROPOSAL">Har modtaget tilbud</option>
                  <option value="HAS_SIGNED_AGREEMENT">Har underskrevet aftale</option>
                  <option value="ACTIVE">Aktiv</option>
                  <option value="INACTIVE">Inaktiv</option>
                </select>
              </div>
              {client.notes && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {client.notes}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  Se detaljer
                </Link>
                <button
                  onClick={() => openEditForm(client)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  Rediger
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
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
  );
}

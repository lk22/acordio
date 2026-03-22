'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Phone, MapPin, Building2, FileText, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  LEAD: { label: 'Lead', variant: 'default' },
  CUSTOMER: { label: 'Kunde', variant: 'default' },
  HAS_RECEIVED_PROPOSAL: { label: 'Har tilbud', variant: 'secondary' },
  HAS_SIGNED_AGREEMENT: { label: 'Har aftale', variant: 'default' },
  ACTIVE: { label: 'Aktiv', variant: 'default' },
  INACTIVE: { label: 'Inaktiv', variant: 'outline' },
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
    return <div className="text-center text-muted-foreground py-12">Indlæser...</div>;
  }

  const filteredClients = statusFilter === 'ALL'
    ? clients
    : clients.filter(c => c.status === statusFilter);

  return (
    <div className="space-y-6 xs:max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-7xl xs:w-full sm:w-full md:w-full lg:w-full xl:w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kunder & Leads</h1>
          <p className="text-muted-foreground mt-1">
            {filteredClients.length} af {clients.length} kunder
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nyt lead
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Button
            key={key}
            variant={statusFilter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(key)}
          >
            {label}
            {key !== 'ALL' && (
              <Badge variant="secondary" className="ml-2">
                {clients.filter(c => key === 'ALL' || c.status === key).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Ingen kunder i denne kategori
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-lg font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      {client.name}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    {client.company && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {client.company}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      {client.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                      )}
                      {client.address && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {client.address}
                        </span>
                      )}
                    </div>
                    {client.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex items-start gap-1">
                        <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                        {client.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={client.status}
                      onValueChange={(value) => handleStatusChange(client.id, value)}
                    >
                      <SelectTrigger className={cn(
                        "w-[160px]",
                        client.status === 'LEAD' && "border-yellow-500 bg-yellow-50",
                        client.status === 'CUSTOMER' && "border-blue-500 bg-blue-50",
                        client.status === 'ACTIVE' && "border-green-500 bg-green-50",
                        client.status === 'INACTIVE' && "border-gray-500 bg-gray-50",
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/clients/${client.id}`}>
                      Se detaljer
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditForm(client)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Rediger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Slet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Rediger kunde' : 'Nyt lead'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Firma</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Noter</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Indledende noter om kunden..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Annuller
              </Button>
              <Button type="submit">
                {editingClient ? 'Gem ændringer' : 'Opret'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

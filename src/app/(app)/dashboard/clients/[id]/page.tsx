'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, FileText, Plus, FolderKanban, ChevronRight, Pencil, Trash2, PhoneCall, MessageSquare, Video, FileCheck, CheckCircle, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  type: string;
  description?: string;
  tasks: { id: string; price?: number }[];
  createdAt: string;
}

interface ActivityLog {
  id: string;
  type: string;
  description: string;
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
  activityLogs?: ActivityLog[];
}

interface ProjectFormData {
  name: string;
  type: string;
  description: string;
}

interface ActivityLogFormData {
  type: string;
  description: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  LEAD: { label: 'Lead', variant: 'default' },
  CUSTOMER: { label: 'Kunde', variant: 'default' },
  HAS_RECEIVED_PROPOSAL: { label: 'Har tilbud', variant: 'secondary' },
  HAS_SIGNED_AGREEMENT: { label: 'Har aftale', variant: 'default' },
  ACTIVE: { label: 'Aktiv', variant: 'default' },
  INACTIVE: { label: 'Inaktiv', variant: 'outline' },
};

const PROJECT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  PROJECT: { label: 'Projekt', color: 'bg-blue-100 text-blue-800' },
  SUPPORT: { label: 'Support', color: 'bg-green-100 text-green-800' },
  RETAINER: { label: 'Retainer', color: 'bg-purple-100 text-purple-800' },
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  NOTE: StickyNote,
  CALL: PhoneCall,
  EMAIL: MessageSquare,
  MEETING: Video,
  PROPOSAL: FileCheck,
  AGREEMENT: CheckCircle,
};

const ACTIVITY_LABELS: Record<string, string> = {
  NOTE: 'Note',
  CALL: 'Opkald',
  EMAIL: 'E-mail',
  MEETING: 'Møde',
  PROPOSAL: 'Tilbud',
  AGREEMENT: 'Aftale',
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
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    name: '',
    type: 'PROJECT',
    description: '',
  });
  const [activityFormData, setActivityFormData] = useState<ActivityLogFormData>({
    type: 'NOTE',
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

  async function handleCreateActivityLog(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) return;

    try {
      const res = await fetch('/api/dashboard/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          ...activityFormData,
        }),
      });

      if (res.ok) {
        fetchClient();
        setShowActivityForm(false);
        setActivityFormData({ type: 'NOTE', description: '' });
      }
    } catch (error) {
      console.error('Error creating activity log:', error);
    }
  }

  function getProjectTotal(project: Project): number {
    return project.tasks.reduce((sum, t) => sum + (t.price || 0), 0);
  }

  if (loading) {
    return <div className="text-center text-muted-foreground py-12">Indlæser...</div>;
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Kunde ikke fundet.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/dashboard/clients">← Tilbage til kunder</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-7xl max-w-7xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tilbage til kunder
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              {client.company && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {client.company}
                </p>
              )}
            </div>
            <Badge variant={STATUS_CONFIG[client.status]?.variant || 'outline'}>
              {STATUS_CONFIG[client.status]?.label || client.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {client.email && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <p className="font-medium">{client.email}</p>
              </div>
            )}
            {client.phone && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefon
                </p>
                <p className="font-medium">{client.phone}</p>
              </div>
            )}
            {client.address && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Adresse
                </p>
                <p className="font-medium">{client.address}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Oprettet
              </p>
              <p className="font-medium">
                {new Date(client.createdAt).toLocaleDateString('da-DK')}
              </p>
            </div>
          </div>

          {client.notes && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                <FileText className="h-3 w-3" />
                Noter
              </p>
              <p className="text-foreground whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Projekter
            </CardTitle>
            <Button size="sm" onClick={() => setShowProjectForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nyt projekt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {client.projects.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">Ingen projekter endnu.</p>
          ) : (
            <div className="space-y-3">
              {client.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex justify-between items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="font-medium hover:underline inline-flex items-center gap-1"
                      >
                        {project.name}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={PROJECT_TYPE_CONFIG[project.type]?.color}>
                          {PROJECT_TYPE_CONFIG[project.type]?.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {project.tasks.length} opgaver
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {getProjectTotal(project).toLocaleString('da-DK')} kr.
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aktivitetslog
            </CardTitle>
            <Button variant="secondary" size="sm" onClick={() => setShowActivityForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Ny aktivitet
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!client.activityLogs || client.activityLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">Ingen aktiviteter endnu.</p>
          ) : (
            <div className="space-y-3">
              {client.activityLogs.map((log) => {
                const Icon = ACTIVITY_ICONS[log.type] || StickyNote;
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {ACTIVITY_LABELS[log.type] || log.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString('da-DK')}
                        </span>
                      </div>
                      <p className="text-sm">{log.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nyt projekt</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Navn</Label>
              <Input
                id="project-name"
                required
                value={projectFormData.name}
                onChange={(e) =>
                  setProjectFormData({ ...projectFormData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-type">Type</Label>
              <Select
                value={projectFormData.type}
                onValueChange={(value) =>
                  setProjectFormData({ ...projectFormData, type: value })
                }
              >
                <SelectTrigger id="project-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROJECT">Projekt</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="RETAINER">Retainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Beskrivelse</Label>
              <Textarea
                id="project-description"
                value={projectFormData.description}
                onChange={(e) =>
                  setProjectFormData({ ...projectFormData, description: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeProjectForm}>
                Annuller
              </Button>
              <Button type="submit">Opret</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showActivityForm} onOpenChange={setShowActivityForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ny aktivitet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateActivityLog} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity-type">Type</Label>
              <Select
                value={activityFormData.type}
                onValueChange={(value) =>
                  setActivityFormData({ ...activityFormData, type: value })
                }
              >
                <SelectTrigger id="activity-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOTE">Note</SelectItem>
                  <SelectItem value="CALL">Opkald</SelectItem>
                  <SelectItem value="EMAIL">E-mail</SelectItem>
                  <SelectItem value="MEETING">Møde</SelectItem>
                  <SelectItem value="PROPOSAL">Tilbud sendt</SelectItem>
                  <SelectItem value="AGREEMENT">Aftale underskrevet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-description">Beskrivelse</Label>
              <Textarea
                id="activity-description"
                required
                value={activityFormData.description}
                onChange={(e) =>
                  setActivityFormData({ ...activityFormData, description: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowActivityForm(false)}>
                Annuller
              </Button>
              <Button type="submit">Opret</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

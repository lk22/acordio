'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FolderKanban, ChevronRight, Pencil, Trash2, DollarSign, Clock, User } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Task {
  id: string;
  title: string;
  price?: number;
  estimatedHours?: number;
}

interface Project {
  id: string;
  name: string;
  type: string;
  description?: string;
  client: Client;
  tasks: Task[];
  createdAt: string;
}

interface ProjectFormData {
  name: string;
  clientId: string;
  type: string;
  description: string;
}

const PROJECT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  PROJECT: { label: 'Projekt', color: 'bg-blue-100 text-blue-800' },
  SUPPORT: { label: 'Support', color: 'bg-green-100 text-green-800' },
  RETAINER: { label: 'Retainer', color: 'bg-purple-100 text-purple-800' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    clientId: '',
    type: 'PROJECT',
    description: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/dashboard/projects');
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClients() {
    try {
      const res = await fetch('/api/dashboard/clients');
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }

  function openCreateForm() {
    setEditingProject(null);
    setFormData({ name: '', clientId: '', type: 'PROJECT', description: '' });
    setShowForm(true);
  }

  function openEditForm(project: Project) {
    setEditingProject(project);
    setFormData({
      name: project.name,
      clientId: project.client.id,
      type: project.type,
      description: project.description || '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ name: '', clientId: '', type: 'PROJECT', description: '' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const url = editingProject
      ? '/api/dashboard/projects'
      : '/api/dashboard/projects';
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingProject && { id: editingProject.id }),
          ...formData,
        }),
      });

      if (res.ok) {
        fetchProjects();
        closeForm();
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm('Er du sikker på, at du vil slette dette projekt?')) return;

    try {
      const res = await fetch(`/api/dashboard/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  function getProjectTotal(project: Project): number {
    return project.tasks.reduce((sum, task) => sum + (task.price || 0), 0);
  }

  function getProjectHours(project: Project): number {
    return project.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  }

  if (loading) {
    return <div className="text-center text-muted-foreground py-12">Indlæser...</div>;
  }

  return (
    <div className="space-y-6 w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projekter</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} projekt{projects.length !== 1 ? 'er' : ''}
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nyt projekt
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ingen projekter endnu</p>
            <Button variant="outline" className="mt-4" onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Opret dit første projekt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-lg font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      {project.name}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {project.client.name}
                      </span>
                      <Badge className={PROJECT_TYPE_CONFIG[project.type]?.color}>
                        {PROJECT_TYPE_CONFIG[project.type]?.label}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold flex items-center gap-1 justify-end">
                      <DollarSign className="h-4 w-4" />
                      {getProjectTotal(project).toLocaleString('da-DK')} kr.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      {getProjectHours(project)} timer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.tasks.length} opgaver
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      Se detaljer
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditForm(project)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Rediger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(project.id)}
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
              {editingProject ? 'Rediger projekt' : 'Nyt projekt'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="clientId">Kunde</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                required
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Vælg kunde..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
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
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Annuller
              </Button>
              <Button type="submit">
                {editingProject ? 'Gem ændringer' : 'Opret'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

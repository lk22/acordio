'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
    return <div className="p-8">Indlæser...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projekter</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nyt projekt
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProject ? 'Rediger projekt' : 'Nyt projekt'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium mb-1">Kunde</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Vælg kunde...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
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
                  {editingProject ? 'Gem' : 'Opret'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <p className="text-gray-500">Ingen projekter endnu.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {project.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {project.client.name} &bull;{' '}
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
                  </p>
                  {project.description && (
                    <p className="mt-2 text-gray-600">{project.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {getProjectTotal(project).toLocaleString('da-DK')} kr.
                  </p>
                  <p className="text-sm text-gray-500">
                    {getProjectHours(project)} timer
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {project.tasks.length} opgaver
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
                  onClick={() => openEditForm(project)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  Rediger
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
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

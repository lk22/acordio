'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  price?: number;
  estimatedHours?: number;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  type: string;
  description?: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  tasks: Task[];
  createdAt: string;
}

interface TaskFormData {
  title: string;
  description: string;
  price: string;
  estimatedHours: string;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    price: '',
    estimatedHours: '',
  });

  useEffect(() => {
    params.then((p) => setProjectId(p.id));
  }, [params]);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/dashboard/projects/${projectId}`);
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  function openCreateTaskForm() {
    setEditingTask(null);
    setTaskFormData({
      title: '',
      description: '',
      price: '',
      estimatedHours: '',
    });
    setShowTaskForm(true);
  }

  function openEditTaskForm(task: Task) {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      price: task.price?.toString() || '',
      estimatedHours: task.estimatedHours?.toString() || '',
    });
    setShowTaskForm(true);
  }

  function closeTaskForm() {
    setShowTaskForm(false);
    setEditingTask(null);
    setTaskFormData({
      title: '',
      description: '',
      price: '',
      estimatedHours: '',
    });
  }

  async function handleTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;

    const url = editingTask
      ? `/api/dashboard/tasks/${editingTask.id}`
      : '/api/dashboard/tasks';
    const method = editingTask ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingTask && { id: editingTask.id }),
          ...(method === 'POST' && { projectId }),
          ...taskFormData,
          price: taskFormData.price || null,
          estimatedHours: taskFormData.estimatedHours || null,
        }),
      });

      if (res.ok) {
        fetchProject();
        closeTaskForm();
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Er du sikker på, at du vil slette denne opgave?')) return;

    try {
      const res = await fetch(`/api/dashboard/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  function getTotalPrice(): number {
    return project?.tasks.reduce((sum, t) => sum + (t.price || 0), 0) || 0;
  }

  function getTotalHours(): number {
    return (
      project?.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) || 0
    );
  }

  if (loading) {
    return <div className="p-8">Indlæser...</div>;
  }

  if (!project) {
    return (
      <div className="p-8">
        <p>Projekt ikke fundet.</p>
        <Link href="/dashboard/projects" className="text-blue-600 hover:underline">
          Tilbage til projekter
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Tilbage til projekter
        </Link>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-500">
            <Link
              href={`/dashboard/clients/${project.client.id}`}
              className="hover:underline"
            >
              {project.client.name}
            </Link>
            {' • '}
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
        <div className="text-right bg-gray-50 p-4 rounded-lg">
          <p className="text-2xl font-bold">
            {getTotalPrice().toLocaleString('da-DK')} kr.
          </p>
          <p className="text-gray-500">{getTotalHours()} timer</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Opgaver</h2>
          <button
            onClick={openCreateTaskForm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Ny opgave
          </button>
        </div>

        {showTaskForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                {editingTask ? 'Rediger opgave' : 'Ny opgave'}
              </h3>
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    required
                    value={taskFormData.title}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Beskrivelse
                  </label>
                  <textarea
                    value={taskFormData.description}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pris (kr.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={taskFormData.price}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Estimeret tid (timer)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={taskFormData.estimatedHours}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          estimatedHours: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={closeTaskForm}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingTask ? 'Gem' : 'Opret'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {project.tasks.length === 0 ? (
          <p className="text-gray-500">Ingen opgaver endnu.</p>
        ) : (
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {task.price !== null && task.price !== undefined && (
                      <p className="font-semibold">
                        {task.price.toLocaleString('da-DK')} kr.
                      </p>
                    )}
                    {task.estimatedHours !== null &&
                      task.estimatedHours !== undefined && (
                        <p className="text-sm text-gray-500">
                          {task.estimatedHours} timer
                        </p>
                      )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEditTaskForm(task)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                  >
                    Rediger
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
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

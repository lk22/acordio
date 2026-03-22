'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AgreementDocument } from '@/components/app/agreements/AgreementDocument';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Pencil, Trash2, Clock, DollarSign, User, FileText, Download, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  price?: number;
  estimatedHours?: number;
  createdAt: string;
  timeEntries?: TimeEntry[];
}

interface TimeEntry {
  id: string;
  taskId: string;
  hours: number;
  date: string;
  notes?: string;
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
    address?: string;
    company?: string;
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

interface TimeEntryFormData {
  hours: string;
  date: string;
  notes: string;
}

const PROJECT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  PROJECT: { label: 'Projekt', color: 'bg-blue-100 text-blue-800' },
  SUPPORT: { label: 'Support', color: 'bg-green-100 text-green-800' },
  RETAINER: { label: 'Retainer', color: 'bg-purple-100 text-purple-800' },
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAgreementForm, setShowAgreementForm] = useState(false);
  const [showTimeEntryForm, setShowTimeEntryForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskForTime, setSelectedTaskForTime] = useState<Task | null>(null);
  const [agreementType, setAgreementType] = useState<string>('PROJECT');
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    price: '',
    estimatedHours: '',
  });
  const [timeEntryFormData, setTimeEntryFormData] = useState<TimeEntryFormData>({
    hours: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

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

  const fetchTimeEntries = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/dashboard/time-entries`);
      const data = await res.json();
      if (data.timeEntries) {
        setTimeEntries(data.timeEntries.filter((te: TimeEntry) =>
          project?.tasks.some(t => t.id === te.taskId)
        ));
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  }, [projectId, project]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchTimeEntries();
    }
  }, [projectId, fetchProject, fetchTimeEntries]);

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

  async function handleTaskSubmit(e: React.SubmitEvent) {
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

  function openTimeEntryForm(task: Task) {
    setSelectedTaskForTime(task);
    setTimeEntryFormData({
      hours: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowTimeEntryForm(true);
  }

  function closeTimeEntryForm() {
    setShowTimeEntryForm(false);
    setSelectedTaskForTime(null);
  }

  async function handleCreateTimeEntry(e: React.SubmitEvent) {
    e.preventDefault();
    if (!selectedTaskForTime) return;

    try {
      const res = await fetch('/api/dashboard/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskForTime.id,
          hours: parseFloat(timeEntryFormData.hours),
          date: timeEntryFormData.date,
          notes: timeEntryFormData.notes || null,
        }),
      });

      if (res.ok) {
        fetchTimeEntries();
        closeTimeEntryForm();
      }
    } catch (error) {
      console.error('Error creating time entry:', error);
    }
  }

  async function handleDeleteTimeEntry(timeEntryId: string) {
    if (!confirm('Er du sikker på, at du vil slette denne tidsregistrering?')) return;

    try {
      const res = await fetch(`/api/dashboard/time-entries/${timeEntryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTimeEntries();
      }
    } catch (error) {
      console.error('Error deleting time entry:', error);
    }
  }

  function getTaskTimeEntries(taskId: string): TimeEntry[] {
    return timeEntries.filter(te => te.taskId === taskId);
  }

  function getTaskTotalHours(taskId: string): number {
    return getTaskTimeEntries(taskId).reduce((sum, te) => sum + te.hours, 0);
  }

  function getTotalRegisteredHours(): number {
    return timeEntries.reduce((sum, te) => sum + te.hours, 0);
  }

  function getTotalPrice(): number {
    return project?.tasks.reduce((sum, t) => sum + (t.price || 0), 0) || 0;
  }

  function getTotalHours(): number {
    return (
      project?.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) || 0
    );
  }

  async function handleGenerateAgreement() {
    if (!project || project.tasks.length === 0) {
      alert('Du skal have opgaver i projektet for at generere en aftale.');
      return;
    }

    try {
      const res = await fetch('/api/dashboard/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          type: agreementType,
          content: 'Genereret fra Acordio',
        }),
      });

      if (res.ok) {
        setShowAgreementForm(false);
        alert('Aftale genereret!');
      }
    } catch (error) {
      console.error('Error generating agreement:', error);
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground py-12">Indlæser...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projekt ikke fundet.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/dashboard/projects">← Tilbage til projekter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-7xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tilbage til projekter
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  href={`/dashboard/clients/${project.client.id}`}
                  className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  {project.client.name}
                </Link>
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
              <p className="text-2xl font-bold flex items-center gap-1 justify-end">
                <DollarSign className="h-5 w-5" />
                {getTotalPrice().toLocaleString('da-DK')} kr.
              </p>
              <p className={cn(
                "text-sm flex items-center gap-1 justify-end",
                getTotalRegisteredHours() > getTotalHours() ? 'text-destructive' : 'text-muted-foreground'
              )}>
                <Clock className="h-3 w-3" />
                {getTotalRegisteredHours()} / {getTotalHours()} timer
                {getTotalRegisteredHours() > getTotalHours() && (
                  <AlertTriangle className="h-3 w-3 ml-1" />
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Opgaver
            </CardTitle>
            <Button size="sm" onClick={openCreateTaskForm}>
              <Plus className="h-4 w-4 mr-1" />
              Ny opgave
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">Ingen opgaver endnu.</p>
          ) : (
            <div className="space-y-4">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      {task.price !== null && task.price !== undefined && (
                        <p className="font-semibold">
                          {task.price.toLocaleString('da-DK')} kr.
                        </p>
                      )}
                      {task.estimatedHours !== null && task.estimatedHours !== undefined && (
                        <p className={cn(
                          "text-sm flex items-center gap-1 justify-end",
                          getTaskTotalHours(task.id) > task.estimatedHours ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          <Clock className="h-3 w-3" />
                          {getTaskTotalHours(task.id)} / {task.estimatedHours} timer
                        </p>
                      )}
                    </div>
                  </div>

                  {getTaskTimeEntries(task.id).length > 0 && (
                    <div className="pl-4 border-l-2 border-muted space-y-1">
                      {getTaskTimeEntries(task.id).map((te) => (
                        <div key={te.id} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">
                            {new Date(te.date).toLocaleDateString('da-DK')} • {te.hours} timer
                            {te.notes && <span className="ml-1">({te.notes})</span>}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleDeleteTimeEntry(te.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" size="sm" onClick={() => openTimeEntryForm(task)}>
                      <Clock className="h-3 w-3 mr-1" />
                      Registrer tid
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditTaskForm(task)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Rediger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Slet
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
            <CardTitle className="text-lg">Aftaler</CardTitle>
            <Button size="sm" onClick={() => setShowAgreementForm(true)}>
              <FileText className="h-4 w-4 mr-1" />
              Generer aftale
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Tilføj opgaver før du kan generere en aftale.
            </p>
          ) : project.tasks.length > 0 && (
            <PDFDownloadLink
              document={
                <AgreementDocument
                  project={project}
                  agreementType={agreementType}
                  generatedDate={new Date().toLocaleDateString('da-DK')}
                />
              }
              fileName={`aftale-${project.name.toLowerCase().replace(/\s+/g, '-')}.pdf`}
              className="inline-flex"
            >
              {({ loading }) => (
                <Button variant="outline" disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Forbereder PDF...' : 'Download aftale som PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </CardContent>
      </Card>

      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Rediger opgave' : 'Ny opgave'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Titel</Label>
              <Input
                id="task-title"
                required
                value={taskFormData.title}
                onChange={(e) =>
                  setTaskFormData({ ...taskFormData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Beskrivelse</Label>
              <Textarea
                id="task-description"
                value={taskFormData.description}
                onChange={(e) =>
                  setTaskFormData({ ...taskFormData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-price">Pris (kr.)</Label>
                <Input
                  id="task-price"
                  type="number"
                  step="0.01"
                  value={taskFormData.price}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-hours">Estimeret tid (timer)</Label>
                <Input
                  id="task-hours"
                  type="number"
                  step="0.5"
                  value={taskFormData.estimatedHours}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, estimatedHours: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeTaskForm}>
                Annuller
              </Button>
              <Button type="submit">
                {editingTask ? 'Gem ændringer' : 'Opret'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimeEntryForm} onOpenChange={setShowTimeEntryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Registrer tid på: {selectedTaskForTime?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTimeEntry} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="time-hours">Timer</Label>
              <Input
                id="time-hours"
                type="number"
                step="0.25"
                min="0.25"
                required
                value={timeEntryFormData.hours}
                onChange={(e) =>
                  setTimeEntryFormData({ ...timeEntryFormData, hours: e.target.value })
                }
                placeholder="f.eks. 2.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-date">Dato</Label>
              <Input
                id="time-date"
                type="date"
                required
                value={timeEntryFormData.date}
                onChange={(e) =>
                  setTimeEntryFormData({ ...timeEntryFormData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-notes">Noter (valgfrit)</Label>
              <Textarea
                id="time-notes"
                value={timeEntryFormData.notes}
                onChange={(e) =>
                  setTimeEntryFormData({ ...timeEntryFormData, notes: e.target.value })
                }
                placeholder="Hvad har du lavet?"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeTimeEntryForm}>
                Annuller
              </Button>
              <Button type="submit">
                Registrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAgreementForm} onOpenChange={setShowAgreementForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generer aftale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agreement-type">Aftaltype</Label>
              <Select value={agreementType} onValueChange={setAgreementType}>
                <SelectTrigger id="agreement-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROJECT">Projekt</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="RETAINER">Retainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Oversigt over aftalen:</p>
              <p className="text-lg font-bold">
                {getTotalPrice().toLocaleString('da-DK')} kr.
              </p>
              <p className="text-sm text-muted-foreground">
                {getTotalHours()} timer • {project.tasks.length} opgaver
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAgreementForm(false)}>
                Annuller
              </Button>
              <Button onClick={handleGenerateAgreement}>
                Generer aftale
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

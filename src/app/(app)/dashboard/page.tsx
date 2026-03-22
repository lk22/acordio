'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FolderKanban, DollarSign, Clock, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  type: string;
  client: Client;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
    fetchProjects();
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

  async function fetchProjects() {
    try {
      const res = await fetch('/api/dashboard/projects');
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }

  const pipelineStages = {
    LEAD: { label: 'Leads', color: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800' },
    CUSTOMER: { label: 'Kunder', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' },
    HAS_RECEIVED_PROPOSAL: { label: 'Har tilbud', color: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800' },
    HAS_SIGNED_AGREEMENT: { label: 'Har aftale', color: 'bg-green-500', badge: 'bg-green-100 text-green-800' },
    ACTIVE: { label: 'Aktive', color: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
    INACTIVE: { label: 'Inaktive', color: 'bg-gray-500', badge: 'bg-muted text-muted-foreground' },
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    Object.keys(pipelineStages).forEach((stage) => {
      counts[stage] = clients.filter((c) => c.status === stage).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalRevenue = projects.reduce((sum, p) => sum + (p as any).tasks?.reduce((s: number, t: any) => s + (t.price || 0), 0) || 0, 0);
  const totalHours = projects.reduce((sum, p) => sum + (p as any).tasks?.reduce((s: number, t: any) => s + (t.estimatedHours || 0), 0) || 0, 0);
  const activeProjects = projects.filter(p => p.type === 'PROJECT').length;
  const activeSupports = projects.filter(p => p.type === 'SUPPORT').length;
  const retainers = projects.filter(p => p.type === 'RETAINER').length;

  const recentLeads = clients
    .filter(c => c.status === 'LEAD')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getDaysSince = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const needsFollowUp = (createdAt: string) => {
    const days = getDaysSince(createdAt);
    return days > 7;
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Indlæser...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overblik over din freelance pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(pipelineStages).map(([key, stage]) => (
          <Link key={key} href={`/dashboard/clients?status=${key}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="text-sm font-medium">{stage.label}</span>
                </div>
                <p className="text-3xl font-bold">{statusCounts[key] || 0}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Samlet værdi</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString('da-DK')} kr.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimerede timer</p>
                <p className="text-2xl font-bold">{totalHours} t.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktive projekter</p>
                <p className="text-2xl font-bold">{activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Support-aftaler</p>
                <p className="text-2xl font-bold">{activeSupports + retainers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hurtige handlinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/clients">
              <Button variant="outline" className="w-full justify-between">
                Se alle kunder & leads
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button variant="outline" className="w-full justify-between">
                Se alle projekter
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(pipelineStages).map(([key, stage]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="flex-1 text-sm">{stage.label}</span>
                  <Badge variant="secondary">{statusCounts[key] || 0}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-lg">Leads der skal følges op</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-sm">Ingen leads at følge op på.</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between">
                    <Link
                      href={`/dashboard/clients/${lead.id}`}
                      className="text-sm hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <Badge variant={needsFollowUp(lead.createdAt) ? 'destructive' : 'secondary'}>
                      {getDaysSince(lead.createdAt)} dage
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

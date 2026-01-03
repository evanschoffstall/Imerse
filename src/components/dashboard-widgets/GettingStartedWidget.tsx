'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Task {
  id: string;
  label: string;
  completed: boolean;
  link?: string;
}

interface GettingStartedWidgetProps {
  campaignId: string;
}

export function GettingStartedWidget({ campaignId }: GettingStartedWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Fetch campaign stats efficiently (just counts, not full data)
        const response = await fetch(`/api/campaigns/${campaignId}/stats`);
        const stats = await response.json();

        const hasCharacters = stats.hasCharacters || false;
        const hasLocations = stats.hasLocations || false;

        setTasks([
          {
            id: '1',
            label: 'Your first world is ready.',
            completed: true,
          },
          {
            id: '2',
            label: 'Name your campaign.',
            completed: true,
          },
          {
            id: '3',
            label: 'Create your first character.',
            completed: hasCharacters,
            link: hasCharacters ? undefined : `/characters/new?campaignId=${campaignId}`,
          },
          {
            id: '4',
            label: 'Create your first location.',
            completed: hasLocations,
            link: hasLocations ? undefined : `/locations/new?campaignId=${campaignId}`,
          },
          {
            id: '5',
            label: 'Invite a friend or co-author.',
            completed: false,
          },
          {
            id: '6',
            label: 'Customise your dashboard.',
            completed: true,
          },
        ]);
      } catch (error) {
        console.error('Error fetching campaign progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [campaignId]);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Getting Started</CardTitle>
        <span className="text-sm text-muted-foreground">
          {completedCount} / {tasks.length}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={task.completed} readOnly className="rounded" />
              {task.completed ? (
                <span className="line-through text-muted-foreground">{task.label}</span>
              ) : task.link ? (
                <Link href={task.link} className="hover:underline">
                  {task.label}
                </Link>
              ) : (
                <span>{task.label}</span>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

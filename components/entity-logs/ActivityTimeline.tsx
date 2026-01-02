'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActivityTimelineItem } from '@/types/entity-log';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

interface ActivityTimelineProps {
  campaignId: string;
  limit?: number;
  height?: string;
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  character: 'Character',
  location: 'Location',
  quest: 'Quest',
  event: 'Event',
  item: 'Item',
  creature: 'Creature',
  note: 'Note',
  journal: 'Journal',
  conversation: 'Conversation',
  post: 'Post',
  map: 'Map',
  calendar: 'Calendar',
  ability: 'Ability',
  race: 'Race',
  family: 'Family',
  organisation: 'Organisation',
  timeline: 'Timeline',
  tag: 'Tag',
  reminder: 'Reminder',
  whiteboard: 'Whiteboard',
  preset: 'Preset',
  dashboard: 'Dashboard',
};

export default function ActivityTimeline({
  campaignId,
  limit = 50,
  height = '600px'
}: ActivityTimelineProps) {
  const [activity, setActivity] = useState<ActivityTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/activity?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setActivity(data);
        }
      } catch (error) {
        console.error('Failed to fetch campaign activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [campaignId, limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading activity...</div>
        </CardContent>
      </Card>
    );
  }

  if (activity.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Activity</CardTitle>
          <CardDescription>No activity recorded yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Activity</CardTitle>
        <CardDescription>Recent changes across the campaign</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height }}>
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${item.action === 'create' ? 'bg-green-500' :
                      item.action === 'update' ? 'bg-blue-500' :
                        item.action === 'delete' ? 'bg-red-500' :
                          'bg-purple-500'
                    }`} />
                  <div className="w-px h-full bg-border" />
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {item.user?.name || 'Unknown User'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.action}
                      </Badge>
                      {item.entity && (
                        <Badge variant="secondary" className="text-xs">
                          {ENTITY_TYPE_LABELS[item.entity.type] || item.entity.type}
                        </Badge>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </time>
                  </div>

                  <p className="text-sm text-muted-foreground">{item.description}</p>

                  {item.changes?.fields && item.changes.fields.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Modified: {item.changes.fields.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

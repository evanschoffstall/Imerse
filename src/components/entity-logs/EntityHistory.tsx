'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { EntityAction, EntityLogWithRelations } from '@/types/entity-log';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface EntityHistoryProps {
  entityType: string;
  entityId: string;
  limit?: number;
}

const ACTION_COLORS: Record<EntityAction, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  restore: 'bg-purple-100 text-purple-800',
};

export default function EntityHistory({ entityType, entityId, limit = 50 }: EntityHistoryProps) {
  const [logs, setLogs] = useState<EntityLogWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/entities/${entityType}/${entityId}/logs?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error('Failed to fetch entity history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [entityType, entityId, limit]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading history...</div>;
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>No history available for this entity.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>{logs.length} recorded changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border-l-2 border-muted pl-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={ACTION_COLORS[log.action as EntityAction]}>
                    {log.action}
                  </Badge>
                  <span className="text-sm font-medium">
                    {log.user?.name || 'Unknown User'}
                  </span>
                </div>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                </time>
              </div>

              {log.changes && typeof log.changes === 'object' && log.changes !== null && (
                <div className="text-sm space-y-2">
                  {('diff' in log.changes) && Array.isArray(log.changes.diff) && log.changes.diff.length > 0 && (
                    <div>
                      <span className="font-medium">Changed fields:</span>
                      <ul className="list-disc list-inside pl-2 mt-1">
                        {log.changes.diff.map((field: any, idx: number) => (
                          <li key={idx} className="text-muted-foreground">
                            <span className="font-mono">{field.field}</span>
                            {field.oldValue !== undefined && field.newValue !== undefined && (
                              <span className="ml-2">
                                <span className="line-through">{String(field.oldValue)}</span>
                                {' → '}
                                <span className="font-medium">{String(field.newValue)}</span>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {('metadata' in log.changes) && typeof log.changes.metadata === 'object' && log.changes.metadata && (
                    <div className="text-xs text-muted-foreground">
                      {Object.entries(log.changes.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {log.ipAddress && (
                <div className="text-xs text-muted-foreground mt-2">
                  IP: {log.ipAddress}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

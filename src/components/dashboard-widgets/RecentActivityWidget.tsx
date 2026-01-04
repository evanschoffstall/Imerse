'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cachedFetch } from '@/lib/api-cache';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface RecentEntity {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  imageId?: string | null;
}

interface RecentActivityWidgetProps {
  campaignId: string;
}

export function RecentActivityWidget({ campaignId }: RecentActivityWidgetProps) {
  const [entities, setEntities] = useState<RecentEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const data = await cachedFetch<{ entities: RecentEntity[] }>(
          `/api/campaigns/${campaignId}/recent`
        );
        setEntities(data.entities || []);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [campaignId]);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const days = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return then.toLocaleDateString();
  };

  const getEntityLink = (entity: RecentEntity) => {
    const typeMap: Record<string, string> = {
      character: 'characters',
      location: 'locations',
      item: 'items',
      quest: 'quests',
      event: 'events',
      journal: 'journals',
      note: 'notes',
    };
    const path = typeMap[entity.type.toLowerCase()] || entity.type.toLowerCase() + 's';
    return `/${path}/${entity.id}`;
  };

  if (loading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recently modified entities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recently modified entities</CardTitle>
      </CardHeader>
      <CardContent>
        {entities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {entities.map((entity) => (
              <Link
                key={entity.id}
                href={getEntityLink(entity)}
                className="flex items-center gap-3 hover:bg-accent rounded-md p-2 -mx-2 transition-colors"
              >
                {entity.imageId && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={entity.imageId}
                      alt={entity.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{entity.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{entity.type}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(entity.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

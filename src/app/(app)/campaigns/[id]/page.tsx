'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RecentEntity {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  image?: string;
}

export default function CampaignDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [recentEntities, setRecentEntities] = useState<RecentEntity[]>([]);
  const [activeQuests, setActiveQuests] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // TODO: Fetch recent entities and active quests
    setRecentEntities([]);
    setActiveQuests([]);
  }, [params.id]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const days = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return then.toLocaleDateString();
  };

  return (
    <>
      {/* Dashboard Content */}
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recently Modified Entities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recently modified entities</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEntities.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentEntities.map((entity) => (
                    <div key={entity.id} className="flex items-center gap-3">
                      {entity.image && (
                        <img
                          src={entity.image}
                          alt={entity.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{entity.name}</p>
                        <p className="text-xs text-muted-foreground">{entity.type}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(entity.updatedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help & Community */}
          <Card>
            <CardHeader>
              <CardTitle>Placeholder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Getting Started</CardTitle>
              <span className="text-sm text-muted-foreground">4 / 6</span>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked readOnly className="rounded" />
                <span className="line-through text-muted-foreground">Your first world is ready.</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked readOnly className="rounded" />
                <span className="line-through text-muted-foreground">Rename your world.</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked readOnly className="rounded" />
                <span className="line-through text-muted-foreground">Create your first character.</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <Link href={`/campaigns/${params.id}/locations`} className="hover:underline">
                  Create your first location.
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span>Invite a friend or co-author.</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked readOnly className="rounded" />
                <span className="line-through text-muted-foreground">Customise your dashboard.</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Quests */}
          <Card>
            <CardHeader>
              <CardTitle>Active quests</CardTitle>
            </CardHeader>
            <CardContent>
              {activeQuests.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active quests</p>
              ) : (
                <div className="space-y-3">
                  {activeQuests.map((quest) => (
                    <div key={quest.id} className="border-b border-border pb-2 last:border-0">
                      <p className="font-medium text-sm">{quest.name}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(quest.updatedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

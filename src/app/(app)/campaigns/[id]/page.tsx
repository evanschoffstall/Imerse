'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RecentEntity {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  image?: string;
}

export default function CampaignDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recentEntities, setRecentEntities] = useState<RecentEntity[]>([]);
  const [activeQuests, setActiveQuests] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Fetch recent entities and active quests
    setRecentEntities([]);
    setActiveQuests([]);
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete campaign');
      }

      toast.success('Campaign deleted successfully');
      router.push('/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete campaign');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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

          {/* Danger Zone */}
          <Card className="lg:col-span-3 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone and will delete all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

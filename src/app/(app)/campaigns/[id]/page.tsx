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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import RichTextViewer from '@/components/editor/RichTextViewer';
import { Campaign } from '@/features/campaigns';
import NextImage from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }

        const data = await response.json();
        setCampaign(data.campaign);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast.error('Failed to load campaign');
        router.push('/campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCampaign();
    }
  }, [params.id, router]);

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Card with Image */}
      <Card className="mb-6">
        {campaign.image && (
          <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
            <NextImage
              src={campaign.image}
              alt={campaign.name}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">{campaign.name}</CardTitle>
              <CardDescription>Created by {campaign.owner.name}</CardDescription>
            </div>
            <div className="flex gap-3">
              <Link href={`/campaigns/${campaign.id}/edit`}>
                <Button variant="secondary">Edit Campaign</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Campaign
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Description */}
        {campaign.description && (
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <RichTextViewer content={campaign.description} />
          </CardContent>
        )}
      </Card>

      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Characters */}
        <Link href={`/characters?campaignId=${campaign.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Characters</CardTitle>
              <CardDescription>Manage your campaign characters</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Locations */}
        <Link href={`/locations?campaignId=${campaign.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>Explore your world's locations</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Sessions/Events */}
        <Card className="h-full opacity-50">
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Coming soon...</CardDescription>
          </CardHeader>
        </Card>

        {/* Items */}
        <Card className="h-full opacity-50">
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>Coming soon...</CardDescription>
          </CardHeader>
        </Card>

        {/* Quests */}
        <Card className="h-full opacity-50">
          <CardHeader>
            <CardTitle>Quests</CardTitle>
            <CardDescription>Coming soon...</CardDescription>
          </CardHeader>
        </Card>

        {/* Notes */}
        <Card className="h-full opacity-50">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Coming soon...</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaign.name}"? This action cannot be undone and will delete all associated data.
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
    </div>
  );
}

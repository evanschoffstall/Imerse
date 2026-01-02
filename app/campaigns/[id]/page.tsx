'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Campaign } from '@/types/campaign';
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with actions */}
      <div className="bg-white shadow rounded-lg mb-6">
        {campaign.image && (
          <div className="relative w-full h-64 rounded-t-lg overflow-hidden">
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
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created by {campaign.owner.name}
              </p>
            </div>
            <div className="flex space-x-3">
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
        </div>

        {/* Description */}
        {campaign.description && (
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: campaign.description }}
            />
          </div>
        )}
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Characters */}
        <Link href={`/characters?campaignId=${campaign.id}`}>
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Characters</h3>
            <p className="text-gray-600">Manage your campaign characters</p>
          </div>
        </Link>

        {/* Locations */}
        <Link href={`/locations?campaignId=${campaign.id}`}>
          <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Locations</h3>
            <p className="text-gray-600">Explore your world's locations</p>
          </div>
        </Link>

        {/* Sessions/Events */}
        <div className="bg-white shadow rounded-lg p-6 opacity-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sessions</h3>
          <p className="text-gray-600">Coming soon...</p>
        </div>

        {/* Items */}
        <div className="bg-white shadow rounded-lg p-6 opacity-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Items</h3>
          <p className="text-gray-600">Coming soon...</p>
        </div>

        {/* Quests */}
        <div className="bg-white shadow rounded-lg p-6 opacity-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quests</h3>
          <p className="text-gray-600">Coming soon...</p>
        </div>

        {/* Notes */}
        <div className="bg-white shadow rounded-lg p-6 opacity-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone and will delete all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

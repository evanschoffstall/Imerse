'use client';

import Button from '@/components/ui/Button';
import { Campaign } from '@/types/campaign';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');

        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }

        const data = await response.json();
        setCampaigns(data.campaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        toast.error('Failed to load campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Campaigns</h1>
        <Link href="/campaigns/new">
          <Button>Create New Campaign</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first campaign to start your worldbuilding journey.
          </p>
          <Link href="/campaigns/new">
            <Button>Create Your First Campaign</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6" data-testid="campaigns-list">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                data-testid="campaign-card"
              >
                <h3 className="text-xl font-semibold mb-2">{campaign.name}</h3>
                {campaign.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {campaign.description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    Updated {new Date(campaign.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


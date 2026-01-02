'use client';

import CampaignForm from '@/components/forms/CampaignForm';
import { CampaignFormData } from '@/types/campaign';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CampaignFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create campaign');
      }

      const result = await response.json();
      toast.success('Campaign created successfully!');
      router.push(`/campaigns/${result.campaign.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Campaign
        </h1>
        <p className="text-gray-600">
          Start your worldbuilding journey by creating a new campaign.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <CampaignForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitText="Create Campaign"
        />
      </div>
    </div>
  );
}

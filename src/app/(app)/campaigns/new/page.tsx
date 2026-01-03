'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CampaignFormData } from '@/features/campaigns';
import { CampaignForm } from '@/features/campaigns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NewCampaignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Campaign</CardTitle>
          <CardDescription>
            Start your worldbuilding journey by creating a new campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitText="Create Campaign"
          />
        </CardContent>
      </Card>
    </div>
  );
}

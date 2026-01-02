'use client';

import CampaignForm from '@/components/forms/CampaignForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignFormData } from '@/types/campaign';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [initialData, setInitialData] = useState<Partial<CampaignFormData> | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }

        const data = await response.json();
        setInitialData({
          name: data.campaign.name,
          description: data.campaign.description || '',
        });
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast.error('Failed to load campaign');
        router.push('/campaigns');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (params.id) {
      fetchCampaign();
    }
  }, [params.id, router]);

  const handleSubmit = async (data: CampaignFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: 'PATCH',
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
        throw new Error(error.error || 'Failed to update campaign');
      }

      toast.success('Campaign updated successfully!');
      router.push(`/campaigns/${params.id}`);
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update campaign');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Campaign</CardTitle>
          <CardDescription>
            Update your campaign details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitText="Update Campaign"
          />
        </CardContent>
      </Card>
    </div>
  );
}

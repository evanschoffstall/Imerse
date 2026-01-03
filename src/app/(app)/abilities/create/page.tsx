'use client';

import AbilityForm from '@/components/forms/AbilityForm';
import { Ability } from '@/types/ability';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateAbilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const [parentAbilities, setParentAbilities] = useState<Ability[]>([]);

  useEffect(() => {
    if (campaignId) {
      fetchAbilities();
    }
  }, [campaignId]);

  const fetchAbilities = async () => {
    try {
      const res = await fetch(`/api/abilities?campaignId=${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setParentAbilities(data);
      }
    } catch (error) {
      console.error('Error fetching abilities:', error);
    }
  };

  if (!campaignId) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Campaign ID required</p>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/abilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          campaignId,
        }),
      });

      if (res.ok) {
        const ability = await res.json();
        toast.success('Ability created!');
        router.push(`/abilities/${ability.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create ability');
      }
    } catch (error) {
      console.error('Error creating ability:', error);
      toast.error('An error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Ability</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
        <AbilityForm
          campaignId={campaignId}
          parentAbilities={parentAbilities}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/abilities?campaignId=${campaignId}`)}
        />
        </CardContent>
      </Card>
    </div>
  );
}

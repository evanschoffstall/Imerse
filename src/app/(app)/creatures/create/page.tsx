'use client';

import CreatureForm from '@/components/forms/CreatureForm';
import { Creature } from '@/types/creature';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateCreaturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const [parentCreatures, setParentCreatures] = useState<Creature[]>([]);

  useEffect(() => {
    if (campaignId) {
      fetchCreatures();
    }
  }, [campaignId]);

  const fetchCreatures = async () => {
    try {
      const res = await fetch(`/api/creatures?campaignId=${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setParentCreatures(data);
      }
    } catch (error) {
      console.error('Error fetching creatures:', error);
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
      const res = await fetch('/api/creatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          campaignId,
        }),
      });

      if (res.ok) {
        const creature = await res.json();
        toast.success('Creature created!');
        router.push(`/creatures/${creature.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create creature');
      }
    } catch (error) {
      console.error('Error creating creature:', error);
      toast.error('An error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Creature</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
        <CreatureForm
          campaignId={campaignId}
          parentCreatures={parentCreatures}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/creatures?campaignId=${campaignId}`)}
        />
        </CardContent>
      </Card>
    </div>
  );
}

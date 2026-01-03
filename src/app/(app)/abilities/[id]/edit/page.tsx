'use client';

import AbilityForm from '@/components/forms/AbilityForm';
import { Ability } from '@/types/ability';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function EditAbilityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [ability, setAbility] = useState<Ability | null>(null);
  const [parentAbilities, setParentAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAbility();
  }, [params.id]);

  const fetchAbility = async () => {
    try {
      const res = await fetch(`/api/abilities/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setAbility(data);

        // Fetch other abilities for parent selection (exclude self and descendants)
        const allRes = await fetch(`/api/abilities?campaignId=${data.campaignId}`);
        if (allRes.ok) {
          const allAbilities = await allRes.json();
          // Filter out self
          setParentAbilities(allAbilities.filter((a: Ability) => a.id !== data.id));
        }
      } else {
        toast.error('Ability not found');
        router.push('/abilities');
      }
    } catch (error) {
      console.error('Error fetching ability:', error);
      toast.error('Failed to load ability');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/abilities/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Ability updated!');
        router.push(`/abilities/${params.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update ability');
      }
    } catch (error) {
      console.error('Error updating ability:', error);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${ability?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/abilities/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Ability deleted');
        router.push(`/abilities?campaignId=${ability?.campaignId}`);
      } else {
        toast.error('Failed to delete ability');
      }
    } catch (error) {
      console.error('Error deleting ability:', error);
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!ability) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Ability not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Ability</h1>
        <Button
          onClick={handleDelete}
          variant="destructive"
        >
          Delete
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <AbilityForm
          ability={ability}
          campaignId={ability.campaignId}
          parentAbilities={parentAbilities}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/abilities/${params.id}`)}
        />
      </div>
    </div>
  );
}

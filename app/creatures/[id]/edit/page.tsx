'use client';

import CreatureForm from '@/components/forms/CreatureForm';
import { Creature } from '@/types/creature';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditCreaturePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [creature, setCreature] = useState<Creature | null>(null);
  const [parentCreatures, setParentCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreature();
  }, [params.id]);

  const fetchCreature = async () => {
    try {
      const res = await fetch(`/api/creatures/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setCreature(data);

        // Fetch other creatures for parent selection (exclude self)
        const allRes = await fetch(`/api/creatures?campaignId=${data.campaignId}`);
        if (allRes.ok) {
          const allCreatures = await allRes.json();
          // Filter out self
          setParentCreatures(allCreatures.filter((c: Creature) => c.id !== data.id));
        }
      } else {
        toast.error('Creature not found');
        router.push('/creatures');
      }
    } catch (error) {
      console.error('Error fetching creature:', error);
      toast.error('Failed to load creature');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/creatures/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Creature updated!');
        router.push(`/creatures/${params.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update creature');
      }
    } catch (error) {
      console.error('Error updating creature:', error);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${creature?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/creatures/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Creature deleted');
        router.push(`/creatures?campaignId=${creature?.campaignId}`);
      } else {
        toast.error('Failed to delete creature');
      }
    } catch (error) {
      console.error('Error deleting creature:', error);
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

  if (!creature) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Creature not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Creature</h1>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 dark:bg-gray-900 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
        >
          Delete
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <CreatureForm
          creature={creature}
          campaignId={creature.campaignId}
          parentCreatures={parentCreatures}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/creatures/${params.id}`)}
        />
      </div>
    </div>
  );
}

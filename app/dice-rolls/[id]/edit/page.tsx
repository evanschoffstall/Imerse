'use client';

import DiceRollForm from '@/components/forms/DiceRollForm';
import { Character } from '@/types/character';
import { DiceRoll } from '@/types/dice-roll';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditDiceRollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiceRoll();
  }, [params.id]);

  const fetchDiceRoll = async () => {
    try {
      const res = await fetch(`/api/dice-rolls/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDiceRoll(data);

        // Fetch characters for the campaign
        const charRes = await fetch(`/api/characters?campaignId=${data.campaignId}`);
        if (charRes.ok) {
          const charData = await charRes.json();
          setCharacters(charData);
        }
      } else {
        toast.error('Dice roll not found');
        router.push('/dice-rolls');
      }
    } catch (error) {
      console.error('Error fetching dice roll:', error);
      toast.error('Failed to load dice roll');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/dice-rolls/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Dice roll updated!');
        router.push(`/dice-rolls/${params.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update dice roll');
      }
    } catch (error) {
      console.error('Error updating dice roll:', error);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${diceRoll?.name}"? This will delete all roll history too.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/dice-rolls/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Dice roll deleted');
        router.push(`/dice-rolls?campaignId=${diceRoll?.campaignId}`);
      } else {
        toast.error('Failed to delete dice roll');
      }
    } catch (error) {
      console.error('Error deleting dice roll:', error);
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

  if (!diceRoll) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Dice roll not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Dice Roll</h1>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 dark:bg-gray-900 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
        >
          Delete
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <DiceRollForm
          diceRoll={diceRoll}
          campaignId={diceRoll.campaignId}
          characters={characters}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/dice-rolls/${params.id}`)}
        />
      </div>
    </div>
  );
}

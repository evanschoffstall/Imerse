'use client';

import DiceRollForm from '@/components/forms/DiceRollForm';
import { Character } from '@/types/character';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateDiceRollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    if (campaignId) {
      fetchCharacters();
    }
  }, [campaignId]);

  const fetchCharacters = async () => {
    try {
      const res = await fetch(`/api/characters?campaignId=${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
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
      const res = await fetch('/api/dice-rolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          campaignId,
        }),
      });

      if (res.ok) {
        const diceRoll = await res.json();
        toast.success('Dice roll created!');
        router.push(`/dice-rolls/${diceRoll.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create dice roll');
      }
    } catch (error) {
      console.error('Error creating dice roll:', error);
      toast.error('An error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Dice Roll</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
        <DiceRollForm
          campaignId={campaignId}
          characters={characters}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/dice-rolls?campaignId=${campaignId}`)}
        />
        </CardContent>
      </Card>
    </div>
  );
}

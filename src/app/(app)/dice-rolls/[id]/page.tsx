'use client';

import DiceRollResults from '@/components/dice-rolls/DiceRollResults';
import { DiceRollResultWithRelations, DiceRollWithRelations } from '@/types/dice-roll';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DiceRollDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [diceRoll, setDiceRoll] = useState<DiceRollWithRelations | null>(null);
  const [results, setResults] = useState<DiceRollResultWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    fetchDiceRoll();
  }, [params.id]);

  const fetchDiceRoll = async () => {
    try {
      const res = await fetch(`/api/dice-rolls/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDiceRoll(data);
        setResults(data.results || []);
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

  const handleRoll = async () => {
    setRolling(true);
    try {
      const res = await fetch('/api/dice-roll-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diceRollId: params.id,
          isPrivate: diceRoll?.isPrivate || false,
        }),
      });

      if (res.ok) {
        const newResult = await res.json();
        setResults([newResult, ...results]);
        toast.success('Roll executed!');
      } else {
        toast.error('Failed to execute roll');
      }
    } catch (error) {
      console.error('Error rolling dice:', error);
      toast.error('An error occurred');
    } finally {
      setRolling(false);
    }
  };

  const handleDeleteResult = async (id: string) => {
    try {
      const res = await fetch(`/api/dice-roll-results/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setResults(results.filter((r) => r.id !== id));
        toast.success('Result deleted');
      } else {
        toast.error('Failed to delete result');
      }
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!diceRoll) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Dice roll not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{diceRoll.name}</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRoll}
              disabled={rolling}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {rolling ? 'Rolling...' : '🎲 Roll'}
            </button>
            <Link
              href={`/dice-rolls/${params.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {diceRoll.isPrivate && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Private
            </span>
          )}
          {diceRoll.system && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {diceRoll.system}
            </span>
          )}
        </div>

        <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-lg font-mono text-gray-900 dark:text-white">{diceRoll.parameters}</p>
        </div>

        {diceRoll.character && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Character:</span>{' '}
            <Link
              href={`/characters/${diceRoll.character.id}`}
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              {diceRoll.character.name}
            </Link>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Created by {diceRoll.createdBy.name} • {results.length} roll{results.length !== 1 ? 's' : ''}
        </div>

        <div className="mt-4">
          <Link
            href={`/dice-rolls?campaignId=${diceRoll.campaignId}`}
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            ← Back to Dice Rolls
          </Link>
        </div>
      </div>

      {/* Roll History */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Roll History</h2>
        <DiceRollResults results={results} onDelete={handleDeleteResult} />
      </div>
    </div>
  );
}

'use client';

import { DiceRollWithRelations } from '@/types/dice-roll';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface DiceRollListProps {
  diceRolls: DiceRollWithRelations[];
  campaignId: string;
  onDelete?: (id: string) => void;
  onRoll?: (id: string) => void;
}

export default function DiceRollList({ diceRolls, campaignId, onDelete, onRoll }: DiceRollListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    try {
      await onDelete(id);
      toast.success('Dice roll deleted');
    } catch (error) {
      toast.error('Failed to delete dice roll');
    } finally {
      setDeleteId(null);
    }
  };

  const handleRoll = async (id: string) => {
    if (!onRoll) return;

    try {
      await onRoll(id);
      toast.success('Roll executed!');
    } catch (error) {
      toast.error('Failed to execute roll');
    }
  };

  if (diceRolls.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No dice rolls</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new dice roll.
        </p>
        <div className="mt-6">
          <Link
            href={`/dice-rolls/create?campaignId=${campaignId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Dice Roll
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {diceRolls.map((diceRoll) => (
        <div
          key={diceRoll.id}
          className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/dice-rolls/${diceRoll.id}`}
                  className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {diceRoll.name}
                </Link>
                {diceRoll.isPrivate && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Private
                  </span>
                )}
                {diceRoll.system && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {diceRoll.system}
                  </span>
                )}
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {diceRoll.parameters}
                </p>
              </div>

              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                {diceRoll.character && (
                  <div className="flex items-center">
                    <span className="mr-1">🎭</span>
                    <Link
                      href={`/characters/${diceRoll.character.id}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {diceRoll.character.name}
                    </Link>
                  </div>
                )}
                <div>
                  {diceRoll._count?.results || 0} roll{diceRoll._count?.results !== 1 ? 's' : ''}
                </div>
                <div>by {diceRoll.createdBy.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {onRoll && (
                <button
                  onClick={() => handleRoll(diceRoll.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  title="Roll dice"
                >
                  🎲 Roll
                </button>
              )}
              <Link
                href={`/dice-rolls/${diceRoll.id}/edit`}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                title="Edit"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>
              {onDelete && (
                <button
                  onClick={() => setDeleteId(diceRoll.id)}
                  className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
                  title="Delete"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Dice Roll?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This will delete the dice roll and all its roll history. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

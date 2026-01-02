'use client';

import { DiceRollResultWithRelations, getRollDetails } from '@/types/dice-roll';

interface DiceRollResultsProps {
  results: DiceRollResultWithRelations[];
  onDelete?: (id: string) => void;
}

export default function DiceRollResults({ results, onDelete }: DiceRollResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No rolls yet. Click "Roll" to execute this dice roll.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => {
        const rollDetails = getRollDetails(result.results);

        return (
          <div
            key={result.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {rollDetails.total}
                  </div>
                  {result.isPrivate && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Private
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {rollDetails.expression}
                    {rollDetails.substituted !== rollDetails.expression && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {' '}→ {rollDetails.substituted}
                      </span>
                    )}
                  </div>

                  {rollDetails.breakdown && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {rollDetails.breakdown}
                    </div>
                  )}

                  {rollDetails.rolls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rollDetails.rolls.map((roll, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                        >
                          <span className="text-gray-500 dark:text-gray-400 mr-1">
                            {roll.type}:
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {roll.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                  <div>by {result.createdBy.name}</div>
                  <div>
                    {new Date(result.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {onDelete && (
                <button
                  onClick={() => onDelete(result.id)}
                  className="ml-4 text-red-400 hover:text-red-500 dark:hover:text-red-300"
                  title="Delete result"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { AbilityWithRelations } from '@/types/ability';
import Link from 'next/link';

interface AbilityListProps {
  abilities: AbilityWithRelations[];
  campaignId: string;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export default function AbilityList({
  abilities,
  campaignId,
  showActions = true,
  onDelete,
}: AbilityListProps) {
  if (abilities.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No abilities found.</p>
        <Link
          href={`/abilities/create?campaignId=${campaignId}`}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Ability
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {abilities.map((ability) => (
          <li key={ability.id}>
            <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/abilities/${ability.id}`}
                      className="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 truncate"
                    >
                      {ability.name}
                    </Link>

                    {ability.type && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {ability.type}
                      </span>
                    )}

                    {ability.isPrivate && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        🔒 Private
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {ability.charges !== null && (
                      <span>
                        ⚡ {ability.charges} {ability.charges === 1 ? 'charge' : 'charges'}
                      </span>
                    )}

                    {ability.parent && (
                      <span>
                        📁 Parent: {ability.parent.name}
                      </span>
                    )}

                    {ability._count && ability._count.children > 0 && (
                      <span>
                        👥 {ability._count.children} {ability._count.children === 1 ? 'child' : 'children'}
                      </span>
                    )}

                    {ability._count && ability._count.entityAbilities > 0 && (
                      <span>
                        🔗 {ability._count.entityAbilities} {ability._count.entityAbilities === 1 ? 'entity' : 'entities'}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Created by {ability.createdBy.name}
                  </div>
                </div>
              </div>

              {showActions && (
                <div className="ml-5 flex-shrink-0 flex gap-2">
                  <Link
                    href={`/abilities/${ability.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Edit
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete ability "${ability.name}"?`)) {
                          onDelete(ability.id);
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

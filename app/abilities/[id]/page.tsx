import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AbilityPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const ability = await prisma.ability.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          type: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
      _count: {
        select: {
          children: true,
          entityAbilities: true,
        },
      },
    },
  });

  if (!ability) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Ability not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {ability.name}
              </h1>

              {ability.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {ability.type}
                </span>
              )}

              {ability.isPrivate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  🔒 Private
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Campaign: <Link href={`/campaigns/${ability.campaign.id}`} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">{ability.campaign.name}</Link>
            </p>
          </div>

          <Link
            href={`/abilities/${ability.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ability.charges !== null && (
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Charges</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                ⚡ {ability.charges}
              </dd>
            </div>
          )}

          {ability._count.children > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sub-Abilities</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {ability._count.children}
              </dd>
            </div>
          )}

          {ability._count.entityAbilities > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Linked Entities</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {ability._count.entityAbilities}
              </dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {ability.createdBy.name}
            </dd>
          </div>
        </dl>
      </div>

      {/* Parent */}
      {ability.parent && (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Parent Ability</h2>
          <Link
            href={`/abilities/${ability.parent.id}`}
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {ability.parent.name}
          </Link>
        </div>
      )}

      {/* Description */}
      {ability.entry && (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h2>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: ability.entry }}
          />
        </div>
      )}

      {/* Children */}
      {ability.children.length > 0 && (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Sub-Abilities ({ability.children.length})
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {ability.children.map((child) => (
              <li key={child.id} className="py-3">
                <Link
                  href={`/abilities/${child.id}`}
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  {child.name}
                  {child.type && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({child.type})
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href={`/abilities?campaignId=${ability.campaignId}`}
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to Abilities
        </Link>
      </div>
    </div>
  );
}

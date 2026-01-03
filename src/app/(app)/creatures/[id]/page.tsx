import { auth } from '@/auth';
import EntityAbilities from '@/components/abilities/EntityAbilities';
import { prisma } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function CreaturePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const creature = await prisma.creature.findUnique({
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
      locations: {
        include: {
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          children: true,
          locations: true,
        },
      },
    },
  });

  if (!creature) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Creature not found</p>
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
                {creature.name}
              </h1>

              {creature.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {creature.type}
                </span>
              )}

              {creature.isExtinct && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  💀 Extinct
                </span>
              )}

              {creature.isDead && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  ⚰️ Dead
                </span>
              )}

              {creature.isPrivate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  🔒 Private
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Campaign: <Link href={`/campaigns/${creature.campaign.id}`} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">{creature.campaign.name}</Link>
            </p>
          </div>

          <Button asChild>
            <Link href={`/creatures/${creature.id}/edit`}>
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Image */}
      {creature.image && (
        <div className="mb-6">
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <Image
              src={creature.image}
              alt={creature.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {creature._count.children > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sub-Species</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {creature._count.children}
              </dd>
            </div>
          )}

          {creature._count.locations > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Locations</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {creature._count.locations}
              </dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {creature.isExtinct ? 'Extinct' : creature.isDead ? 'Dead' : 'Alive'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {creature.createdBy.name}
            </dd>
          </div>
        </dl>
        </CardContent>
      </Card>

      {/* Parent */}
      {creature.parent && (
        <Card>
          <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Parent Species</h2>
          <Link
            href={`/creatures/${creature.parent.id}`}
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {creature.parent.name}
          </Link>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {creature.entry && (
        <Card>
          <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h2>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: creature.entry }}
          />
          </CardContent>
        </Card>
      )}

      {/* Locations */}
      {creature.locations.length > 0 && (
        <Card>
          <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Locations ({creature.locations.length})
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {creature.locations.map((cl) => (
              <li key={cl.id} className="py-3">
                <Link
                  href={`/locations/${cl.location.id}`}
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  📍 {cl.location.name}
                </Link>
              </li>
            ))}
          </ul>
          </CardContent>
        </Card>
      )}

      {/* Children */}
      {creature.children.length > 0 && (
        <Card>
          <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Sub-Species ({creature.children.length})
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {creature.children.map((child) => (
              <li key={child.id} className="py-3">
                <Link
                  href={`/creatures/${child.id}`}
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
          </CardContent>
        </Card>
      )}

      {/* Abilities */}
      <Card>
        <CardContent className="pt-6">
        <EntityAbilities
          entityId={creature.id}
          entityType="creature"
          campaignId={creature.campaignId}
          canEdit={true}
        />
        </CardContent>
      </Card>

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href={`/creatures?campaignId=${creature.campaignId}`}
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to Creatures
        </Link>
      </div>
    </div>
  );
}

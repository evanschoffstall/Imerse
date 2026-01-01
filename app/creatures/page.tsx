import { auth } from '@/auth';
import CreatureList from '@/components/creatures/CreatureList';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

interface CreaturesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CreaturesPage({ searchParams }: CreaturesPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const campaignId = searchParams.campaignId as string;

  if (!campaignId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Campaign ID required</p>
      </div>
    );
  }

  // Fetch creatures
  const creatures = await prisma.creature.findMany({
    where: {
      campaignId,
    },
    include: {
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
      _count: {
        select: {
          children: true,
          locations: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Creatures</h1>
            {campaign && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Campaign: {campaign.name}
              </p>
            )}
          </div>
          <Link
            href={`/creatures/create?campaignId=${campaignId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Creature
          </Link>
        </div>
      </div>

      <Suspense fallback={<div>Loading creatures...</div>}>
        <CreatureList creatures={creatures} campaignId={campaignId} />
      </Suspense>
    </div>
  );
}

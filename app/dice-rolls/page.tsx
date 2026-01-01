import { authOptions } from '@/auth';
import DiceRollList from '@/components/dice-rolls/DiceRollList';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function DiceRollsPage({
  searchParams,
}: {
  searchParams: { campaignId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const { campaignId } = searchParams;
  if (!campaignId) {
    redirect('/dashboard');
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    redirect('/dashboard');
  }

  const diceRolls = await prisma.diceRoll.findMany({
    where: { campaignId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      character: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          results: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dice Rolls</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Campaign: {campaign.name}
          </p>
        </div>
        <Link
          href={`/dice-rolls/create?campaignId=${campaignId}`}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Dice Roll
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DiceRollList diceRolls={diceRolls} campaignId={campaignId} />
      </Suspense>
    </div>
  );
}

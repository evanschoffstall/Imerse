import { auth } from '@/auth';
import CreatureList from '@/components/creatures/CreatureList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';
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
        <Alert variant="destructive">
          <AlertDescription>Campaign ID required</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch creatures
  const creatures = await prisma.creature.findMany({
    where: {
      campaignId,
    },
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
            <h1 className="text-3xl font-bold">Creatures</h1>
            {campaign && (
              <p className="mt-1 text-sm text-muted-foreground">
                Campaign: {campaign.name}
              </p>
            )}
          </div>
          <Button asChild>
            <Link href={`/creatures/create?campaignId=${campaignId}`}>
              Create Creature
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Loading creatures...</div>}>
        <CreatureList creatures={creatures} campaignId={campaignId} />
      </Suspense>
    </div>
  );
}

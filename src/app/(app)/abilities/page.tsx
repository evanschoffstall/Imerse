import { auth } from '@/auth';
import AbilityList from '@/components/abilities/AbilityList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

interface AbilitiesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AbilitiesPage({ searchParams }: AbilitiesPageProps) {
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

  // Fetch abilities
  const abilities = await prisma.ability.findMany({
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
          entityAbilities: true,
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
            <h1 className="text-3xl font-bold">Abilities</h1>
            {campaign && (
              <p className="mt-1 text-sm text-muted-foreground">
                Campaign: {campaign.name}
              </p>
            )}
          </div>
          <Button asChild>
            <Link href={`/abilities/create?campaignId=${campaignId}`}>
              Create Ability
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Loading abilities...</div>}>
        <AbilityList abilities={abilities} campaignId={campaignId} />
      </Suspense>
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreatureWithRelations } from '@/types/creature';
import Image from 'next/image';
import Link from 'next/link';

interface CreatureListProps {
  creatures: CreatureWithRelations[];
  campaignId: string;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export default function CreatureList({
  creatures,
  campaignId,
  showActions = true,
  onDelete,
}: CreatureListProps) {
  if (creatures.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-muted-foreground">No creatures found.</p>
        <Button asChild className="mt-4">
          <Link href={`/creatures/create?campaignId=${campaignId}`}>
            Create Creature
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y">
        {creatures.map((creature) => (
          <li key={creature.id}>
            <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-accent/50">
              {/* Image */}
              {creature.image && (
                <div className="shrink-0 mr-4">
                  <div className="relative h-16 w-16">
                    <Image
                      src={creature.image}
                      alt={creature.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/creatures/${creature.id}`}
                      className="text-lg font-medium text-primary hover:underline truncate"
                    >
                      {creature.name}
                    </Link>

                    {creature.type && (
                      <Badge variant="secondary">
                        {creature.type}
                      </Badge>
                    )}

                    {creature.isExtinct && (
                      <Badge variant="destructive">
                        💀 Extinct
                      </Badge>
                    )}

                    {creature.isDead && (
                      <Badge variant="outline">
                        ⚰️ Dead
                      </Badge>
                    )}

                    {creature.isPrivate && (
                      <Badge variant="outline">
                        🔒 Private
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    {creature.parent && (
                      <span>
                        📁 Parent: {creature.parent.name}
                      </span>
                    )}

                    {creature._count && creature._count.children > 0 && (
                      <span>
                        👥 {creature._count.children} {creature._count.children === 1 ? 'child' : 'children'}
                      </span>
                    )}

                    {creature._count && creature._count.locations > 0 && (
                      <span>
                        📍 {creature._count.locations} {creature._count.locations === 1 ? 'location' : 'locations'}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    Created by {creature.createdBy.name}
                  </div>
                </div>
              </div>

              {showActions && (
                <div className="ml-5 shrink-0 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/creatures/${creature.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete creature "${creature.name}"?`)) {
                          onDelete(creature.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

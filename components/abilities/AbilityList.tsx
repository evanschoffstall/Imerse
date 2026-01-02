'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      <Card className="text-center py-12">
        <p className="text-muted-foreground">No abilities found.</p>
        <Button asChild className="mt-4">
          <Link href={`/abilities/create?campaignId=${campaignId}`}>
            Create Ability
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y">
        {abilities.map((ability) => (
          <li key={ability.id}>
            <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-accent/50">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/abilities/${ability.id}`}
                      className="text-lg font-medium text-primary hover:underline truncate"
                    >
                      {ability.name}
                    </Link>

                    {ability.type && (
                      <Badge variant="secondary">
                        {ability.type}
                      </Badge>
                    )}

                    {ability.isPrivate && (
                      <Badge variant="outline">
                        🔒 Private
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
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

                  <div className="mt-1 text-xs text-muted-foreground">
                    Created by {ability.createdBy.name}
                  </div>
                </div>
              </div>

              {showActions && (
                <div className="ml-5 shrink-0 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/abilities/${ability.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete ability "${ability.name}"?`)) {
                          onDelete(ability.id);
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

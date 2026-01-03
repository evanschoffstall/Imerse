'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DiceRollResultWithRelations, getRollDetails } from '@/types/dice-roll';

interface DiceRollResultsProps {
  results: DiceRollResultWithRelations[];
  onDelete?: (id: string) => void;
}

export default function DiceRollResults({ results, onDelete }: DiceRollResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-muted-foreground">
          No rolls yet. Click "Roll" to execute this dice roll.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => {
        const rollDetails = getRollDetails(result.results);

        return (
          <Card
            key={result.id}
            className="p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-3xl font-bold text-primary">
                    {rollDetails.total}
                  </div>
                  {result.isPrivate && (
                    <Badge variant="outline">
                      Private
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-mono">
                    {rollDetails.expression}
                    {rollDetails.substituted !== rollDetails.expression && (
                      <span className="text-muted-foreground">
                        {' '}→ {rollDetails.substituted}
                      </span>
                    )}
                  </div>

                  {rollDetails.breakdown && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {rollDetails.breakdown}
                    </div>
                  )}

                  {rollDetails.rolls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rollDetails.rolls.map((roll, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                        >
                          <span className="text-muted-foreground mr-1">
                            {roll.type}:
                          </span>
                          <span className="font-bold">
                            {roll.value}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center text-xs text-muted-foreground space-x-3">
                  <div>by {result.createdBy.name}</div>
                  <div>
                    {new Date(result.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {onDelete && (
                <Button
                  onClick={() => onDelete(result.id)}
                  variant="ghost"
                  size="sm"
                  className="ml-4"
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
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

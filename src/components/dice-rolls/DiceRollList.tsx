'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DiceRollWithRelations } from '@/types/dice-roll';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface DiceRollListProps {
  diceRolls: DiceRollWithRelations[];
  campaignId: string;
  onDelete?: (id: string) => void;
  onRoll?: (id: string) => void;
}

export default function DiceRollList({ diceRolls, campaignId, onDelete, onRoll }: DiceRollListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    try {
      await onDelete(id);
      toast.success('Dice roll deleted');
    } catch (error) {
      toast.error('Failed to delete dice roll');
    } finally {
      setDeleteId(null);
    }
  };

  const handleRoll = async (id: string) => {
    if (!onRoll) return;

    try {
      await onRoll(id);
      toast.success('Roll executed!');
    } catch (error) {
      toast.error('Failed to execute roll');
    }
  };

  if (diceRolls.length === 0) {
    return (
      <Card className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium">No dice rolls</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating a new dice roll.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href={`/dice-rolls/create?campaignId=${campaignId}`}>
              Create Dice Roll
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {diceRolls.map((diceRoll) => (
        <Card key={diceRoll.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/dice-rolls/${diceRoll.id}`}
                  className="text-lg font-medium hover:underline"
                >
                  {diceRoll.name}
                </Link>
                {diceRoll.isPrivate && (
                  <Badge variant="outline">Private</Badge>
                )}
                {diceRoll.system && (
                  <Badge variant="secondary">{diceRoll.system}</Badge>
                )}
              </div>

              <div className="mt-2">
                <p className="text-sm text-muted-foreground font-mono">
                  {diceRoll.parameters}
                </p>
              </div>

              <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                {diceRoll.character && (
                  <div className="flex items-center">
                    <span className="mr-1">🎭</span>
                    <Link
                      href={`/characters/${diceRoll.character.id}`}
                      className="hover:underline"
                    >
                      {diceRoll.character.name}
                    </Link>
                  </div>
                )}
                <div>
                  {diceRoll._count?.results || 0} roll{diceRoll._count?.results !== 1 ? 's' : ''}
                </div>
                <div>by {diceRoll.createdBy.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {onRoll && (
                <Button
                  onClick={() => handleRoll(diceRoll.id)}
                  variant="default"
                  size="sm"
                >
                  🎲 Roll
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href={`/dice-rolls/${diceRoll.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(diceRoll.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dice Roll?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the dice roll and all its roll history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

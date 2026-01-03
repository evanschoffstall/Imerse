'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Character } from '@/types/character';
import { DICE_SYSTEMS, DiceRollFormData, parseDiceExpression } from '@/types/dice-roll';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface DiceRollFormProps {
  diceRoll?: any;
  campaignId: string;
  characters?: Character[];
  onSubmit: (data: DiceRollFormData) => Promise<void>;
  onCancel: () => void;
}

const diceRollSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  system: z.string().optional(),
  parameters: z.string().min(1, 'Dice expression is required'),
  characterId: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

export default function DiceRollForm({
  diceRoll,
  campaignId,
  characters = [],
  onSubmit,
  onCancel,
}: DiceRollFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expressionError, setExpressionError] = useState('');

  const form = useForm<DiceRollFormData>({
    resolver: zodResolver(diceRollSchema),
    defaultValues: diceRoll
      ? {
        name: diceRoll.name,
        system: diceRoll.system || '',
        parameters: diceRoll.parameters,
        characterId: diceRoll.characterId || '',
        isPrivate: diceRoll.isPrivate,
      }
      : {
        name: '',
        system: 'd20',
        parameters: '',
        characterId: '',
        isPrivate: false,
      },
  });

  // Validate expression as user types
  const validateExpression = (value: string) => {
    if (!value) {
      setExpressionError('');
      return;
    }

    const result = parseDiceExpression(value);
    if (!result.valid) {
      setExpressionError(result.error || 'Invalid expression');
    } else {
      setExpressionError('');
    }
  };

  const onFormSubmit = async (data: DiceRollFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Attack Roll, Saving Throw, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="system"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {DICE_SYSTEMS.map((system) => (
                    <SelectItem key={system} value={system}>
                      {system}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parameters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dice Expression *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="font-mono"
                  placeholder="1d20+3, 2d6+{character.strength}, etc."
                  onChange={(e) => {
                    field.onChange(e);
                    validateExpression(e.target.value);
                  }}
                />
              </FormControl>
              {expressionError && (
                <p className="text-sm text-yellow-600">{expressionError}</p>
              )}
              <FormDescription>
                Examples: 1d20+5, 3d6, 2d10+{'{character.strength}'}, 4d6-2
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {characters.length > 0 && (
          <FormField
            control={form.control}
            name="characterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Character (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No character" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No character</SelectItem>
                    {characters.map((character) => (
                      <SelectItem key={character.id} value={character.id}>
                        {character.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Link to a character to use their attributes in expressions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Private (hidden from players)</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !!expressionError}
          >
            {isSubmitting ? 'Saving...' : diceRoll ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

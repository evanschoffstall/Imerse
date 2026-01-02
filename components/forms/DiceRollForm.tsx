'use client';

import { Character } from '@/types/character';
import { DICE_SYSTEMS, DiceRollFormData, parseDiceExpression } from '@/types/dice-roll';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface DiceRollFormProps {
  diceRoll?: any;
  campaignId: string;
  characters?: Character[];
  onSubmit: (data: DiceRollFormData) => Promise<void>;
  onCancel: () => void;
}

export default function DiceRollForm({
  diceRoll,
  campaignId,
  characters = [],
  onSubmit,
  onCancel,
}: DiceRollFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expressionError, setExpressionError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DiceRollFormData>({
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

  const parameters = watch('parameters');

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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Name *
        </label>
        <input
          id="name"
          type="text"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
          placeholder="Attack Roll, Saving Throw, etc."
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="system" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          System
        </label>
        <select
          id="system"
          {...register('system')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
        >
          <option value="">None</option>
          {DICE_SYSTEMS.map((system) => (
            <option key={system} value={system}>
              {system}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="parameters" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Dice Expression *
        </label>
        <input
          id="parameters"
          type="text"
          {...register('parameters', {
            required: 'Dice expression is required',
            onChange: (e) => validateExpression(e.target.value),
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm font-mono"
          placeholder="1d20+3, 2d6+{character.strength}, etc."
        />
        {errors.parameters && (
          <p className="mt-1 text-sm text-red-600">{errors.parameters.message}</p>
        )}
        {expressionError && (
          <p className="mt-1 text-sm text-yellow-600">{expressionError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Examples: 1d20+5, 3d6, 2d10+{'{character.strength}'}, 4d6-2
        </p>
      </div>

      {characters.length > 0 && (
        <div>
          <label htmlFor="characterId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Character (Optional)
          </label>
          <select
            id="characterId"
            {...register('characterId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="">No character</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Link to a character to use their attributes in expressions
          </p>
        </div>
      )}

      <div className="flex items-center">
        <input
          id="isPrivate"
          type="checkbox"
          {...register('isPrivate')}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          Private (hidden from players)
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !!expressionError}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : diceRoll ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

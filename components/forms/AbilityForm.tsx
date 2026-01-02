'use client';

import RichTextEditor from '@/components/editor/RichTextEditor';
import { Ability, ABILITY_TYPES } from '@/types/ability';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const abilitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  entry: z.string().optional(),
  charges: z.number().int().positive().optional().nullable(),
  type: z.string().optional().nullable(),
  isPrivate: z.boolean().optional(),
  parentId: z.string().optional().nullable(),
});

type AbilityFormData = z.infer<typeof abilitySchema>;

interface AbilityFormProps {
  ability?: Ability;
  campaignId: string;
  parentAbilities?: Ability[];
  onSubmit: (data: AbilityFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function AbilityForm({
  ability,
  campaignId,
  parentAbilities = [],
  onSubmit,
  onCancel,
}: AbilityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AbilityFormData>({
    resolver: zodResolver(abilitySchema),
    defaultValues: {
      name: ability?.name || '',
      entry: ability?.entry || '',
      charges: ability?.charges,
      type: ability?.type || '',
      isPrivate: ability?.isPrivate || false,
      parentId: ability?.parentId || null,
    },
  });

  const entry = watch('entry');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Name *
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type
        </label>
        <select
          id="type"
          {...register('type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
        >
          <option value="">-- Select Type --</option>
          {ABILITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Charges */}
      <div>
        <label htmlFor="charges" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Charges / Uses
        </label>
        <input
          type="number"
          id="charges"
          {...register('charges', { valueAsNumber: true })}
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
          placeholder="Optional"
        />
        {errors.charges && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.charges.message}</p>
        )}
      </div>

      {/* Parent Ability */}
      {parentAbilities.length > 0 && (
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Parent Ability
          </label>
          <select
            id="parentId"
            {...register('parentId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="">-- None (Top Level) --</option>
            {parentAbilities.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <RichTextEditor
          content={entry || ''}
          onChange={(content: string) => setValue('entry', content)}
        />
      </div>

      {/* Privacy */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPrivate"
          {...register('isPrivate')}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
        />
        <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Private (only visible to you)
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : ability ? 'Update Ability' : 'Create Ability'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

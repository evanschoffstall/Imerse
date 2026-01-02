'use client';

import RichTextEditor from '@/components/editor/RichTextEditor';
import ImageUpload from '@/components/ui/ImageUpload';
import { Creature, CREATURE_TYPES } from '@/types/creature';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const creatureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  entry: z.string().optional(),
  type: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isExtinct: z.boolean().optional(),
  isDead: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  parentId: z.string().optional().nullable(),
});

type CreatureFormData = z.infer<typeof creatureSchema>;

interface CreatureFormProps {
  creature?: Creature;
  campaignId: string;
  parentCreatures?: Creature[];
  onSubmit: (data: CreatureFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function CreatureForm({
  creature,
  campaignId,
  parentCreatures = [],
  onSubmit,
  onCancel,
}: CreatureFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreatureFormData>({
    resolver: zodResolver(creatureSchema),
    defaultValues: {
      name: creature?.name || '',
      entry: creature?.entry || '',
      type: creature?.type || '',
      image: creature?.image || '',
      isExtinct: creature?.isExtinct || false,
      isDead: creature?.isDead || false,
      isPrivate: creature?.isPrivate || false,
      parentId: creature?.parentId || null,
    },
  });

  const entry = watch('entry');
  const image = watch('image');

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
          {CREATURE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Image
        </label>
        <ImageUpload
          currentImage={image || undefined}
          onImageUpload={(url: string) => setValue('image', url)}
        />
      </div>

      {/* Parent Creature */}
      {parentCreatures.length > 0 && (
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Parent Creature
          </label>
          <select
            id="parentId"
            {...register('parentId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="">-- None (Top Level) --</option>
            {parentCreatures.map((parent) => (
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

      {/* Status Checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isExtinct"
            {...register('isExtinct')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
          />
          <label htmlFor="isExtinct" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Extinct (species no longer exists)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDead"
            {...register('isDead')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
          />
          <label htmlFor="isDead" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Dead (this individual is deceased)
          </label>
        </div>

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
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : creature ? 'Update Creature' : 'Create Creature'}
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

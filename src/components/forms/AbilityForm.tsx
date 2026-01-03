'use client';

import RichTextEditor from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const form = useForm<AbilityFormData>({
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Select Type --" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ABILITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
          name="charges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Charges / Uses</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Optional"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {parentAbilities.length > 0 && (
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Ability</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="-- None (Top Level) --" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentAbilities.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="entry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <FormLabel>Private (only visible to you)</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : ability ? 'Update Ability' : 'Create Ability'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

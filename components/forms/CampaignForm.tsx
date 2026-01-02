'use client';

import RichTextEditor from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/FormField';
import ImageUpload from '@/components/ui/ImageUpload';
import { Input } from '@/components/ui/input';
import { CampaignFormData } from '@/types/campaign';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().optional(),
  image: z.string().optional(),
});

export interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  isLoading?: boolean;
  submitText?: string;
}

export default function CampaignForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = 'Save Campaign',
}: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
    },
  });

  const description = watch('description');
  const image = watch('image');

  const handleDescriptionChange = (content: string) => {
    setValue('description', content, { shouldValidate: true });
  };

  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Campaign Name"
        required
        error={errors.name?.message}
        htmlFor="name"
      >
        <Input
          id="name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Enter campaign name"
          disabled={isLoading}
        />
      </FormField>

      <FormField
        label="Description"
        error={errors.description?.message}
        htmlFor="description"
      >
        <RichTextEditor
          content={description || ''}
          onChange={handleDescriptionChange}
          placeholder="Describe your campaign..."
          disabled={isLoading}
        />
      </FormField>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="campaigns"
        label="Campaign Image"
      />

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}

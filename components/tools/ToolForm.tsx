'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToolCreateSchema, ToolCreateInput } from '@/lib/schemas/tool';
import { createTool, updateTool } from '@/lib/actions/tools';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Database } from '@/lib/supabase/database.types';

type Tool = Database['public']['Tables']['tools']['Row'];

interface ToolFormProps {
  mode: 'create' | 'edit';
  tool?: Tool;
}

export default function ToolForm({ mode, tool }: ToolFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    tool?.photo_url || null
  );
  const [useAI, setUseAI] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ToolCreateInput>({
    resolver: zodResolver(ToolCreateSchema),
    defaultValues: {
      name: tool?.name || '',
      description: tool?.description || '',
    },
  });

  const photoFile = watch('photo') as FileList | undefined;

  // Update photo preview when file changes
  useEffect(() => {
    if (photoFile && photoFile.length > 0) {
      const file = photoFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [photoFile]);

  const handleAIIdentify = async () => {
    if (!photoFile || !photoFile[0]) {
      setAiMessage('Please upload a photo first');
      return;
    }

    setIsIdentifying(true);
    setAiMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', photoFile[0]);

      const response = await fetch('/api/ai/identify-tool', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setAiMessage(data.error || 'Failed to identify tool');
        return;
      }

      // Populate form fields with AI-identified data
      const toolName = data.brand && data.model
        ? `${data.brand} ${data.name} ${data.model}`
        : data.brand
        ? `${data.brand} ${data.name}`
        : data.name;

      setValue('name', toolName);
      setValue('description', data.description || '');
      setAiMessage('Tool identified! Please review and edit the details as needed.');
    } catch (err) {
      console.error('AI identification error:', err);
      setAiMessage('Failed to identify tool. Please try again or enter details manually.');
    } finally {
      setIsIdentifying(false);
    }
  };

  const onSubmit = async (data: ToolCreateInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) {
        formData.append('description', data.description);
      }
      if (photoFile && photoFile[0]) {
        formData.append('photo', photoFile[0]);
      }

      if (mode === 'create') {
        const result = await createTool(formData);
        if (result.error) {
          setError(result.error);
        } else if (result.toolId) {
          router.push(`/tools/${result.toolId}`);
        }
      } else if (mode === 'edit' && tool) {
        formData.append('toolId', tool.id);
        const result = await updateTool(formData);
        if (result.error) {
          setError(result.error);
        } else {
          router.push(`/tools/${tool.id}`);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Tool Name *
        </label>
        <Input
          id="name"
          type="text"
          {...register('name')}
          placeholder="e.g., Pressure Washer"
          error={errors.name?.message}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Details about the tool, condition, special features..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
          Photo (optional)
        </label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          {...register('photo')}
          className="w-full"
        />
        {errors.photo && (
          <p className="mt-1 text-sm text-red-600">{errors.photo.message as string}</p>
        )}

        {photoPreview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={photoPreview}
              alt="Tool preview"
              className="max-w-md w-full h-auto rounded-lg border border-gray-300"
            />
          </div>
        )}

        {mode === 'create' && photoFile && photoFile[0] && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2 mb-3">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="useAI" className="text-sm text-gray-700">
                <strong>Use AI to identify this tool</strong>
                <p className="text-gray-600 mt-1">
                  Make sure the model number is visible in the photo for best results.
                </p>
              </label>
            </div>

            {useAI && (
              <Button
                type="button"
                onClick={handleAIIdentify}
                disabled={isIdentifying || isSubmitting}
                variant="secondary"
                className="w-full"
              >
                {isIdentifying ? 'Identifying...' : 'Identify Tool with AI'}
              </Button>
            )}

            {aiMessage && (
              <div className={`mt-3 p-3 rounded ${
                aiMessage.includes('identified')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
              }`}>
                {aiMessage}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Tool' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

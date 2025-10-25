'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToolCreateSchema, ToolCreateInput, CATEGORIES } from '@/lib/schemas/tool';
import { createTool, updateTool } from '@/lib/actions/tools';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Upload, X, Loader2, Sparkles } from 'lucide-react';
import type { Database } from '@/lib/supabase/database.types';

type Tool = Database['public']['Tables']['tools']['Row'];

interface ToolFormProps {
  mode: 'create' | 'edit';
  tool?: Tool;
}

interface AIToolData {
  name: string;
  description: string;
  category: string;
  model?: string | null;
}

export default function ToolForm({ mode, tool }: ToolFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    tool?.photo_url || null
  );
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [aiResult, setAiResult] = useState<AIToolData | null>(null);

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
      category: (tool?.category as any) || 'Power Tools',
      model: tool?.model || '',
    },
  });

  const photoFile = watch('photo') as FileList | undefined;
  const category = watch('category');

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
      setError('Please upload a photo first');
      return;
    }

    setIsIdentifying(true);
    setAiResult(null);
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
        setError(data.error || 'Failed to identify tool');
        return;
      }

      setAiResult(data);
      setValue('name', data.name || '');
      setValue('description', data.description || '');
      setValue('category', data.category || 'Other');
      setValue('model', data.model || '');
    } catch (err) {
      console.error('AI identification error:', err);
      setError('Failed to identify tool. Please try again or enter details manually.');
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleClearImage = () => {
    setPhotoPreview(null);
    setAiResult(null);
    const input = document.getElementById('photo-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const onSubmit = async (data: ToolCreateInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.model) {
        formData.append('model', data.model);
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Add a Tool</h1>
          <p className="text-gray-600">
            Share your tool with the Abbington community
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              {photoPreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Tool preview"
                      className="max-h-48 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {mode === 'create' && (
                    <Button
                      type="button"
                      onClick={handleAIIdentify}
                      disabled={isIdentifying}
                      className="w-full"
                    >
                      {isIdentifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Scan with AI
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a photo to use AI-powered tool identification
                  </p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    {...register('photo')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </>
              )}
            </div>
            {errors.photo && (
              <p className="mt-1 text-sm text-red-600">{errors.photo.message as string}</p>
            )}
          </div>

          {/* AI Result Alert */}
          {aiResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">AI Identified This Tool</h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>
                      <strong>Tool:</strong> {aiResult.name}
                    </div>
                    <div>
                      <strong>Description:</strong> {aiResult.description}
                    </div>
                    <div>
                      <strong>Category:</strong> {aiResult.category}
                    </div>
                    {aiResult.model && (
                      <div>
                        <strong>Model:</strong> {aiResult.model}
                      </div>
                    )}
                    <p className="text-xs text-blue-600 mt-2">
                      The form has been pre-filled. Review and adjust as needed before submitting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tool Name *
              </label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                placeholder="e.g., Cordless Drill"
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Model Number
              </label>
              <Input
                id="model"
                type="text"
                {...register('model')}
                placeholder="e.g., DCD771C2"
                error={errors.model?.message}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <Select
                value={category}
                onValueChange={(value) => setValue('category', value as any)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your tool and any special notes..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : 'Add Tool to Share'}
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
      </div>
    </div>
  );
}

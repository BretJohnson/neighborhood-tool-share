'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseUserDetailsSchema, type BaseUserDetails } from '@/lib/schemas/user';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Database } from '@/lib/supabase/database.types';

type User = Database['public']['Tables']['users']['Row'];

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BaseUserDetails>({
    resolver: zodResolver(BaseUserDetailsSchema),
    defaultValues: {
      full_name: user.full_name,
      address: user.address,
      phone_number: user.phone_number,
    },
  });

  const onSubmit = async (data: BaseUserDetails) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProfile(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/tools');
        }, 2000);
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

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Profile updated successfully! Redirecting...
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <Input
          id="full_name"
          type="text"
          {...register('full_name')}
          placeholder="John Smith"
          error={errors.full_name?.message}
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <Input
          id="address"
          type="text"
          {...register('address')}
          placeholder="123 Oak Street, Abbington"
          error={errors.address?.message}
        />
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <Input
          id="phone_number"
          type="tel"
          {...register('phone_number')}
          placeholder="(555) 123-4567"
          error={errors.phone_number?.message}
        />
        <p className="mt-1 text-sm text-gray-500">
          US phone number format
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
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

'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { BaseUserDetailsSchema, type BaseUserDetails } from '@/lib/schemas/user';

export async function updateProfile(data: BaseUserDetails) {
  const supabase = createServerClient();

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: 'You must be logged in to update your profile' };
  }

  // Validate input
  const validation = BaseUserDetailsSchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.errors[0];
    return { error: firstError.message };
  }

  const validatedData = validation.data;

  try {
    // Update user profile
    const { error } = await supabase
      .from('users')
      .update({
        full_name: validatedData.full_name.trim(),
        address: validatedData.address.trim(),
        phone_number: validatedData.phone_number.trim(),
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return { error: 'Failed to update profile. Please try again.' };
    }

    revalidatePath('/profile/edit');
    revalidatePath('/tools');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

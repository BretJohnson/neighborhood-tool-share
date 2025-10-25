'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';

export async function createTool(formData: FormData) {
  const supabase = createServerClient();

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: 'You must be logged in to add a tool' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const category = formData.get('category') as string;
  const model = formData.get('model') as string | null;
  const photoFile = formData.get('photo') as File | null;

  if (!name || name.trim().length === 0) {
    return { error: 'Tool name is required' };
  }

  if (name.length > 255) {
    return { error: 'Tool name must be 255 characters or less' };
  }

  if (!category) {
    return { error: 'Category is required' };
  }

  if (description && description.length > 5000) {
    return { error: 'Description must be 5000 characters or less' };
  }

  if (model && model.length > 100) {
    return { error: 'Model number must be 100 characters or less' };
  }

  try {
    // Upload photo first if provided
    let photoUrl: string | null = null;
    if (photoFile && photoFile.size > 0) {
      const uploadResult = await uploadToolPhoto(session.user.id, photoFile);
      if (uploadResult.error) {
        return { error: uploadResult.error };
      }
      photoUrl = uploadResult.url || null;
    }

    // Create tool record
    const { data: tool, error } = await supabase
      .from('tools')
      .insert({
        owner_id: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        category,
        model: model?.trim() || null,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tool:', error);
      return { error: 'Failed to create tool. Please try again.' };
    }

    revalidatePath('/tools');
    return { toolId: tool.id };
  } catch (error) {
    console.error('Unexpected error creating tool:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateTool(formData: FormData) {
  const supabase = createServerClient();

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: 'You must be logged in to update a tool' };
  }

  const toolId = formData.get('toolId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const category = formData.get('category') as string;
  const model = formData.get('model') as string | null;
  const photoFile = formData.get('photo') as File | null;

  if (!toolId) {
    return { error: 'Tool ID is required' };
  }

  if (!name || name.trim().length === 0) {
    return { error: 'Tool name is required' };
  }

  if (name.length > 255) {
    return { error: 'Tool name must be 255 characters or less' };
  }

  if (!category) {
    return { error: 'Category is required' };
  }

  if (description && description.length > 5000) {
    return { error: 'Description must be 5000 characters or less' };
  }

  if (model && model.length > 100) {
    return { error: 'Model number must be 100 characters or less' };
  }

  try {
    // Verify ownership
    const { data: existingTool, error: fetchError } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .eq('owner_id', session.user.id)
      .single();

    if (fetchError || !existingTool) {
      return { error: 'Tool not found or you do not have permission to edit it' };
    }

    // Upload new photo if provided
    let photoUrl = existingTool.photo_url;
    if (photoFile && photoFile.size > 0) {
      // Delete old photo if exists
      if (existingTool.photo_url) {
        await deleteToolPhoto(existingTool.photo_url);
      }

      const uploadResult = await uploadToolPhoto(session.user.id, photoFile);
      if (uploadResult.error) {
        return { error: uploadResult.error };
      }
      photoUrl = uploadResult.url || null;
    }

    // Update tool record
    const { error } = await supabase
      .from('tools')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        category,
        model: model?.trim() || null,
        photo_url: photoUrl,
      })
      .eq('id', toolId)
      .eq('owner_id', session.user.id);

    if (error) {
      console.error('Error updating tool:', error);
      return { error: 'Failed to update tool. Please try again.' };
    }

    revalidatePath('/tools');
    revalidatePath(`/tools/${toolId}`);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating tool:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteTool(toolId: string) {
  const supabase = createServerClient();

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: 'You must be logged in to delete a tool' };
  }

  try {
    // Fetch tool to get photo URL and verify ownership
    const { data: tool, error: fetchError } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .eq('owner_id', session.user.id)
      .single();

    if (fetchError || !tool) {
      return { error: 'Tool not found or you do not have permission to delete it' };
    }

    // Delete photo from storage if exists
    if (tool.photo_url) {
      await deleteToolPhoto(tool.photo_url);
    }

    // Delete tool record
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', toolId)
      .eq('owner_id', session.user.id);

    if (error) {
      console.error('Error deleting tool:', error);
      return { error: 'Failed to delete tool. Please try again.' };
    }

    revalidatePath('/tools');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting tool:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

async function uploadToolPhoto(userId: string, file: File): Promise<{ url?: string; error?: string }> {
  const supabase = createServerClient();

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { error: 'Image must be 5MB or smaller' };
  }

  try {
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('tools')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return { error: 'Failed to upload photo. Please try again.' };
    }

    // Get public URL
    const { data } = supabase.storage
      .from('tools')
      .getPublicUrl(fileName);

    return { url: data.publicUrl };
  } catch (error) {
    console.error('Unexpected error uploading photo:', error);
    return { error: 'An unexpected error occurred while uploading the photo.' };
  }
}

async function deleteToolPhoto(photoUrl: string): Promise<void> {
  const supabase = createServerClient();

  try {
    // Extract file path from URL
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(pathParts.indexOf('tools') + 1).join('/');

    await supabase.storage
      .from('tools')
      .remove([fileName]);
  } catch (error) {
    console.error('Error deleting photo:', error);
    // Don't throw - photo deletion is not critical
  }
}

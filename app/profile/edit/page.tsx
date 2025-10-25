import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function EditProfilePage() {
  const supabase = createServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  // Fetch user profile
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !user) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <p className="text-gray-600 mb-8">
        Update your contact information. This information will be visible to other neighborhood
        members when you share tools.
      </p>
      <ProfileForm user={user} />
    </div>
  );
}

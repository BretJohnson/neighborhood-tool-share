import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import ToolForm from '@/components/tools/ToolForm';

export const metadata: Metadata = {
  title: "Add a Tool",
  description: "Share your tools with the Abbington neighborhood",
};

export default async function AddToolPage() {
  const supabase = createServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add a New Tool</h1>
      <p className="text-gray-600 mb-8">
        Share your tools with the Abbington neighborhood. Fill out the details below.
      </p>
      <ToolForm mode="create" />
    </div>
  );
}

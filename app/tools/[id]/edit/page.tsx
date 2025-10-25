import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import ToolForm from '@/components/tools/ToolForm';

interface EditToolPageProps {
  params: {
    id: string;
  };
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const supabase = createServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  // Fetch tool and verify ownership
  const { data: tool, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', session.user.id)
    .single();

  if (error || !tool) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Tool</h1>
      <ToolForm mode="edit" tool={tool} />
    </div>
  );
}

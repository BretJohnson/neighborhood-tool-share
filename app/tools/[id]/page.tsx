import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import DeleteToolButton from '@/components/tools/DeleteConfirm';

interface ToolDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const supabase = createServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  // Fetch tool with owner information
  const { data: tool, error } = await supabase
    .from('tools')
    .select(`
      *,
      owner:users(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !tool) {
    notFound();
  }

  const isOwner = tool.owner_id === session.user.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          ← Back to all tools
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {tool.photo_url && (
          <div className="w-full aspect-video relative bg-gray-100">
            <img
              src={tool.photo_url}
              alt={tool.name}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            {isOwner && (
              <div className="flex gap-2">
                <Link href={`/tools/${tool.id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
                <DeleteToolButton toolId={tool.id} toolName={tool.name} />
              </div>
            )}
          </div>

          {tool.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{tool.description}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Owner Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {tool.owner.full_name}
              </p>
              <p>
                <span className="font-medium">Address:</span> {tool.owner.address}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {tool.owner.phone_number}
              </p>
            </div>
            {!isOwner && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Contact the owner directly to borrow this tool. Remember to return it in good
                  condition as agreed in the tool share rules.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Added on {new Date(tool.created_at).toLocaleDateString()}</p>
            {tool.updated_at !== tool.created_at && (
              <p>Last updated {new Date(tool.updated_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

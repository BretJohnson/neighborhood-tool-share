'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTool } from '@/lib/actions/tools';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

interface DeleteToolButtonProps {
  toolId: string;
  toolName: string;
}

export default function DeleteToolButton({ toolId, toolName }: DeleteToolButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteTool(toolId);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/tools');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete
      </Button>

      <Dialog
        open={isOpen}
        onClose={() => !isDeleting && setIsOpen(false)}
        title="Delete Tool"
      >
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <strong>{toolName}</strong>? This action cannot be
          undone.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 justify-end">
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Tool'}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

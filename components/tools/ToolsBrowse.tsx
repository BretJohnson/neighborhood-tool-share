'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { SearchBox } from '@/components/tools/SearchBox';
import { CategoryFilter } from '@/components/tools/CategoryFilter';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { CATEGORIES } from '@/lib/schemas/tool';

type Tool = {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  owner: {
    id: string;
    full_name: string;
    address: string;
    phone_number: string;
  };
};

interface ToolsBrowseProps {
  initialTools: Tool[];
  error?: boolean;
}

export function ToolsBrowse({ initialTools, error }: ToolsBrowseProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );

  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/tools?${queryString}` : '/tools';
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, searchParams, router]);

  // Filter tools by category on client side
  const filteredTools = selectedCategory
    ? initialTools.filter(
        (tool) => (tool as any).category === selectedCategory
      )
    : initialTools;

  return (
    <div className="space-y-10">
      <Card className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
            Browse Neighborhood Tools
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Search the Abbington library to find the perfect tool for your next
            project. Reach out to the owner directly to coordinate pickup.
          </p>
        </div>

        <SearchBox />

        <CategoryFilter
          categories={CATEGORIES as unknown as string[]}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </Card>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          We couldn&apos;t load tools right now. Please refresh or try again in
          a moment.
        </div>
      ) : (
        <ToolGrid tools={filteredTools} />
      )}
    </div>
  );
}

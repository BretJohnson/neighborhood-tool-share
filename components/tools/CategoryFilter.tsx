'use client';

import { Badge } from '@/components/ui/Badge';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory?: string;
  onSelect?: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Badge
        variant={!selectedCategory ? 'default' : 'secondary'}
        className="cursor-pointer whitespace-nowrap hover:opacity-80 active:scale-95 transition-all"
        onClick={() => onSelect?.('')}
      >
        All Tools
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? 'default' : 'secondary'}
          className="cursor-pointer whitespace-nowrap hover:opacity-80 active:scale-95 transition-all"
          onClick={() => onSelect?.(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}

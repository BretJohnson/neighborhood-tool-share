import { ToolCard, type ToolCardProps } from "./ToolCard";

export interface ToolGridProps {
  tools: ToolCardProps[];
  emptyMessage?: string;
}

export function ToolGrid({
  tools,
  emptyMessage = "No tools match your search yet. Try a different keyword or ask neighbors to list their gear.",
}: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/40 px-8 py-12 text-center text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} {...tool} />
      ))}
    </div>
  );
}

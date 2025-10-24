import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils/formatting";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated = true, ...props }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-lg border border-card-border bg-card p-6 text-card-foreground",
        elevated ? "shadow-card hover:shadow-card-hover transition-shadow" : "shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

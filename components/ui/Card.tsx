import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils/formatting";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated = true, ...props }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-xl border border-border bg-white p-6 text-foreground shadow-sm",
        elevated && "shadow-card",
        className,
      )}
      {...props}
    />
  );
}

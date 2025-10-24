"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "@/lib/utils/formatting";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-muted-foreground">
      {label && <span>{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={cx(
          "w-full rounded-md border border-input bg-card px-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 active:border-primary h-11",
          error && "border-destructive focus:border-destructive focus:ring-destructive/40",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
});

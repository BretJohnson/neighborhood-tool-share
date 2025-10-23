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
    <label className="flex w-full flex-col gap-1 text-sm font-medium text-foreground/80">
      {label && <span htmlFor={inputId}>{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={cx(
          "w-full rounded-md border border-border bg-white px-3 py-2 text-base text-foreground shadow-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/40 placeholder:text-muted",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-500">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
});

"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/utils/formatting";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "sm" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand-dark",
  secondary:
    "bg-white text-brand border border-brand hover:bg-brand/10 focus-visible:ring-brand",
  ghost:
    "bg-transparent text-foreground hover:bg-foreground/10 focus-visible:ring-foreground/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="animate-pulse">Loading…</span> : children}
    </button>
  );
});

"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/utils/formatting";

type ButtonVariant = "primary" | "secondary" | "ghost" | "facebook";
type ButtonSize = "md" | "sm" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-card hover:shadow-card-hover focus-visible:ring-primary/45",
  secondary:
    "border border-secondary/50 bg-secondary text-secondary-foreground hover:bg-secondary/70 focus-visible:ring-secondary/40",
  ghost:
    "border border-transparent bg-transparent text-foreground hover:bg-foreground/10 focus-visible:ring-foreground/30",
  facebook:
    "bg-facebook text-facebook-foreground shadow-card hover:bg-facebook-hover focus-visible:ring-facebook/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(
        baseClasses,
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

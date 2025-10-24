"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils/formatting";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClassMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cx(
          "w-full rounded-lg border border-card-border bg-card p-6 text-card-foreground shadow-dialog",
          sizeClassMap[size],
        )}
      >
        <header className="mb-4">
          {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </header>
        <div className="space-y-4">{children}</div>
        {footer && (
          <footer className="mt-6 flex flex-wrap justify-end gap-3">
            {footer}
          </footer>
        )}
      </div>
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        aria-hidden="true"
        onClick={onClose}
      />
    </div>,
    document.body,
  );
}

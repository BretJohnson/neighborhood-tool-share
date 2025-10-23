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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cx(
          "w-full rounded-xl bg-white p-6 text-foreground shadow-lg",
          sizeClassMap[size],
        )}
      >
        <header className="mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </header>
        <div className="space-y-4">{children}</div>
        {footer && <footer className="mt-6 flex justify-end gap-3">{footer}</footer>}
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

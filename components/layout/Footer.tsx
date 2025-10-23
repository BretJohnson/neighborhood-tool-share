import Link from "next/link";
import { cx } from "@/lib/utils/formatting";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cx(
        "mt-auto border-t border-border bg-white text-sm text-muted",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Abbington Neighborhood Tool Share</p>
        <div className="flex items-center gap-4">
          <Link href="/quickstart" className="hover:text-brand">
            Quickstart Guide
          </Link>
          <Link href="/support" className="hover:text-brand">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}

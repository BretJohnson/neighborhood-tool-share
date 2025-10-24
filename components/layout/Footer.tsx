import Link from "next/link";
import { cx } from "@/lib/utils/formatting";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cx(
        "mt-auto border-t border-border/80 bg-card text-sm text-muted-foreground",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-wide text-muted-foreground/80">
          &copy; {new Date().getFullYear()} Abbington Neighborhood Tool Share
        </p>
        <div className="flex items-center gap-4">
          <Link href="/quickstart" className="transition-colors hover:text-foreground">
            Quickstart Guide
          </Link>
          <Link href="/support" className="transition-colors hover:text-foreground">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}

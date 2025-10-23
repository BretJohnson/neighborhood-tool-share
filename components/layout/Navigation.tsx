import Link from "next/link";
import { cx } from "@/lib/utils/formatting";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Browse Tools" },
  { href: "/tools/add", label: "Share a Tool" },
];

export interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  return (
    <header
      className={cx(
        "sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-brand">
          Abbington Tool Share
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

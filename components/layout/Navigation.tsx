import Link from "next/link";
import { cx } from "@/lib/utils/formatting";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Browse Tools" },
  { href: "/tools/add", label: "Share a Tool" },
  { href: "/profile/edit", label: "My Profile" },
];

export interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  return (
    <header
      className={cx(
        "sticky top-0 z-50 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground"
        >
          Abbington Tool Share
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

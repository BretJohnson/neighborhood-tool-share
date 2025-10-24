"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";

const DEBOUNCE_DELAY = 350;

export interface SearchBoxProps {
  placeholder?: string;
}

export function SearchBox({
  placeholder = "Search tools by name or description…",
}: SearchBoxProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initialValue = useMemo(
    () => searchParams?.get("search") ?? "",
    [searchParams],
  );

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(Array.from(searchParams?.entries() ?? []));

      const trimmed = value.trim();
      if (trimmed) {
        next.set("search", trimmed);
      } else {
        next.delete("search");
      }

      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handle);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
        <svg
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19 19-4-4m1.5-5.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
          />
        </svg>
      </span>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Search tools"
        type="search"
        className="rounded-full pl-12 pr-5 shadow-card focus:border-primary focus:ring-primary/40"
      />
    </div>
  );
}

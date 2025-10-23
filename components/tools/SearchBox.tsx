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
    <Input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      aria-label="Search tools"
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MagnifyingGlass } from "@/components/icons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LinkFilters({ tags }: { tags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeQuery = searchParams.get("q") ?? "";
  const activeTag = searchParams.get("tag") ?? "all";

  // Preserves any other params (e.g. ?folder=) already on the URL.
  function apply(next: { q?: string; tag?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Keyed by the URL query so back/forward navigation re-seeds the box
          without a state-sync effect. */}
      <SearchBox
        key={activeQuery}
        initial={activeQuery}
        onSearch={(q) => apply({ q })}
      />

      {tags.length > 0 && (
        <Select value={activeTag} onValueChange={(v) => apply({ tag: v })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

/** Debounced search input: updates the URL ~300ms after typing stops. */
function SearchBox({
  initial,
  onSearch,
}: {
  initial: string;
  onSearch: (query: string) => void;
}) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === initial) return;
    const t = setTimeout(() => onSearch(trimmed), 300);
    return () => clearTimeout(t);
    // onSearch is recreated each render but guarded by the equality check above;
    // we only want to react to the typed value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, initial]);

  return (
    <div className="relative flex-1 sm:max-w-xs">
      <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search links..."
        className="pl-9"
        aria-label="Search links"
      />
    </div>
  );
}

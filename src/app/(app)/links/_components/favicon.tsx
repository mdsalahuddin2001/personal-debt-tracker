"use client";

import { useState } from "react";
import { GlobeSimple } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Favicon for a link. Falls back to a globe glyph when the host has no favicon
 * (the icon service serves a placeholder, but a network/parse failure still
 * needs a graceful fallback). Plain <img> so we don't have to allowlist the
 * icon host in next.config.
 */
export function Favicon({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <GlobeSimple className={cn("text-muted-foreground", className)} />
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      className={cn("rounded-sm object-contain", className)}
      onError={() => setFailed(true)}
    />
  );
}

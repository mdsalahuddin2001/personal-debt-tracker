import { ArrowSquareOut, Tag } from "@/components/icons";
import type { SerializedLink, LinkFolderOption } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Favicon } from "./favicon";
import { LinkActions } from "./link-actions";

export function LinkCard({
  link,
  folders,
}: {
  link: SerializedLink;
  folders: LinkFolderOption[];
}) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-w-0 items-start gap-2.5"
        >
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
            <Favicon src={link.faviconUrl} className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1 font-medium break-words group-hover:underline">
              <span className="min-w-0">{link.title}</span>
              <ArrowSquareOut className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
            {link.host && (
              <span className="block truncate text-xs text-muted-foreground">
                {link.host}
              </span>
            )}
          </span>
        </a>
        <LinkActions link={link} folders={folders} />
      </div>

      {link.description && (
        <p className="line-clamp-3 text-sm whitespace-pre-wrap text-muted-foreground">
          {link.description}
        </p>
      )}

      {link.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {link.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 font-normal">
              <Tag className="size-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}

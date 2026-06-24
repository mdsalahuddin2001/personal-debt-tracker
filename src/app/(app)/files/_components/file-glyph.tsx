import {
  FileIcon,
  FileText,
  FilePdf,
  FileZip,
  FileImage,
  VideoCamera,
  MusicNotes,
} from "@/components/icons";

/** Render a glyph that reflects a file's MIME type. */
export function FileGlyph({
  contentType,
  className,
}: {
  contentType: string;
  className?: string;
}) {
  if (contentType.startsWith("image/"))
    return <FileImage className={className} />;
  if (contentType.startsWith("video/"))
    return <VideoCamera className={className} />;
  if (contentType.startsWith("audio/"))
    return <MusicNotes className={className} />;
  if (contentType === "application/pdf")
    return <FilePdf className={className} />;
  if (/(zip|compressed|tar|rar|7z|gzip)/.test(contentType))
    return <FileZip className={className} />;
  if (contentType.startsWith("text/"))
    return <FileText className={className} />;
  return <FileIcon className={className} />;
}

/**
 * Row thumbnail: shows the actual image for image files (served inline through
 * our redirect route, which carries the user's session cookie), and a typed
 * glyph in a tile for everything else.
 *
 * A plain <img> is used rather than next/image because the source goes through
 * an auth-guarded route that redirects to a short-lived presigned URL — the
 * image optimizer fetches server-side without the session cookie and couldn't
 * load it.
 */
export function FileThumb({
  id,
  name,
  contentType,
}: {
  id: string;
  name: string;
  contentType: string;
}) {
  if (contentType.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/files/${id}`}
        alt={name}
        loading="lazy"
        className="size-10 shrink-0 rounded-md border bg-muted object-cover"
      />
    );
  }
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
      <FileGlyph contentType={contentType} className="size-5 text-muted-foreground" />
    </div>
  );
}

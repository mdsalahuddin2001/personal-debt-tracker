import Link from "next/link";
import { notFound } from "next/navigation";
import { Folder, FolderPlus, CaretRight } from "@/components/icons";
import { getFolderContents, getFolderOptions, type Breadcrumb } from "@/lib/queries";
import { formatBytes, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileThumb } from "./_components/file-glyph";
import { UploadDialog } from "./_components/upload-dialog";
import { CreateFolderDialog } from "./_components/create-folder-dialog";
import { EntryActions } from "./_components/entry-actions";

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  const folderId = folder ?? null;

  const [contents, folderOptions] = await Promise.all([
    getFolderContents(folderId),
    getFolderOptions(),
  ]);
  if (!contents) notFound();

  const { currentFolder, breadcrumbs, folders, files } = contents;
  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">
            {currentFolder ? currentFolder.name : "Files"}
          </h1>
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <div className="flex gap-2">
          <CreateFolderDialog
            parentId={folderId}
            trigger={
              <Button variant="outline">
                <FolderPlus className="size-4" /> New folder
              </Button>
            }
          />
          <UploadDialog folderId={folderId} />
        </div>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            This folder is empty. Upload a file or create a folder to get started.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {folders.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <Link
                  href={`/files?folder=${f.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <Folder weight="fill" className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Folder · {formatDate(f.createdAt)}
                    </p>
                  </div>
                </Link>
                <EntryActions
                  kind="folder"
                  id={f.id}
                  name={f.name}
                  folders={folderOptions}
                />
              </div>
            ))}

            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FileThumb
                    id={f.id}
                    name={f.name}
                    contentType={f.contentType}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(f.size)} · {formatDate(f.createdAt)}
                    </p>
                  </div>
                </div>
                <EntryActions
                  kind="file"
                  id={f.id}
                  name={f.name}
                  contentType={f.contentType}
                  folders={folderOptions}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <Link href="/files" className="transition-colors hover:text-foreground">
        Files
      </Link>
      {items.map((item) => (
        <span key={item.id} className="flex items-center gap-1">
          <CaretRight className="size-3" />
          <Link
            href={`/files?folder=${item.id}`}
            className="transition-colors hover:text-foreground"
          >
            {item.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  UploadSimple,
  CircleNotch,
  CheckCircle,
  XCircle,
  X,
} from "@/components/icons";
import { requestUpload, confirmUpload } from "@/lib/actions/files";
import { MAX_FILE_SIZE } from "@/lib/validations";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileGlyph } from "./file-glyph";

type Status = "queued" | "uploading" | "done" | "error";

type Item = {
  id: string;
  file: File;
  status: Status;
  percent: number;
  error?: string;
};

export function UploadDialog({ folderId }: { folderId: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const patchItem = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  function addFiles(fileList: FileList | null) {
    const incoming = Array.from(fileList ?? []);
    const valid: Item[] = [];
    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is larger than 100 MB`);
        continue;
      }
      idRef.current += 1;
      valid.push({
        id: `f${idRef.current}`,
        file,
        status: "queued",
        percent: 0,
      });
    }
    if (valid.length > 0) setItems((prev) => [...prev, ...valid]);
  }

  async function uploadItem(item: Item): Promise<boolean> {
    const { file } = item;
    const contentType = file.type || "application/octet-stream";
    const meta = { name: file.name, size: file.size, contentType };

    patchItem(item.id, { status: "uploading", percent: 0, error: undefined });

    const req = await requestUpload(meta, folderId);
    if (!req.success) {
      patchItem(item.id, { status: "error", error: req.error });
      return false;
    }

    try {
      await axios.put(req.data.url, file, {
        headers: { "Content-Type": contentType },
        onUploadProgress: (e) => {
          if (e.total) {
            patchItem(item.id, {
              percent: Math.round((e.loaded / e.total) * 100),
            });
          }
        },
      });
    } catch (err) {
      const message =
        axios.isAxiosError(err) && !err.response
          ? "Couldn't reach storage. Check the bucket's CORS policy."
          : "Upload to storage failed";
      patchItem(item.id, { status: "error", error: message, percent: 0 });
      return false;
    }

    const confirmed = await confirmUpload(meta, req.data.key, folderId);
    if (!confirmed.success) {
      patchItem(item.id, { status: "error", error: confirmed.error });
      return false;
    }

    patchItem(item.id, { status: "done", percent: 100 });
    return true;
  }

  async function startUpload() {
    const pending = items.filter(
      (it) => it.status === "queued" || it.status === "error"
    );
    if (pending.length === 0) return;

    setUploading(true);
    let succeeded = 0;
    for (const item of pending) {
      const ok = await uploadItem(item);
      if (ok) succeeded++;
    }
    setUploading(false);

    if (succeeded > 0) {
      toast.success(`${succeeded} file${succeeded > 1 ? "s" : ""} uploaded`);
      router.refresh();
    }
  }

  function handleOpenChange(next: boolean) {
    // Don't let the dialog close mid-upload.
    if (uploading) return;
    setOpen(next);
    if (next) setItems([]);
  }

  const pendingCount = items.filter(
    (it) => it.status === "queued" || it.status === "error"
  ).length;
  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UploadSimple className="size-4" /> Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Drag and drop files here, or browse. Up to 100 MB each.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!uploading) addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm transition-colors",
            dragOver
              ? "border-primary bg-primary/5 text-foreground"
              : "border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <UploadSimple className="size-6" />
          <span>
            <span className="font-medium text-foreground">Click to browse</span>{" "}
            or drag files here
          </span>
        </button>

        {items.length > 0 && (
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
              >
                <FileGlyph
                  contentType={item.file.type || "application/octet-stream"}
                  className="size-5 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {item.file.name}
                    </p>
                    <StatusIcon status={item.status} percent={item.percent} />
                  </div>
                  {item.status === "uploading" ? (
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  ) : (
                    <p
                      className={cn(
                        "truncate text-xs",
                        item.status === "error"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.status === "error"
                        ? item.error
                        : formatBytes(item.file.size)}
                    </p>
                  )}
                </div>
                {(item.status === "queued" || item.status === "error") &&
                  !uploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      aria-label="Remove"
                      onClick={() =>
                        setItems((prev) =>
                          prev.filter((it) => it.id !== item.id)
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  )}
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="sm:justify-between">
          <p className="self-center text-xs text-muted-foreground">
            {doneCount > 0 && `${doneCount} uploaded · `}
            {pendingCount} pending
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => handleOpenChange(false)}
            >
              {doneCount > 0 && pendingCount === 0 ? "Done" : "Cancel"}
            </Button>
            <Button
              type="button"
              disabled={uploading || pendingCount === 0}
              onClick={startUpload}
            >
              {uploading ? (
                <>
                  <CircleNotch className="size-4 animate-spin" /> Uploading...
                </>
              ) : (
                `Upload ${pendingCount || ""}`.trim()
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusIcon({ status, percent }: { status: Status; percent: number }) {
  if (status === "done")
    return <CheckCircle weight="fill" className="size-5 shrink-0 text-emerald-600" />;
  if (status === "error")
    return <XCircle weight="fill" className="size-5 shrink-0 text-destructive" />;
  if (status === "uploading")
    return (
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {percent}%
      </span>
    );
  return null;
}

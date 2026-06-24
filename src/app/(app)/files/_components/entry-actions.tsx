"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  DotsThreeVertical,
  FolderOpen,
  Eye,
  DownloadSimple,
  PencilSimple,
  ArrowsOutCardinal,
  Trash,
} from "@/components/icons";
import { folderNameSchema, fileNameSchema } from "@/lib/validations";
import {
  renameFile,
  renameFolder,
  moveFile,
  moveFolder,
  deleteFile,
  deleteFolder,
} from "@/lib/actions/files";
import type { FolderOption } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Kind = "file" | "folder";

export function EntryActions({
  kind,
  id,
  name,
  contentType,
  folders,
}: {
  kind: Kind;
  id: string;
  name: string;
  /** MIME type, for files only — decides whether previewing is offered. */
  contentType?: string;
  folders: FolderOption[];
}) {
  const [dialog, setDialog] = useState<null | "rename" | "move" | "delete">(null);
  const close = () => setDialog(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions">
            <DotsThreeVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {kind === "folder" ? (
            <DropdownMenuItem asChild>
              <Link href={`/files?folder=${id}`}>
                <FolderOpen className="size-4" /> Open
              </Link>
            </DropdownMenuItem>
          ) : (
            <FileOpenItems id={id} contentType={contentType} />
          )}
          <DropdownMenuItem onSelect={() => setDialog("rename")}>
            <PencilSimple className="size-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("move")}>
            <ArrowsOutCardinal className="size-4" /> Move
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDialog("delete")}
          >
            <Trash className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === "rename" && (
        <RenameDialog onClose={close} kind={kind} id={id} currentName={name} />
      )}
      {dialog === "move" && (
        <MoveDialog onClose={close} kind={kind} id={id} folders={folders} />
      )}
      {dialog === "delete" && (
        <DeleteDialog onClose={close} kind={kind} id={id} name={name} />
      )}
    </>
  );
}

function FileOpenItems({
  id,
  contentType,
}: {
  id: string;
  contentType?: string;
}) {
  // Only images preview cleanly inline; everything else is download-only.
  const canPreview = contentType?.startsWith("image/") ?? false;

  return (
    <>
      {canPreview && (
        <DropdownMenuItem asChild>
          <a href={`/api/files/${id}`} target="_blank" rel="noopener noreferrer">
            <Eye className="size-4" /> View
          </a>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem asChild>
        <a href={`/api/files/${id}?dl=1`}>
          <DownloadSimple className="size-4" /> Download
        </a>
      </DropdownMenuItem>
    </>
  );
}

function RenameDialog({
  onClose,
  kind,
  id,
  currentName,
}: {
  onClose: () => void;
  kind: Kind;
  id: string;
  currentName: string;
}) {
  const router = useRouter();
  const schema = kind === "folder" ? folderNameSchema : fileNameSchema;
  const form = useForm<{ name: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentName },
  });

  async function onSubmit(values: { name: string }) {
    const res =
      kind === "folder"
        ? await renameFolder(id, values)
        : await renameFile(id, values);
    if (res.success) {
      toast.success("Renamed");
      onClose();
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {kind}</DialogTitle>
          <DialogDescription>Enter a new name.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** Flatten the folder list into a depth-ordered tree for the destination select. */
function orderedFolders(folders: FolderOption[]) {
  const byParent = new Map<string | null, FolderOption[]>();
  for (const f of folders) {
    const list = byParent.get(f.parentId) ?? [];
    list.push(f);
    byParent.set(f.parentId, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const out: { id: string; name: string; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const f of byParent.get(parentId) ?? []) {
      out.push({ id: f.id, name: f.name, depth });
      walk(f.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

function MoveDialog({
  onClose,
  kind,
  id,
  folders,
}: {
  onClose: () => void;
  kind: Kind;
  id: string;
  folders: FolderOption[];
}) {
  const router = useRouter();
  const [dest, setDest] = useState("root");
  const [pending, startTransition] = useTransition();

  // When moving a folder, it can't land inside itself or any descendant.
  const excluded = useMemo(() => {
    const set = new Set<string>();
    if (kind !== "folder") return set;
    set.add(id);
    let changed = true;
    while (changed) {
      changed = false;
      for (const f of folders) {
        if (f.parentId && set.has(f.parentId) && !set.has(f.id)) {
          set.add(f.id);
          changed = true;
        }
      }
    }
    return set;
  }, [kind, id, folders]);

  const options = useMemo(
    () => orderedFolders(folders).filter((f) => !excluded.has(f.id)),
    [folders, excluded]
  );

  function onMove() {
    const destId = dest === "root" ? null : dest;
    startTransition(async () => {
      const res =
        kind === "folder"
          ? await moveFolder(id, destId)
          : await moveFile(id, destId);
      if (res.success) {
        toast.success("Moved");
        onClose();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {kind}</DialogTitle>
          <DialogDescription>Choose a destination folder.</DialogDescription>
        </DialogHeader>
        <Select value={dest} onValueChange={setDest}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="root">Files (root)</SelectItem>
            {options.map((f) => (
              <SelectItem
                key={f.id}
                value={f.id}
                style={{ paddingLeft: `${0.5 + f.depth * 0.75}rem` }}
              >
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={onMove} disabled={pending}>
            {pending ? "Moving..." : "Move here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  onClose,
  kind,
  id,
  name,
}: {
  onClose: () => void;
  kind: Kind;
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      const res = kind === "folder" ? await deleteFolder(id) : await deleteFile(id);
      if (res.success) {
        toast.success(kind === "folder" ? "Folder deleted" : "File deleted");
        onClose();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {kind}?</DialogTitle>
          <DialogDescription>
            {kind === "folder"
              ? `"${name}" and everything inside it will be permanently deleted.`
              : `"${name}" will be permanently deleted.`}{" "}
            This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { listImageFiles } from "@/lib/actions/files";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Img = { id: string; name: string };

/** Strapi-style media picker: choose an image from the user's Files, or paste
 * a URL. Returns a stable `/api/files/<id>` src that re-presigns on each load. */
export function ImagePicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}) {
  const [images, setImages] = useState<Img[] | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open || images !== null) return;
    listImageFiles().then((res) => setImages(res.success ? res.data : []));
  }, [open, images]);

  function pick(src: string) {
    onSelect(src);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription>
            Choose one of your files, or paste an image URL.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="https://… image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            type="button"
            disabled={!url.trim()}
            onClick={() => pick(url.trim())}
          >
            Insert
          </Button>
        </div>

        {images === null ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : images.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No images in your files yet. Upload some from the Files page.
          </p>
        ) : (
          <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => pick(`/api/files/${img.id}`)}
                title={img.name}
                className="group overflow-hidden rounded-md border bg-muted/30 transition-colors hover:border-primary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/files/${img.id}`}
                  alt={img.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

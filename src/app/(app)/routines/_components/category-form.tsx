"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  routineCategorySchema,
  type RoutineCategoryInput,
} from "@/lib/validations";
import {
  createRoutineCategory,
  updateRoutineCategory,
} from "@/lib/actions/routines";
import { COLOR_META } from "@/lib/routine-constants";
import { ROUTINE_COLORS, type RoutineColor } from "@/lib/routine-types";
import type { RoutineCategoryEntry } from "@/lib/queries";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CategoryForm({
  category,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  /** Provide to edit an existing category; omit to create one. */
  category?: Pick<RoutineCategoryEntry, "id" | "name" | "color">;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;
  const setOpen = (next: boolean) => {
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const editing = !!category;

  const defaults = (): RoutineCategoryInput => ({
    name: category?.name ?? "",
    color: category?.color ?? "slate",
  });

  const form = useForm<RoutineCategoryInput>({
    resolver: zodResolver(routineCategorySchema),
    defaultValues: defaults(),
  });

  async function onSubmit(values: RoutineCategoryInput) {
    const res = editing
      ? await updateRoutineCategory(category!.id, values)
      : await createRoutineCategory(values);

    if (res.success) {
      toast.success(editing ? "Category updated" : "Category created");
      setOpen(false);
      if (!editing) form.reset({ name: "", color: "slate" });
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(defaults());
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Group related routines and give them a color.
          </DialogDescription>
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
                    <Input placeholder="e.g. Health" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {ROUTINE_COLORS.map((color) => {
                        const active = field.value === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => field.onChange(color)}
                            aria-label={COLOR_META[color].label}
                            aria-pressed={active}
                            className={cn(
                              "size-7 rounded-full ring-offset-2 ring-offset-background transition-all",
                              COLOR_META[color as RoutineColor].swatch,
                              active
                                ? "ring-2 ring-ring"
                                : "hover:scale-110"
                            )}
                          />
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

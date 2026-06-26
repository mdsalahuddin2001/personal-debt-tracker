"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { routineSchema, type RoutineInput } from "@/lib/validations";
import { createRoutine, updateRoutine } from "@/lib/actions/routines";
import { COLOR_META } from "@/lib/routine-constants";
import {
  ROUTINE_TIME_REGEX,
  addMinutesToTime,
  rangeDurationMinutes,
  formatDuration,
} from "@/lib/routine-types";
import type { RoutineCategoryOption, SerializedRoutine } from "@/lib/queries";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DayPicker } from "./day-picker";

const NONE = "none";

export function RoutineForm({
  routine,
  categories,
  /** Preselect this category for a new routine (e.g. when a rail filter is active). */
  defaultCategoryId,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  routine?: SerializedRoutine;
  categories: RoutineCategoryOption[];
  defaultCategoryId?: string | null;
  /** Provide for the uncontrolled "click to open" mode (e.g. an Add button). */
  trigger?: React.ReactNode;
  /** Provide both for controlled mode (e.g. opened from a dropdown menu). */
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
  const editing = !!routine;

  const defaults = (): RoutineInput => ({
    title: routine?.title ?? "",
    description: routine?.description ?? "",
    timeOfDay: routine?.timeOfDay ?? "07:00",
    days: routine?.days ?? [0, 1, 2, 3, 4],
    endTime:
      routine?.durationMinutes != null
        ? addMinutesToTime(routine.timeOfDay, routine.durationMinutes)
        : "",
    categoryId: routine?.categoryId ?? defaultCategoryId ?? "",
  });

  const form = useForm<RoutineInput>({
    resolver: zodResolver(routineSchema),
    defaultValues: defaults(),
  });

  // Live-derived span length, shown as a hint under the end-time field.
  const watchedTime = useWatch({ control: form.control, name: "timeOfDay" });
  const watchedEnd = useWatch({ control: form.control, name: "endTime" });
  const spanMins =
    watchedEnd &&
    ROUTINE_TIME_REGEX.test(watchedTime ?? "") &&
    ROUTINE_TIME_REGEX.test(watchedEnd)
      ? rangeDurationMinutes(watchedTime, watchedEnd)
      : null;
  const endHint = spanMins
    ? `Lasts ${formatDuration(spanMins)}`
    : "When it wraps up";

  async function onSubmit(values: RoutineInput) {
    const res = editing
      ? await updateRoutine(routine!.id, values)
      : await createRoutine(values);

    if (res.success) {
      toast.success(editing ? "Routine updated" : "Routine added");
      setOpen(false);
      if (!editing) form.reset(defaults());
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit routine" : "New routine"}</DialogTitle>
          <DialogDescription>
            Set when it happens and which days it repeats.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning run" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time (optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>{endHint}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeats on</FormLabel>
                  <FormControl>
                    <DayPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || NONE}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "size-3 rounded-full",
                                COLOR_META[c.color].swatch
                              )}
                            />
                            {c.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categories.length === 0 && (
                    <FormDescription>
                      Create categories from the All routines page.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Anything to remember about this routine..."
                      {...field}
                      value={field.value ?? ""}
                    />
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
                    : "Add routine"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { type NoteColor } from "@/lib/note-types";

type ColorMeta = {
  /** Label shown in the color picker. */
  label: string;
  /** Small round swatch shown next to the label in the picker. */
  swatch: string;
  /** Left accent bar + tint applied to the note card. */
  card: string;
};

// "default" carries no tint so untouched notes stay neutral; the rest pair a
// soft background with a saturated left border that reads in both themes.
export const COLOR_META: Record<NoteColor, ColorMeta> = {
  default: {
    label: "Default",
    swatch: "bg-muted-foreground/30",
    card: "border-l-border",
  },
  red: {
    label: "Red",
    swatch: "bg-red-500",
    card: "border-l-red-500 bg-red-50/60 dark:bg-red-950/20",
  },
  amber: {
    label: "Amber",
    swatch: "bg-amber-500",
    card: "border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/20",
  },
  green: {
    label: "Green",
    swatch: "bg-green-500",
    card: "border-l-green-500 bg-green-50/60 dark:bg-green-950/20",
  },
  blue: {
    label: "Blue",
    swatch: "bg-blue-500",
    card: "border-l-blue-500 bg-blue-50/60 dark:bg-blue-950/20",
  },
  purple: {
    label: "Purple",
    swatch: "bg-purple-500",
    card: "border-l-purple-500 bg-purple-50/60 dark:bg-purple-950/20",
  },
};

export const COLOR_OPTIONS = (Object.keys(COLOR_META) as NoteColor[]).map(
  (value) => ({ value, label: COLOR_META[value].label })
);

// Shared styling for rendered note HTML (the rich-text editor and the card show
// the same content, so they use the same prose rules).
export const NOTE_PROSE =
  "text-sm [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_h1]:text-base [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_ul]:list-disc [&_ul]:pl-5";

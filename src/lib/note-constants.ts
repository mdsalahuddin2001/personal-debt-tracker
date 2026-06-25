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

"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { EditorContent, useEditor } from "@tiptap/react";

// Base structural nodes (the package supplies the marks/blocks below).
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import {
  Dropcursor,
  Gapcursor,
  Placeholder,
  TrailingNode,
} from "@tiptap/extensions";
import { HardBreak } from "@tiptap/extension-hard-break";
import { TextStyle } from "@tiptap/extension-text-style";
import { ListItem } from "@tiptap/extension-list";

import { RichTextProvider } from "reactjs-tiptap-editor";
import { History, RichTextUndo, RichTextRedo } from "reactjs-tiptap-editor/history";
import { Clear, RichTextClear } from "reactjs-tiptap-editor/clear";
import { FontFamily, RichTextFontFamily } from "reactjs-tiptap-editor/fontfamily";
import { FontSize, RichTextFontSize } from "reactjs-tiptap-editor/fontsize";
import { Heading, RichTextHeading } from "reactjs-tiptap-editor/heading";
import { Bold, RichTextBold } from "reactjs-tiptap-editor/bold";
import { Italic, RichTextItalic } from "reactjs-tiptap-editor/italic";
import { TextUnderline, RichTextUnderline } from "reactjs-tiptap-editor/textunderline";
import { Strike, RichTextStrike } from "reactjs-tiptap-editor/strike";
import { MoreMark, RichTextMoreMark } from "reactjs-tiptap-editor/moremark";
import { Color, RichTextColor } from "reactjs-tiptap-editor/color";
import { Highlight, RichTextHighlight } from "reactjs-tiptap-editor/highlight";
import { BulletList, RichTextBulletList } from "reactjs-tiptap-editor/bulletlist";
import { OrderedList, RichTextOrderedList } from "reactjs-tiptap-editor/orderedlist";
import { TaskList, RichTextTaskList } from "reactjs-tiptap-editor/tasklist";
import { TextAlign, RichTextAlign } from "reactjs-tiptap-editor/textalign";
import { Indent, RichTextIndent } from "reactjs-tiptap-editor/indent";
import { LineHeight, RichTextLineHeight } from "reactjs-tiptap-editor/lineheight";
import { Link, RichTextLink } from "reactjs-tiptap-editor/link";
import { Image } from "reactjs-tiptap-editor/image";
import { Blockquote, RichTextBlockquote } from "reactjs-tiptap-editor/blockquote";
import { HorizontalRule, RichTextHorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { Code, RichTextCode } from "reactjs-tiptap-editor/code";
import { CodeBlock, RichTextCodeBlock } from "reactjs-tiptap-editor/codeblock";
import { Table, RichTextTable } from "reactjs-tiptap-editor/table";
import { Emoji, RichTextEmoji } from "reactjs-tiptap-editor/emoji";
import { SlashCommand, SlashCommandList } from "reactjs-tiptap-editor/slashcommand";
import {
  RichTextBubbleText,
  RichTextBubbleLink,
  RichTextBubbleImage,
  RichTextBubbleTable,
} from "reactjs-tiptap-editor/bubble";
import { common, createLowlight } from "lowlight";

import { FileImage } from "@/components/icons";
import "reactjs-tiptap-editor/style.css";
import { ImagePicker } from "./image-picker";

// CodeBlock is built on code-block-lowlight, which needs a lowlight instance.
const lowlight = createLowlight(common);

const extensions = [
  Document,
  Text,
  Paragraph,
  HardBreak,
  ListItem,
  TextStyle,
  Dropcursor,
  Gapcursor,
  TrailingNode,
  Placeholder.configure({ placeholder: "Write something, or press '/' for commands…" }),
  History,
  Heading,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  MoreMark,
  Clear,
  FontFamily,
  FontSize,
  Color,
  Highlight.configure({ multicolor: true }),
  BulletList,
  OrderedList,
  TaskList,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Indent,
  LineHeight,
  Link,
  // Images are inserted as file URLs via the picker — no inline upload.
  Image,
  Blockquote,
  HorizontalRule,
  Code,
  CodeBlock.configure({ lowlight }),
  Table,
  Emoji,
  SlashCommand,
];

/** Robust rich-text (TipTap) editor bound to a react-hook-form field. Stores HTML. */
export function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions,
    content: value || "",
    immediatelyRender: false, // avoids SSR hydration mismatch
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Seed the editor with the note's existing content once it's ready (the edit
  // form mounts a fresh editor each open).
  const seeded = useRef(false);
  useEffect(() => {
    if (editor && !seeded.current) {
      seeded.current = true;
      if (value) editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  function insertImage(src: string) {
    editor?.chain().focus().insertContent(`<img src="${src}" alt="" />`).run();
  }

  return (
    <RichTextProvider editor={editor} dark={resolvedTheme === "dark"}>
      <div className="overflow-hidden rounded-md border border-input">
        <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
          <RichTextUndo />
          <RichTextRedo />
          <Divider />
          <RichTextHeading />
          <RichTextFontFamily />
          <RichTextFontSize />
          <Divider />
          <RichTextBold />
          <RichTextItalic />
          <RichTextUnderline />
          <RichTextStrike />
          <RichTextMoreMark />
          <RichTextColor />
          <RichTextHighlight />
          <RichTextClear />
          <Divider />
          <RichTextBulletList />
          <RichTextOrderedList />
          <RichTextTaskList />
          <RichTextAlign />
          <RichTextIndent />
          <RichTextLineHeight />
          <Divider />
          <RichTextLink />
          <button
            type="button"
            title="Insert image"
            aria-label="Insert image"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setPickerOpen(true)}
            className="inline-flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FileImage className="size-4" />
          </button>
          <RichTextTable />
          <RichTextEmoji />
          <Divider />
          <RichTextBlockquote />
          <RichTextCode />
          <RichTextCodeBlock />
          <RichTextHorizontalRule />
        </div>

        <EditorContent
          editor={editor}
          className="max-h-[28rem] overflow-y-auto text-sm [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:px-3! [&_.ProseMirror]:py-2! [&_.ProseMirror]:outline-none"
        />
      </div>

      <RichTextBubbleText />
      <RichTextBubbleLink />
      <RichTextBubbleImage />
      <RichTextBubbleTable />
      <SlashCommandList />

      <ImagePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={insertImage}
      />
    </RichTextProvider>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-border" />;
}

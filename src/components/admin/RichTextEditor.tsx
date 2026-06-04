import { type ReactNode, useEffect } from "react";
import { mergeAttributes, Node } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Youtube from "@tiptap/extension-youtube";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Columns3,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  PaintBucket,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows3,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Underline,
  Undo2,
  Unlink,
  Video,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeRichTextHtml } from "@/lib/richText";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const toolbarButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center border border-grid/25 bg-background text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-interactive disabled:pointer-events-none disabled:opacity-50";

const selectClass =
  "h-9 shrink-0 border border-grid/25 bg-background px-2 text-xs text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-1 focus-visible:ring-interactive disabled:pointer-events-none disabled:opacity-50";

const activeButtonClass = "border-crimson bg-crimson/12 text-crimson";

const textColors = ["#111827", "#7f1d1d", "#991b1b", "#92400e", "#166534", "#1d4ed8"];
const highlightColors = ["#fef3c7", "#fee2e2", "#dcfce7", "#dbeafe", "#ede9fe", "#f5f5f4"];

const isAllowedLink = (href: string) => /^(https?:|mailto:|tel:|\/(?!\/)|#)/i.test(href);
const isAllowedMediaUrl = (src: string) => /^(https?:|\/(?!\/))/i.test(src);
const isYoutubeUrl = (src: string) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(src);

const VideoEmbed = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "",
        playsinline: "",
        preload: "metadata",
      }),
    ];
  },
});

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: {
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            target: "_blank",
            rel: "noreferrer",
          },
          isAllowedUri: (href) => isAllowedLink(href),
          openOnClick: false,
        },
      }),
      TextStyleKit.configure({
        fontFamily: false,
        fontSize: { types: ["textStyle"] },
        lineHeight: { types: ["textStyle"] },
      }),
      Highlight.configure({ multicolor: true }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          loading: "lazy",
        },
      }),
      Youtube.configure({
        controls: true,
        height: 360,
        modestBranding: true,
        nocookie: true,
        width: 640,
      }),
      VideoEmbed,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "rich-text-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Typography,
      Placeholder.configure({
        placeholder: placeholder || "Write the long product description...",
      }),
    ],
    content: sanitizeRichTextHtml(value || ""),
    editorProps: {
      attributes: {
        class:
          "rich-text-content rich-text-editor min-h-[320px] overflow-y-auto bg-background px-4 py-4 text-sm text-foreground outline-none focus:bg-background",
      },
      transformPastedHTML: (html) => sanitizeRichTextHtml(html),
    },
    onBlur: ({ editor }) => {
      const currentHtml = editor.getHTML();
      const sanitized = sanitizeRichTextHtml(currentHtml);
      if (sanitized !== currentHtml) {
        editor.commands.setContent(sanitized, { emitUpdate: false });
      }
      onChange(sanitized);
    },
    onUpdate: ({ editor }) => {
      onChange(sanitizeRichTextHtml(editor.getHTML()));
    },
    shouldRerenderOnTransaction: true,
  });

  useEffect(() => {
    if (!editor) return;
    const incoming = sanitizeRichTextHtml(value || "");
    const current = sanitizeRichTextHtml(editor.getHTML());
    if (incoming !== current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [editor, value]);

  const getBlockValue = () => {
    if (!editor) return "paragraph";
    const level = ([1, 2, 3, 4, 5, 6] as HeadingLevel[]).find((headingLevel) =>
      editor.isActive("heading", { level: headingLevel }),
    );
    if (level) return `h${level}`;
    if (editor.isActive("codeBlock")) return "codeBlock";
    return "paragraph";
  };

  const setBlockValue = (block: string) => {
    if (!editor) return;
    if (block === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    if (block === "codeBlock") {
      editor.chain().focus().toggleCodeBlock().run();
      return;
    }
    const level = Number(block.replace("h", "")) as HeadingLevel;
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const clearFormatting = () => editor?.chain().focus().unsetAllMarks().clearNodes().run();

  const toggleLink = () => {
    if (!editor) return;

    const previousHref = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Paste a URL for this link", previousHref || "");

    if (href === null) return;

    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const nextHref = href.trim();
    if (!isAllowedLink(nextHref)) return;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: nextHref, target: "_blank", rel: "noreferrer" })
      .run();
  };

  const insertImage = () => {
    if (!editor) return;
    const src = window.prompt("Paste an image URL");
    if (!src) return;
    const nextSrc = src.trim();
    if (!isAllowedMediaUrl(nextSrc)) return;
    const alt = window.prompt("Add alt text for this image", "") || "";
    editor.chain().focus().setImage({ src: nextSrc, alt }).run();
  };

  const insertYoutube = () => {
    if (!editor) return;
    const src = window.prompt("Paste a YouTube URL");
    if (!src) return;
    const nextSrc = src.trim();
    if (!isYoutubeUrl(nextSrc)) return;
    editor.chain().focus().setYoutubeVideo({ src: nextSrc, width: 640, height: 360 }).run();
  };

  const insertVideo = () => {
    if (!editor) return;
    const src = window.prompt("Paste a direct video URL");
    if (!src) return;
    const nextSrc = src.trim();
    if (!isAllowedMediaUrl(nextSrc)) return;
    editor.chain().focus().insertContent({ type: "video", attrs: { src: nextSrc } }).run();
  };

  const insertTable = () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  const toolbarButton = (
    label: string,
    onClick: () => void,
    icon: ReactNode,
    active = false,
    disabled = !editor,
  ) => (
    <button
      type="button"
      className={cn(toolbarButtonClass, active && activeButtonClass)}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );

  const separator = <span className="mx-1 h-6 w-px shrink-0 bg-grid/25" aria-hidden="true" />;

  return (
    <div className={cn("overflow-hidden border border-input bg-background", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-grid/25 bg-muted/45 p-2">
        {toolbarButton("Undo", () => editor?.chain().focus().undo().run(), <Undo2 className="h-4 w-4" />)}
        {toolbarButton("Redo", () => editor?.chain().focus().redo().run(), <Redo2 className="h-4 w-4" />)}

        {separator}

        <select
          className={selectClass}
          value={getBlockValue()}
          onChange={(event) => setBlockValue(event.target.value)}
          disabled={!editor}
          aria-label="Block style"
          title="Block style"
        >
          <option value="paragraph">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
          <option value="codeBlock">Code block</option>
        </select>

        <select
          className={selectClass}
          value={(editor?.getAttributes("textStyle").fontSize as string | undefined) || ""}
          onChange={(event) => {
            const fontSize = event.target.value;
            if (!fontSize) editor?.chain().focus().unsetFontSize().run();
            else editor?.chain().focus().setFontSize(fontSize).run();
          }}
          disabled={!editor}
          aria-label="Font size"
          title="Font size"
        >
          <option value="">Size</option>
          <option value="0.875rem">Small</option>
          <option value="1rem">Normal</option>
          <option value="1.125rem">Large</option>
          <option value="1.35rem">XL</option>
          <option value="1.75rem">2XL</option>
        </select>

        <select
          className={selectClass}
          value={(editor?.getAttributes("textStyle").lineHeight as string | undefined) || ""}
          onChange={(event) => {
            const lineHeight = event.target.value;
            if (!lineHeight) editor?.chain().focus().unsetLineHeight().run();
            else editor?.chain().focus().setLineHeight(lineHeight).run();
          }}
          disabled={!editor}
          aria-label="Line height"
          title="Line height"
        >
          <option value="">Line</option>
          <option value="1.35">Tight</option>
          <option value="1.6">Normal</option>
          <option value="1.85">Relaxed</option>
          <option value="2.1">Loose</option>
        </select>

        {separator}

        {toolbarButton("Bold", () => editor?.chain().focus().toggleBold().run(), <Bold className="h-4 w-4" />, editor?.isActive("bold"))}
        {toolbarButton("Italic", () => editor?.chain().focus().toggleItalic().run(), <Italic className="h-4 w-4" />, editor?.isActive("italic"))}
        {toolbarButton("Underline", () => editor?.chain().focus().toggleUnderline().run(), <Underline className="h-4 w-4" />, editor?.isActive("underline"))}
        {toolbarButton("Strikethrough", () => editor?.chain().focus().toggleStrike().run(), <Strikethrough className="h-4 w-4" />, editor?.isActive("strike"))}
        {toolbarButton("Inline code", () => editor?.chain().focus().toggleCode().run(), <Code2 className="h-4 w-4" />, editor?.isActive("code"))}
        {toolbarButton("Subscript", () => editor?.chain().focus().toggleSubscript().run(), <SubscriptIcon className="h-4 w-4" />, editor?.isActive("subscript"))}
        {toolbarButton("Superscript", () => editor?.chain().focus().toggleSuperscript().run(), <SuperscriptIcon className="h-4 w-4" />, editor?.isActive("superscript"))}

        {separator}

        {toolbarButton("Align left", () => editor?.chain().focus().setTextAlign("left").run(), <AlignLeft className="h-4 w-4" />, editor?.isActive({ textAlign: "left" }))}
        {toolbarButton("Align center", () => editor?.chain().focus().setTextAlign("center").run(), <AlignCenter className="h-4 w-4" />, editor?.isActive({ textAlign: "center" }))}
        {toolbarButton("Align right", () => editor?.chain().focus().setTextAlign("right").run(), <AlignRight className="h-4 w-4" />, editor?.isActive({ textAlign: "right" }))}
        {toolbarButton("Justify", () => editor?.chain().focus().setTextAlign("justify").run(), <AlignJustify className="h-4 w-4" />, editor?.isActive({ textAlign: "justify" }))}

        {separator}

        <span className="flex items-center gap-1" aria-label="Text colors">
          <Palette className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {textColors.map((color) => (
            <button
              key={color}
              type="button"
              className="h-7 w-7 shrink-0 border border-grid/25 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-interactive"
              style={{ backgroundColor: color }}
              onClick={() => editor?.chain().focus().setColor(color).run()}
              disabled={!editor}
              aria-label={`Text color ${color}`}
              title={`Text color ${color}`}
            />
          ))}
        </span>
        <span className="flex items-center gap-1" aria-label="Highlight colors">
          <PaintBucket className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {highlightColors.map((color) => (
            <button
              key={color}
              type="button"
              className="h-7 w-7 shrink-0 border border-grid/25 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-interactive"
              style={{ backgroundColor: color }}
              onClick={() => editor?.chain().focus().setBackgroundColor(color).run()}
              disabled={!editor}
              aria-label={`Background color ${color}`}
              title={`Background color ${color}`}
            />
          ))}
        </span>
        {toolbarButton("Highlight", () => editor?.chain().focus().toggleHighlight({ color: "#fef3c7" }).run(), <Highlighter className="h-4 w-4" />, editor?.isActive("highlight"))}
        {toolbarButton("Remove text color", () => editor?.chain().focus().unsetColor().unsetBackgroundColor().unsetHighlight().run(), <Eraser className="h-4 w-4" />)}

        {separator}

        {toolbarButton("Bullet list", () => editor?.chain().focus().toggleBulletList().run(), <List className="h-4 w-4" />, editor?.isActive("bulletList"))}
        {toolbarButton("Numbered list", () => editor?.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-4 w-4" />, editor?.isActive("orderedList"))}
        {toolbarButton("Task list", () => editor?.chain().focus().toggleTaskList().run(), <ListChecks className="h-4 w-4" />, editor?.isActive("taskList"))}
        {toolbarButton("Quote", () => editor?.chain().focus().toggleBlockquote().run(), <Quote className="h-4 w-4" />, editor?.isActive("blockquote"))}
        {toolbarButton("Horizontal rule", () => editor?.chain().focus().setHorizontalRule().run(), <Minus className="h-4 w-4" />)}

        {separator}

        {toolbarButton("Link", toggleLink, <LinkIcon className="h-4 w-4" />, editor?.isActive("link"))}
        {toolbarButton("Unlink", () => editor?.chain().focus().extendMarkRange("link").unsetLink().run(), <Unlink className="h-4 w-4" />, false, !editor?.isActive("link"))}
        {toolbarButton("Image", insertImage, <ImageIcon className="h-4 w-4" />)}
        {toolbarButton("YouTube", insertYoutube, <YoutubeIcon className="h-4 w-4" />)}
        {toolbarButton("Video", insertVideo, <Video className="h-4 w-4" />)}
        {toolbarButton("Table", insertTable, <TableIcon className="h-4 w-4" />, editor?.isActive("table"))}

        {editor?.isActive("table") && (
          <>
            {separator}
            {toolbarButton("Add column", () => editor.chain().focus().addColumnAfter().run(), <Columns3 className="h-4 w-4" />)}
            {toolbarButton("Delete column", () => editor.chain().focus().deleteColumn().run(), <Columns3 className="h-4 w-4 rotate-90" />)}
            {toolbarButton("Add row", () => editor.chain().focus().addRowAfter().run(), <Rows3 className="h-4 w-4" />)}
            {toolbarButton("Delete row", () => editor.chain().focus().deleteRow().run(), <Rows3 className="h-4 w-4 rotate-90" />)}
            {toolbarButton("Toggle header row", () => editor.chain().focus().toggleHeaderRow().run(), <Pilcrow className="h-4 w-4" />)}
            {toolbarButton("Delete table", () => editor.chain().focus().deleteTable().run(), <Trash2 className="h-4 w-4" />)}
          </>
        )}

        {separator}

        {toolbarButton("Paragraph", () => editor?.chain().focus().setParagraph().run(), <Pilcrow className="h-4 w-4" />, editor?.isActive("paragraph"))}
        {toolbarButton("Clear formatting", clearFormatting, <RemoveFormatting className="h-4 w-4" />)}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

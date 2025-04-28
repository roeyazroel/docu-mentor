import { Editor, EditorContent } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Quote as BlockQuoteIcon,
  Bold as BoldIcon,
  List as BulletListIcon,
  Eraser as ClearFormattingIcon,
  Code as CodeIcon,
  Copy as CopyIcon,
  Scissors as CutIcon,
  Type as FontIcon,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  Minus as HorizontalLineIcon,
  Italic as ItalicIcon,
  ListOrdered as OrderedListIcon,
  ClipboardPaste as PasteIcon,
  Redo as RedoIcon,
  Search,
  TextSelection as SelectAllIcon,
  Strikethrough as StrikethroughIcon,
  Undo as UndoIcon,
  X as UnsetColorIcon,
} from "lucide-react";
import { useState } from "react";

import styles from "./Toolbar.module.css";
type Props = {
  editor: Editor | null;
};

export function Toolbar({ editor }: Props) {
  if (!editor) {
    return null;
  }

  const [showColors, setShowColors] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);
  const [showFontFamilies, setShowFontFamilies] = useState(false);

  // Predefined colors for text styling
  const colorPresets = [
    { color: "#958DF1", name: "Purple" },
    { color: "#F98181", name: "Red" },
    { color: "#FBBC88", name: "Orange" },
    { color: "#FAF594", name: "Yellow" },
    { color: "#70CFF8", name: "Blue" },
    { color: "#94FADB", name: "Teal" },
    { color: "#B9F18D", name: "Green" },
  ];

  // Shows available font sizes but won't work without the FontSize extension
  const fontSizes = [
    "8px",
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "24px",
    "28px",
    "32px",
    "36px",
    "48px",
  ];

  // Shows available font families but won't work without the FontFamily extension
  const fontFamilies = [
    "Arial",
    "Courier New",
    "Georgia",
    "Impact",
    "Tahoma",
    "Times New Roman",
    "Verdana",
  ];

  // Modern clipboard operations
  const handleCopy = async () => {
    if (!editor.view.state.selection.empty) {
      try {
        const selectedText = editor.view.state.doc.textBetween(
          editor.view.state.selection.from,
          editor.view.state.selection.to,
          "\n"
        );
        await navigator.clipboard.writeText(selectedText);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const handleCut = async () => {
    if (!editor.view.state.selection.empty) {
      try {
        const selectedText = editor.view.state.doc.textBetween(
          editor.view.state.selection.from,
          editor.view.state.selection.to,
          "\n"
        );
        await navigator.clipboard.writeText(selectedText);
        editor.commands.deleteSelection();
      } catch (err) {
        console.error("Failed to cut text: ", err);
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      editor.commands.insertContent(text);
    } catch (err) {
      console.error("Failed to paste text: ", err);
    }
  };

  // Get the current text color if available
  const currentColor = editor.getAttributes("textStyle").color || "#000000";

  return (
    <>
      <div className={styles.toolbarContainer}>
        <div className={styles.toolbar}>
          {/* History Controls */}
          <div className={styles.toolbarGroup}>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              aria-label="undo"
              title="Undo"
            >
              <UndoIcon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              aria-label="redo"
              title="Redo"
            >
              <RedoIcon size={18} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Text Style Controls */}
          <div className={styles.toolbarGroup}>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().toggleBold().run()}
              data-active={editor.isActive("bold") ? "is-active" : undefined}
              aria-label="bold"
              title="Bold"
            >
              <BoldIcon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              data-active={editor.isActive("italic") ? "is-active" : undefined}
              aria-label="italic"
              title="Italic"
            >
              <ItalicIcon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              data-active={editor.isActive("strike") ? "is-active" : undefined}
              aria-label="strikethrough"
              title="Strikethrough"
            >
              <StrikethroughIcon size={18} />
            </button>

            {/* Font size selector - requires FontSize extension */}
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownButton}
                onClick={() => setShowFontSizes(!showFontSizes)}
                title="Font Size (requires FontSize extension)"
              >
                <span className={styles.fontSizeIcon}>A</span>
              </button>
              {showFontSizes && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.extensionNote}>
                    Requires FontSize extension
                  </div>
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      className={styles.dropdownItem}
                      onClick={() => {
                        // Would need the FontSize extension:
                        // editor.chain().focus().setFontSize(size).run();
                        alert("FontSize extension required");
                        setShowFontSizes(false);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font family selector - requires FontFamily extension */}
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownButton}
                onClick={() => setShowFontFamilies(!showFontFamilies)}
                title="Font Family (requires FontFamily extension)"
              >
                <FontIcon size={18} />
              </button>
              {showFontFamilies && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.extensionNote}>
                    Requires FontFamily extension
                  </div>
                  {fontFamilies.map((font) => (
                    <button
                      key={font}
                      className={styles.dropdownItem}
                      style={{ fontFamily: font }}
                      onClick={() => {
                        // Would need the FontFamily extension:
                        editor.commands.setFontFamily(font);
                        alert("FontFamily extension required");
                        setShowFontFamilies(false);
                      }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Text color selector with TextStyle and Color extensions */}
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownButton}
                onClick={() => setShowColors(!showColors)}
                title="Text Color"
                style={{ color: currentColor }}
              >
                <div
                  className={styles.colorIndicator}
                  style={{ backgroundColor: currentColor }}
                ></div>
              </button>
              {showColors && (
                <div
                  className={styles.colorPalette}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.colorInputWrapper}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={currentColor}
                      onChange={(event) => {
                        editor
                          .chain()
                          .focus()
                          .setColor(event.target.value)
                          .run();
                      }}
                    />
                  </div>
                  <div className={styles.colorPresets}>
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.color}
                        className={styles.colorSwatch}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => {
                          editor.chain().focus().setColor(preset.color).run();
                          setShowColors(false);
                        }}
                        data-active={
                          editor.isActive("textStyle", { color: preset.color })
                            ? "is-active"
                            : undefined
                        }
                        title={preset.name}
                      />
                    ))}
                    <button
                      className={styles.unsetColorButton}
                      onClick={() => editor.chain().focus().unsetColor().run()}
                      title="Unset color"
                    >
                      <UnsetColorIcon size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className={styles.button}
              onClick={() =>
                editor.chain().focus().clearNodes().unsetAllMarks().run()
              }
              aria-label="clear-formatting"
              title="Clear Formatting"
            >
              <ClearFormattingIcon size={18} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Text Alignment Controls - requires TextAlign extension */}
          <div className={styles.toolbarGroup}>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              data-active={
                editor.isActive({ textAlign: "left" }) ? "is-active" : undefined
              }
              aria-label="align-left"
              title="Align Left (requires TextAlign extension)"
            >
              <AlignLeft size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              data-active={
                editor.isActive({ textAlign: "center" })
                  ? "is-active"
                  : undefined
              }
              aria-label="align-center"
              title="Align Center (requires TextAlign extension)"
            >
              <AlignCenter size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              data-active={
                editor.isActive({ textAlign: "right" })
                  ? "is-active"
                  : undefined
              }
              aria-label="align-right"
              title="Align Right (requires TextAlign extension)"
            >
              <AlignRight size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              data-active={
                editor.isActive({ textAlign: "justify" })
                  ? "is-active"
                  : undefined
              }
              aria-label="align-justify"
              title="Justify (requires TextAlign extension)"
            >
              <AlignJustify size={18} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Heading Controls */}
          <div className={styles.toolbarGroup}>
            <button
              className={styles.button}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              data-active={
                editor.isActive("heading", { level: 1 })
                  ? "is-active"
                  : undefined
              }
              aria-label="heading-1"
              title="Heading 1"
            >
              <Heading1Icon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              data-active={
                editor.isActive("heading", { level: 2 })
                  ? "is-active"
                  : undefined
              }
              aria-label="heading-2"
              title="Heading 2"
            >
              <Heading2Icon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              data-active={
                editor.isActive("heading", { level: 3 })
                  ? "is-active"
                  : undefined
              }
              aria-label="heading-3"
              title="Heading 3"
            >
              <Heading3Icon size={18} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* List Controls */}
          <div className={styles.toolbarGroup}>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              data-active={
                editor.isActive("bulletList") ? "is-active" : undefined
              }
              aria-label="bullet-list"
              title="Bullet List"
            >
              <BulletListIcon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              data-active={
                editor.isActive("orderedList") ? "is-active" : undefined
              }
              aria-label="number-list"
              title="Numbered List"
            >
              <OrderedListIcon size={18} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Block Controls */}
          <div className={styles.toolbarGroup}>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              data-active={
                editor.isActive("blockquote") ? "is-active" : undefined
              }
              aria-label="blockquote"
              title="Blockquote"
            >
              <BlockQuoteIcon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              data-active={
                editor.isActive("codeBlock") ? "is-active" : undefined
              }
              aria-label="code-block"
              title="Code Block"
            >
              <CodeIcon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              aria-label="horizontal-line"
              title="Horizontal Line"
            >
              <HorizontalLineIcon size={18} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Find and Select */}
          <div className={styles.toolbarGroup}>
            <button
              className={styles.button}
              onClick={() => {
                // Find feature would require an implementation
                const searchTerm = prompt("Enter search term:");
                if (searchTerm) {
                  // This would need a custom implementation
                  alert("Search functionality needs to be implemented");
                }
              }}
              aria-label="find"
              title="Find (needs implementation)"
            >
              <Search size={18} />
            </button>
            <button
              className={styles.button}
              onClick={() => editor.commands.selectAll()}
              aria-label="select-all"
              title="Select All"
            >
              <SelectAllIcon size={18} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Clipboard operations with modern Clipboard API */}
          <div className={styles.toolbarGroup}>
            <button
              className={styles.button}
              onClick={handleCut}
              aria-label="cut"
              title="Cut (requires browser permissions)"
            >
              <CutIcon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={handleCopy}
              aria-label="copy"
              title="Copy (requires browser permissions)"
            >
              <CopyIcon size={18} />
            </button>
            <button
              className={styles.button}
              onClick={handlePaste}
              aria-label="paste"
              title="Paste (requires browser permissions)"
            >
              <PasteIcon size={18} />
            </button>
          </div>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  );
}

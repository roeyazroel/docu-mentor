"use client";

import MDEditor from "@uiw/react-md-editor";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface DocumentEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export default function DocumentEditor({
  content,
  onChange,
}: DocumentEditorProps) {
  const [value, setValue] = useState<string>(content || "");
  const { resolvedTheme } = useTheme();
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (content !== value) {
      setValue(content || "");
    }
  }, [content]);

  useEffect(() => {
    setColorMode(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", colorMode);

    return () => {
      document.documentElement.removeAttribute("data-color-mode");
    };
  }, [colorMode]);

  const handleChange = (newValue?: string) => {
    const updatedValue = newValue || "";
    setValue(updatedValue);
    onChange(updatedValue);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full">
      <div
        data-color-mode={colorMode}
        className="w-full h-full flex-1"
        style={{ minHeight: "400px" }}
      >
        <MDEditor
          value={value}
          onChange={handleChange}
          height="100%"
          preview="preview"
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
            remarkPlugins: [[remarkGfm]],
          }}
          visibleDragbar={false}
          hideToolbar={false}
          textareaProps={{
            placeholder: "Write your markdown here...",
          }}
        />
      </div>
    </div>
  );
}

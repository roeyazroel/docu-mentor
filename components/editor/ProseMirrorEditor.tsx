"use client";

import documentSchema from "@/lib/prosemirror/schema";
import { proseMirrorToText, textToProseMirror } from "@/lib/prosemirror/utils";
import { baseKeymap } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import React, { useEffect, useRef } from "react";

interface ProseMirrorEditorProps {
  content: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  className?: string;
  editorRef?: React.RefObject<EditorView | null>;
  decorationClasses?: Record<string, string>;
}

/**
 * Base ProseMirror editor component with essential functionality
 */
export default function ProseMirrorEditor({
  content,
  onChange,
  readOnly = false,
  className = "",
  editorRef,
  decorationClasses = {},
}: ProseMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Create and destroy the editor
  useEffect(() => {
    if (!containerRef.current) return;

    // Parse initial content
    let doc: ProseMirrorNode;
    try {
      doc = textToProseMirror(content);
    } catch (error) {
      console.error("Error parsing document content:", error);
      doc = documentSchema.node("doc", null, [
        documentSchema.node("paragraph", null),
      ]);
    }

    // Create editor state
    const state = EditorState.create({
      schema: documentSchema,
      doc,
      plugins: [
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo, "Mod-Shift-z": redo }),
        keymap(baseKeymap),
      ],
    });

    // Create editor view
    const view = new EditorView(containerRef.current, {
      state,
      editable: () => !readOnly,
      dispatchTransaction: (transaction) => {
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        if (transaction.docChanged && onChange) {
          const newContent = proseMirrorToText(newState.doc);
          onChange(newContent);
        }
      },
      // Add custom attributes to the editor
      attributes: {
        class: "prose dark:prose-invert max-w-none",
      },
      // Optional nodeViews to customize rendering
      // nodeViews: {},
    });

    // Store the view
    viewRef.current = view;
    if (editorRef) {
      editorRef.current = view;
    }

    // Apply stylesheet with extra specificity to override default styles
    const addExtraStyles = () => {
      // Remove any existing style element we created
      const oldStyle = document.getElementById("prosemirror-custom-styles");
      if (oldStyle) oldStyle.remove();

      // Create a style element for our custom styles
      const styleEl = document.createElement("style");
      styleEl.id = "prosemirror-custom-styles";

      // Add styles with extra specificity
      styleEl.textContent = `
        .prosemirror-editor .addition {
          background-color: #bbf7d0 !important; /* green-200 */
          font-weight: bold !important;
        }

        .dark .prosemirror-editor .addition {
          background-color: #166534 !important; /* green-800 */
          font-weight: bold !important;
        }

        .prosemirror-editor .deletion {
          background-color: #fecaca !important; /* red-200 */
          text-decoration: line-through !important;
          opacity: 0.75 !important;
        }

        .dark .prosemirror-editor .deletion {
          background-color: #991b1b !important; /* red-800 */
          text-decoration: line-through !important;
          opacity: 0.75 !important;
        }

        .prosemirror-editor .modification {
          background-color: #fef08a !important; /* yellow-200 */
        }

        .dark .prosemirror-editor .modification {
          background-color: #854d0e !important; /* yellow-800 */
        }
      `;

      // Add to document head
      document.head.appendChild(styleEl);
    };

    // Add the extra styles to the document
    addExtraStyles();

    // Cleanup
    return () => {
      const styleEl = document.getElementById("prosemirror-custom-styles");
      if (styleEl) styleEl.remove();

      view.destroy();
      viewRef.current = null;
      if (editorRef) {
        editorRef.current = null;
      }
    };
  }, [readOnly, editorRef]); // Don't include decorationClasses since we're using a direct approach

  // Update content when it changes externally
  useEffect(() => {
    if (!viewRef.current) return;

    const currentContent = proseMirrorToText(viewRef.current.state.doc);
    if (content !== currentContent) {
      try {
        const newDoc = textToProseMirror(content);
        const newState = EditorState.create({
          schema: documentSchema,
          doc: newDoc,
          plugins: viewRef.current.state.plugins,
        });
        viewRef.current.updateState(newState);
      } catch (error) {
        console.error("Error updating document content:", error);
      }
    }
  }, [content]);

  return (
    <div className={`prosemirror-editor ${className}`} ref={containerRef} />
  );
}

/Users/roeyazroel/Documents/github/roeyazroel/docu-mentor/
├─] .env (ignored)
├── .gitignore
├─] .next/ (ignored)
├── PRD.md
├── README.md
├── app/
│ ├── diff-demo/
│ │ ├── design-options/
│ │ │ └── page.tsx
│ │ └── page.tsx
│ ├── editor/
│ │ ├── [id]/
│ │ │ ├── actions.ts
│ │ │ └── page.tsx
│ │ └── new/
│ │ └── page.tsx
│ ├── globals.css
│ ├── layout.tsx
│ ├── login/
│ │ └── page.tsx
│ ├── page.tsx
│ └── signup/
│ └── page.tsx
├── components/
│ ├── ai-chat-panel.tsx
│ ├── ai-suggestion-diff.tsx
│ ├── diff/
│ │ ├── DiffGroupRenderer.tsx
│ │ ├── DiffViewTab.tsx
│ │ ├── InlineDiffRenderer.tsx
│ │ └── MergeConflictTab.tsx
│ ├── document-editor.tsx
│ ├── editor/
│ │ ├── ApiKeyErrorDisplay.tsx
│ │ ├── EditorContentArea.tsx
│ │ ├── EditorHeader.tsx
│ │ ├── EditorUsersPanel.tsx
│ │ ├── ProseMirrorEditor.tsx
│ │ └── SideBySideEditor.tsx
│ ├── editor-toolbar.tsx
│ ├── project-sidebar.tsx
│ ├── resizable-panel.tsx
│ ├── theme-provider.tsx
│ └── ui/
│ ├── accordion.tsx
│ ├── alert-dialog.tsx
│ ├── alert.tsx
│ ├── aspect-ratio.tsx
│ ├── avatar.tsx
│ ├── badge.tsx
│ ├── breadcrumb.tsx
│ ├── button.tsx
│ ├── calendar.tsx
│ ├── card.tsx
│ ├── carousel.tsx
│ ├── chart.tsx
│ ├── checkbox.tsx
│ ├── collapsible.tsx
│ ├── command.tsx
│ ├── context-menu.tsx
│ ├── dialog.tsx
│ ├── drawer.tsx
│ ├── dropdown-menu.tsx
│ ├── form.tsx
│ ├── hover-card.tsx
│ ├── input-otp.tsx
│ ├── input.tsx
│ ├── label.tsx
│ ├── menubar.tsx
│ ├── navigation-menu.tsx
│ ├── pagination.tsx
│ ├── popover.tsx
│ ├── progress.tsx
│ ├── radio-group.tsx
│ ├── resizable.tsx
│ ├── scroll-area.tsx
│ ├── select.tsx
│ ├── separator.tsx
│ ├── sheet.tsx
│ ├── sidebar.tsx
│ ├── skeleton.tsx
│ ├── slider.tsx
│ ├── sonner.tsx
│ ├── switch.tsx
│ ├── table.tsx
│ ├── tabs.tsx
│ ├── textarea.tsx
│ ├── toast.tsx
│ ├── toaster.tsx
│ ├── toggle-group.tsx
│ ├── toggle.tsx
│ ├── tooltip.tsx
│ ├── use-mobile.tsx
│ └── use-toast.ts
├── components.json
├── hooks/
│ ├── use-mobile.tsx
│ ├── use-toast.ts
│ ├── useAiDiff.ts
│ └── useInlineDiff.ts
├── lib/
│ ├── diff-utils.ts
│ ├── document-operations.ts
│ ├── openai.ts
│ ├── prosemirror/
│ │ ├── schema.ts
│ │ └── utils.ts
│ ├── text-processing.ts
│ └── utils.ts
├── next-env.d.ts
├── next.config.mjs
├─] node_modules/ (ignored)
├── package-lock.json
├── package.json
├── plate-examples/
│ ├── app/
│ │ ├── api/
│ │ │ ├── ai/
│ │ │ │ ├── command/
│ │ │ │ │ └── route.ts
│ │ │ │ └── copilot/
│ │ │ │ └── route.ts
│ │ │ └── uploadthing/
│ │ │ └── route.ts
│ │ └── editor/
│ │ └── page.tsx
│ ├── components/
│ │ ├── editor/
│ │ │ ├── plate-editor.tsx
│ │ │ ├── plate-types.ts
│ │ │ ├── plugins/
│ │ │ │ ├── ai-plugins.tsx
│ │ │ │ ├── align-plugin.ts
│ │ │ │ ├── autoformat-plugin.ts
│ │ │ │ ├── basic-nodes-plugins.tsx
│ │ │ │ ├── block-menu-plugins.ts
│ │ │ │ ├── block-selection-plugins.tsx
│ │ │ │ ├── comments-plugin.tsx
│ │ │ │ ├── copilot-plugins.tsx
│ │ │ │ ├── cursor-overlay-plugin.tsx
│ │ │ │ ├── delete-plugins.ts
│ │ │ │ ├── dnd-plugins.tsx
│ │ │ │ ├── editor-plugins.tsx
│ │ │ │ ├── equation-plugins.ts
│ │ │ │ ├── exit-break-plugin.ts
│ │ │ │ ├── fixed-toolbar-plugin.tsx
│ │ │ │ ├── floating-toolbar-plugin.tsx
│ │ │ │ ├── indent-list-plugins.ts
│ │ │ │ ├── line-height-plugin.ts
│ │ │ │ ├── link-plugin.tsx
│ │ │ │ ├── media-plugins.tsx
│ │ │ │ ├── mention-plugin.ts
│ │ │ │ ├── reset-block-type-plugin.ts
│ │ │ │ ├── skip-mark-plugin.ts
│ │ │ │ ├── soft-break-plugin.ts
│ │ │ │ ├── suggestion-plugin.tsx
│ │ │ │ ├── table-plugin.ts
│ │ │ │ └── toc-plugin.ts
│ │ │ ├── settings.tsx
│ │ │ ├── transforms.ts
│ │ │ ├── use-chat.ts
│ │ │ └── use-create-editor.ts
│ │ └── plate-ui/
│ │ ├── ai-chat-editor.tsx
│ │ ├── ai-leaf.tsx
│ │ ├── ai-menu-items.tsx
│ │ ├── ai-menu.tsx
│ │ ├── ai-toolbar-button.tsx
│ │ ├── alert-dialog.tsx
│ │ ├── align-dropdown-menu.tsx
│ │ ├── avatar.tsx
│ │ ├── block-context-menu.tsx
│ │ ├── block-discussion.tsx
│ │ ├── block-selection.tsx
│ │ ├── block-suggestion.tsx
│ │ ├── blockquote-element-static.tsx
│ │ ├── blockquote-element.tsx
│ │ ├── button.tsx
│ │ ├── calendar.tsx
│ │ ├── caption.tsx
│ │ ├── checkbox-static.tsx
│ │ ├── checkbox.tsx
│ │ ├── code-block-combobox.tsx
│ │ ├── code-block-element-static.tsx
│ │ ├── code-block-element.tsx
│ │ ├── code-leaf-static.tsx
│ │ ├── code-leaf.tsx
│ │ ├── code-line-element-static.tsx
│ │ ├── code-line-element.tsx
│ │ ├── code-syntax-leaf-static.tsx
│ │ ├── code-syntax-leaf.tsx
│ │ ├── color-constants.ts
│ │ ├── color-dropdown-menu-items.tsx
│ │ ├── color-dropdown-menu.tsx
│ │ ├── color-input.tsx
│ │ ├── color-picker.tsx
│ │ ├── colors-custom.tsx
│ │ ├── column-element-static.tsx
│ │ ├── column-element.tsx
│ │ ├── column-group-element-static.tsx
│ │ ├── column-group-element.tsx
│ │ ├── command.tsx
│ │ ├── comment-create-form.tsx
│ │ ├── comment-leaf-static.tsx
│ │ ├── comment-leaf.tsx
│ │ ├── comment-toolbar-button.tsx
│ │ ├── comment.tsx
│ │ ├── context-menu.tsx
│ │ ├── cursor-overlay.tsx
│ │ ├── date-element-static.tsx
│ │ ├── date-element.tsx
│ │ ├── dialog.tsx
│ │ ├── draggable.tsx
│ │ ├── dropdown-menu.tsx
│ │ ├── editor-static.tsx
│ │ ├── editor.tsx
│ │ ├── emoji-dropdown-menu.tsx
│ │ ├── emoji-icons.tsx
│ │ ├── emoji-input-element.tsx
│ │ ├── emoji-picker-content.tsx
│ │ ├── emoji-picker-navigation.tsx
│ │ ├── emoji-picker-preview.tsx
│ │ ├── emoji-picker-search-and-clear.tsx
│ │ ├── emoji-picker-search-bar.tsx
│ │ ├── emoji-picker.tsx
│ │ ├── emoji-toolbar-dropdown.tsx
│ │ ├── equation-element-static.tsx
│ │ ├── equation-element.tsx
│ │ ├── equation-popover.tsx
│ │ ├── excalidraw-element.tsx
│ │ ├── export-toolbar-button.tsx
│ │ ├── fixed-toolbar-buttons.tsx
│ │ ├── fixed-toolbar.tsx
│ │ ├── floating-toolbar-buttons.tsx
│ │ ├── floating-toolbar.tsx
│ │ ├── font-size-toolbar-button.tsx
│ │ ├── ghost-text.tsx
│ │ ├── heading-element-static.tsx
│ │ ├── heading-element.tsx
│ │ ├── highlight-leaf-static.tsx
│ │ ├── highlight-leaf.tsx
│ │ ├── history-toolbar-button.tsx
│ │ ├── hr-element-static.tsx
│ │ ├── hr-element.tsx
│ │ ├── image-element-static.tsx
│ │ ├── image-element.tsx
│ │ ├── image-preview.tsx
│ │ ├── import-toolbar-button.tsx
│ │ ├── indent-fire-marker.tsx
│ │ ├── indent-list-toolbar-button.tsx
│ │ ├── indent-todo-marker-static.tsx
│ │ ├── indent-todo-marker.tsx
│ │ ├── indent-todo-toolbar-button.tsx
│ │ ├── indent-toolbar-button.tsx
│ │ ├── inline-combobox.tsx
│ │ ├── inline-equation-element-static.tsx
│ │ ├── inline-equation-element.tsx
│ │ ├── inline-equation-toolbar-button.tsx
│ │ ├── input.tsx
│ │ ├── insert-dropdown-menu.tsx
│ │ ├── kbd-leaf-static.tsx
│ │ ├── kbd-leaf.tsx
│ │ ├── line-height-dropdown-menu.tsx
│ │ ├── link-element-static.tsx
│ │ ├── link-element.tsx
│ │ ├── link-floating-toolbar.tsx
│ │ ├── link-toolbar-button.tsx
│ │ ├── mark-toolbar-button.tsx
│ │ ├── media-audio-element-static.tsx
│ │ ├── media-audio-element.tsx
│ │ ├── media-embed-element.tsx
│ │ ├── media-file-element-static.tsx
│ │ ├── media-file-element.tsx
│ │ ├── media-placeholder-element.tsx
│ │ ├── media-popover.tsx
│ │ ├── media-toolbar-button.tsx
│ │ ├── media-upload-toast.tsx
│ │ ├── media-video-element-static.tsx
│ │ ├── media-video-element.tsx
│ │ ├── mention-element-static.tsx
│ │ ├── mention-element.tsx
│ │ ├── mention-input-element.tsx
│ │ ├── mode-dropdown-menu.tsx
│ │ ├── more-dropdown-menu.tsx
│ │ ├── outdent-toolbar-button.tsx
│ │ ├── paragraph-element-static.tsx
│ │ ├── paragraph-element.tsx
│ │ ├── placeholder.tsx
│ │ ├── popover.tsx
│ │ ├── resizable.tsx
│ │ ├── separator.tsx
│ │ ├── slash-input-element.tsx
│ │ ├── spinner.tsx
│ │ ├── suggestion-leaf-static.tsx
│ │ ├── suggestion-leaf.tsx
│ │ ├── suggestion-line-break.tsx
│ │ ├── suggestion-toolbar-button.tsx
│ │ ├── table-cell-element-static.tsx
│ │ ├── table-cell-element.tsx
│ │ ├── table-dropdown-menu.tsx
│ │ ├── table-element-static.tsx
│ │ ├── table-element.tsx
│ │ ├── table-icons.tsx
│ │ ├── table-row-element-static.tsx
│ │ ├── table-row-element.tsx
│ │ ├── toc-element-static.tsx
│ │ ├── toc-element.tsx
│ │ ├── toggle-element-static.tsx
│ │ ├── toggle-element.tsx
│ │ ├── toggle-toolbar-button.tsx
│ │ ├── toolbar.tsx
│ │ ├── tooltip.tsx
│ │ └── turn-into-dropdown-menu.tsx
│ ├── hooks/
│ │ ├── use-debounce.ts
│ │ ├── use-is-touch-device.ts
│ │ └── use-mounted.ts
│ ├── lib/
│ │ ├── diff-viewer.ts
│ │ └── uploadthing.ts
│ └── styles/
│ └── diff-styles.css
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public/
│ ├── placeholder-logo.png
│ ├── placeholder-logo.svg
│ ├── placeholder-user.jpg
│ ├── placeholder.jpg
│ └── placeholder.svg
├── styles/
│ ├── globals.css
│ └── prosemirror.css
├── tailwind.config.ts
└── tsconfig.json

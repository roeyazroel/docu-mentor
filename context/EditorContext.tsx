"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface EditorContextType {
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
}

// Create context with default values
const EditorContext = createContext<EditorContextType>({
  documentTitle: "Untitled Document",
  setDocumentTitle: () => {},
});

// Provider component
export function EditorContextProvider({ children }: { children: ReactNode }) {
  const [documentTitle, setDocumentTitle] =
    useState<string>("Untitled Document");

  const value = {
    documentTitle,
    setDocumentTitle,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

// Custom hook for using the context
export function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error(
      "useEditorContext must be used within an EditorContextProvider"
    );
  }
  return context;
}

"use client";

import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorContextProvider } from "@/context/EditorContext";
import React from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EditorContextProvider>
      <div className="flex flex-col h-screen">
        <EditorHeader />
        {children}
      </div>
    </EditorContextProvider>
  );
}

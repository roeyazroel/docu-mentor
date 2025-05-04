"use client";

import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorContextProvider } from "@/context/EditorContext";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Initializing editor...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // redirect to /sign-in
    redirect("/sign-in");
  }

  return (
    <EditorContextProvider>
      <div className="flex flex-col h-screen">
        <EditorHeader />
        {children}
      </div>
    </EditorContextProvider>
  );
}

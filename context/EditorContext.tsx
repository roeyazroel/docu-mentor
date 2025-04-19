"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// User type for the context
export interface EditorUser {
  id: string;
  name: string;
  image?: string;
}

interface EditorContextType {
  documentTitle: string;
  activeOrganization: string | null;
  user: EditorUser | null;
  setDocumentTitle: (title: string) => void;
  setActiveOrganization: (organization: string | null) => void;
}

// Create context with default values
const EditorContext = createContext<EditorContextType>({
  documentTitle: "Untitled Document",
  activeOrganization: null,
  user: null,
  setDocumentTitle: () => {},
  setActiveOrganization: () => {},
});

// Provider component
export function EditorContextProvider({ children }: { children: ReactNode }) {
  const [documentTitle, setDocumentTitle] =
    useState<string>("Untitled Document");
  const [activeOrganization, setActiveOrganization] = useState<string | null>(
    null
  );
  const [editorUser, setEditorUser] = useState<EditorUser | null>(null);
  const { organization } = useOrganization();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      return;
    }

    // Set user information
    setEditorUser({
      id: user.id,
      name: user.fullName || user.username || "Anonymous User",
      image: user.imageUrl,
    });

    if (!organization) {
      console.log("setting active organization to user id", user.id);
      setActiveOrganization(user.id);
    }

    if (organization) {
      console.log(
        "setting active organization to organization id",
        organization.id
      );
      setActiveOrganization(organization.id);
    }
  }, [user, organization]);

  const value = {
    documentTitle,
    activeOrganization,
    user: editorUser,
    setDocumentTitle,
    setActiveOrganization,
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

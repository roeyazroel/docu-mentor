export interface Document {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  updatedAt: string;
  path: string;
  children?: string[];
}

export type ViewMode = "grid" | "list";

export interface FilterOptions {
  searchQuery: string;
  parentId: string | null;
}

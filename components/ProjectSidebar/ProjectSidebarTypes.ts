// Sidebar-related types for the ProjectSidebar and its subcomponents

/**
 * Supported storage providers for the project sidebar.
 */
export type StorageProvider = "local" | "google-drive" | "dropbox" | "box";

/**
 * Represents a file item in the sidebar tree.
 */
export type FileItem = {
  id: string;
  name: string;
  type: "file";
  content: string;
  provider: StorageProvider;
  iconColor?: string;
};

/**
 * Represents a folder item in the sidebar tree.
 */
export type FolderItem = {
  id: string;
  name: string;
  type: "folder";
  children: (FileItem | FolderItem)[];
  expanded?: boolean;
  provider: StorageProvider;
  iconColor?: string;
};

/**
 * Union type for any item in the sidebar tree.
 */
export type ProjectItem = FileItem | FolderItem;

/**
 * Props for the ProjectSidebar component.
 */
export interface ProjectSidebarProps {
  items: ProjectItem[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onUpdateItems: (items: ProjectItem[]) => void;
}

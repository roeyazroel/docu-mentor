/**
 * Provides client-side WebSocket operations for organization-specific file management.
 */

import { ProjectItem } from "@/components/ProjectSidebar/ProjectSidebarTypes";
import { WebSocketManager } from "./WebSocketManager";

export { WebSocketManager } from "./WebSocketManager";
export type { ConnectionStatus } from "./WebSocketManager";

export type FileNode = {
  id: string;
  type: "file" | "folder";
  name: string;
  content?: string;
  parentId: string | null;
  children?: string[];
};

export type FilesList = Record<string, FileNode>;

/**
 * User presence related message types
 */
export type UserPresenceMessage = {
  type: "join_file" | "leave_file";
  path: string;
  userId: string;
  userName?: string;
  avatar?: string;
};

export type OnlineUsersMessage = {
  type: "online_users";
  path: string;
  users: string[];
  userNames?: string[];
  avatars?: string[];
};

export type UserJoinedMessage = {
  type: "user_joined";
  path: string;
  userId: string;
  userName?: string;
  avatar?: string;
};

export type UserLeftMessage = {
  type: "user_left";
  path: string;
  userId: string;
};

/**
 * File/Folder operation message types
 */
export type FileRenamedMessage = {
  type: "file_renamed";
  id: string;
  oldName: string;
  newName: string;
  parentId: string | null;
  organizationId: string;
  lastUpdated?: string;
};

export type FileMovedMessage = {
  type: "file_moved";
  id: string;
  name: string;
  oldParentId: string | null;
  newParentId: string | null;
  organizationId: string;
  lastUpdated?: string;
};

export type FolderRenamedMessage = {
  type: "folder_renamed";
  id: string;
  oldName: string;
  newName: string;
  parentId: string | null;
  organizationId: string;
};

export type FolderMovedMessage = {
  type: "folder_moved";
  id: string;
  name: string;
  oldParentId: string | null;
  newParentId: string | null;
  organizationId: string;
};

/**
 * Builds a hierarchical tree of ProjectItem objects from the flat structure returned by the backend
 * @param files The flat files structure from the backend
 * @returns An array of ProjectItem objects with proper parent-child relationships
 */
export function buildFileHierarchy(files: FilesList): ProjectItem[] {
  // Step 1: Create a map of all items
  const itemsMap = new Map<string, ProjectItem>();

  // First create all items
  Object.values(files).forEach((node) => {
    const item: ProjectItem =
      node.type === "file"
        ? {
            id: node.id,
            name: node.name,
            type: "file",
            content: node.content || "",
            provider: "local",
          }
        : {
            id: node.id,
            name: node.name,
            type: "folder",
            children: [],
            expanded: true,
            provider: "local",
          };

    itemsMap.set(node.id, item);
  });

  // Step 2: Build the hierarchy
  const rootItems: ProjectItem[] = [];

  // Connect children to parents
  Object.values(files).forEach((node) => {
    const item = itemsMap.get(node.id);
    if (!item) return;

    if (node.parentId) {
      // This item has a parent
      const parent = itemsMap.get(node.parentId);
      if (parent && parent.type === "folder") {
        parent.children.push(item);
      } else {
        // If parent not found, add to root
        rootItems.push(item);
      }
    } else {
      // This is a root item
      rootItems.push(item);
    }
  });

  return rootItems;
}

/**
 * Connects to the backend WebSocket server and sets up listeners.
 * @param onMessage Callback for incoming messages
 * @returns The WebSocket instance
 * @deprecated Use createWebSocketManager instead
 */
export function connectWebSocket(
  onMessage: (event: MessageEvent) => void
): WebSocket {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/ws`;
  const ws = new WebSocket(wsUrl);
  ws.onmessage = onMessage;
  return ws;
}

/**
 * Creates a WebSocketManager instance with automatic reconnection and keep-alive
 * @param onMessage Callback for incoming messages
 * @returns The WebSocketManager instance
 */
export function createWebSocketManager(
  token: string,
  onMessage: (event: MessageEvent) => void
): WebSocketManager {
  const manager = new WebSocketManager(onMessage, token);

  return manager;
}

import { SignedInAuthObject } from "@clerk/backend/internal";
import { WebSocket } from "ws";

// Client type extends WebSocket
export interface Client extends WebSocket {
  userId?: string;
  userName?: string;
  avatarUrl?: string;
  organizationId?: string;
  sessionId?: string;
  lastPingTime?: number; // Timestamp of the last ping sent to the client
  auth?: SignedInAuthObject; // Add auth object from Clerk
}

// Message interface for WebSocket communication
export interface Message {
  type: string;
  path?: string;
  id?: string; // File ID
  name?: string;
  parentId?: string | null;
  userId?: string;
  userName?: string;
  avatar?: string;
  content?: string;
  oldPath?: string;
  newPath?: string;
  oldName?: string;
  newName?: string;
  oldParentId?: string | null;
  newParentId?: string | null;
  organizationId?: string;
  sessionId?: string;
  timestamp?: number; // Used for ping/pong messages
}

// Ping/Pong message types
export interface PingMessage {
  type: "ping";
  timestamp: number;
}

export interface PongMessage {
  type: "pong";
  timestamp: number;
}

// User details type for storing additional user information
export interface UserDetails {
  name: string;
  avatar: string;
}

// FileNode interface for virtual file system
export interface FileNode {
  type: "file" | "folder";
  name: string;
  content?: string;
  parentId: string | null;
  children?: string[];
  id?: string;
}

// In-memory data structures
export const clients: Set<Client> = new Set();
export const fileRooms: Map<string, Set<Client>> = new Map(); // fileId => Set<ws>
export const fileUsers: Map<string, Set<string>> = new Map(); // fileId => Set<userId>
export const userDetails: Map<string, UserDetails> = new Map(); // userId => UserDetails
export const orgClients: Map<string, Set<Client>> = new Map(); // organizationId => Set<ws>
export const fsTree: Record<string, Record<string, FileNode>> = {};

// Path to ID mapping
export const pathToId: Map<string, string> = new Map(); // path => fileId
export const idToPath: Map<string, string> = new Map(); // fileId => path

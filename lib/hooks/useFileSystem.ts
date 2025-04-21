import { ProjectItem } from "@/components/ProjectSidebar/ProjectSidebarTypes";
import {
  findParentById,
  sortItems,
} from "@/components/ProjectSidebar/ProjectSidebarUtils";
import {
  buildFileHierarchy,
  ConnectionStatus,
  createWebSocketManager,
  FilesList,
  WebSocketManager,
} from "@/lib/websocket/client/websocketService";
import { useSession } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { fetchFiles } from "../websocket/client/operations/fetchFiles";
import { joinFileSession } from "../websocket/client/operations/joinFileSession";
import { leaveFileSession } from "../websocket/client/operations/leaveFileSession";
import { requestFileInfo } from "../websocket/client/operations/requestFileInfo";
import { updateFileContent } from "../websocket/client/operations/updateFileContent";
import { createFile } from "./fileOperations/createFile";
import { deleteFile } from "./fileOperations/deleteFile";
import { moveFileOperation } from "./fileOperations/moveFile";
import { renameFileOperation } from "./fileOperations/renameFile";
import { createFolder } from "./folderOperations/createFolder";
import { deleteFolder } from "./folderOperations/deleteFolder";
import { moveFolder } from "./folderOperations/moveFolder";
import { renameFolderOperation } from "./folderOperations/renameFolder";

// Define a type for online user data
export interface OnlineUser {
  id: string;
  name?: string;
  avatar?: string;
  sessionId?: string; // Add sessionId for unique identification
}

// Define a type for access log entries
export interface AccessLogEntry {
  id: string;
  node_id: string;
  user_id: string;
  action: "create" | "read" | "update" | "delete" | "rename" | "move";
  timestamp: string;
  users: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
  };
}

/**
 * React hook for managing file system operations via WebSocket connection
 * Extracted from app/editor/page.tsx to separate concerns
 */
export function useFileSystem(
  activeOrganization: string | null,
  userId?: string,
  userName?: string,
  userAvatar?: string
) {
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [documentContent, setDocumentContent] = useState<string>("");
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [lastSavedTitle, setLastSavedTitle] = useState<string>("");
  const [sessionId] = useState<string>(uuidv4());
  const [token, setToken] = useState<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionStatus>("disconnected");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]); // Add state for access logs
  const [fileVersions, setFileVersions] = useState<any[]>([]); // Add state for file versions
  const [currentVersion, setCurrentVersion] = useState<number | undefined>();
  const previousActiveFileIdRef = useRef<string | null>(null);
  const activeFileIdRef = useRef<string | null>(null); // Ref to hold current activeFileId for stable access in callbacks
  // Add a ref to track items being processed to prevent duplicates
  const processingIdsRef = useRef<Set<string>>(new Set());
  const session = useSession();
  // Keep activeFileIdRef updated
  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  // Update connection state from WebSocketManager
  useEffect(() => {
    if (wsManager) {
      setConnectionState(wsManager.connectionStatus);

      // Setup a periodic check of the connection status
      const statusInterval = setInterval(() => {
        setConnectionState(wsManager.connectionStatus);
      }, 1000);

      return () => clearInterval(statusInterval);
    }
  }, [wsManager]);

  useEffect(() => {
    const getToken = async () => {
      const token = await session.session?.getToken();
      if (!token) return;
      setToken(token);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (!activeOrganization || !token) return;

    // Create WebSocketManager with message handler
    const manager = createWebSocketManager(token, (event: MessageEvent) => {
      console.log("[useFileSystem] Received message:", event.data);
      try {
        const data = JSON.parse(event.data);
        const currentActiveFileId = activeFileIdRef.current; // Use ref for current ID

        // --- Handle Presence Messages ---
        if (data.path !== currentActiveFileId) {
          // Skip presence messages for non-active files
          if (
            ["online_users", "user_joined", "user_left"].includes(data.type)
          ) {
            console.log(
              `[Presence] Ignoring message for non-active file: ${data.path} (active: ${currentActiveFileId})`
            );
            return;
          }

          // Skip content messages for non-active files
          if (
            ["file_updated", "file_info"].includes(data.type) &&
            data.id !== currentActiveFileId
          ) {
            console.log(
              `[Content] Ignoring message for non-active file: ${data.id} (active: ${currentActiveFileId})`
            );
            return;
          }
        }

        // Handle presence messages
        switch (data.type) {
          case "online_users": {
            const users = (data.users || []).map(
              (id: string, index: number) => ({
                id: id,
                name: data.userNames?.[index],
                avatar: data.avatars?.[index],
                sessionId: data.sessionIds?.[index],
              })
            );
            setOnlineUsers(users);
            console.log("[Presence] Received online users:", users);
            return;
          }

          case "user_joined": {
            setOnlineUsers((prev) => {
              if (prev.some((u) => u.sessionId === data.sessionId)) return prev;
              const newUser: OnlineUser = {
                id: data.userId,
                name: data.userName,
                avatar: data.avatar,
                sessionId: data.sessionId,
              };
              console.log("[Presence] User joined:", newUser);
              return [...prev, newUser];
            });
            return;
          }

          case "user_left": {
            setOnlineUsers((prev) => {
              const remaining = prev.filter(
                (u) => u.sessionId !== data.sessionId
              );
              console.log("[Presence] User left, remaining:", remaining);
              return remaining;
            });
            return;
          }
        }

        // Skip processing for files already being processed
        if (
          ["file_created", "folder_created", "file_info"].includes(data.type) &&
          data.id &&
          processingIdsRef.current.has(data.id)
        ) {
          console.warn(
            `[WebSocket] Creation/info message for ID ${data.id} already being processed, skipping`
          );
          return;
        }

        // Handle file system messages
        switch (data.type) {
          case "file_updated": {
            if (data.id === currentActiveFileId && data.content !== undefined) {
              // Always update document content for the active file
              console.log(
                `[WebSocket] Updating content for active file: ${data.id}`
              );
              setDocumentContent(data.content);

              // For updating the item in projectItems, check if it exists
              if (findItemById(data.id, projectItems)) {
                handleItemUpdated(data);
              } else if (!processingIdsRef.current.has(data.id)) {
                // If not found and not processing, request info
                if (wsManager && activeOrganization) {
                  console.log(
                    `[WebSocket] File ${data.id} not found locally, requesting info`
                  );
                  requestFileInfo(wsManager, data.id, activeOrganization);
                }
              }
            } else if (data.id !== currentActiveFileId) {
              // If file_updated but not for current file, still update metadata
              handleItemUpdated(data);
            }

            // Update file versions if they're present in the response
            if (data.history) {
              console.log(
                `[WebSocket] Received file history with ${data.history.length} versions`
              );
              setFileVersions(data.history);
            }

            // Update current version if present
            if (data.version) {
              setCurrentVersion(data.version);
            }

            break;
          }

          case "file_info": {
            if (data.id === currentActiveFileId && data.content !== undefined) {
              // Update content directly
              setDocumentContent(data.content);
            }
            // Let handleFileInfo handle metadata update
            handleFileInfo(data);

            // Update file versions if they're present in the response
            if (data.history) {
              console.log(
                `[WebSocket] Received file history with ${data.history.length} versions`
              );
              setFileVersions(data.history);
            }

            // Update current version if present
            if (data.version) {
              setCurrentVersion(data.version);
            }

            break;
          }

          case "file_created":
          case "folder_created": {
            handleFileCreated(data);
            break;
          }

          case "folder_updated": {
            handleItemUpdated(data);
            break;
          }

          case "file_deleted":
          case "folder_deleted": {
            handleItemDeleted(data);
            break;
          }

          case "file_renamed": {
            if (!data.id || !data.newName) {
              console.warn("[file_renamed] Missing required data", data);
              break;
            }
            updateItemInTree(data.id, { name: data.newName });
            if (activeFileId === data.id) {
              setDocumentTitle(data.newName);
              setLastSavedTitle(data.newName);
            }
            break;
          }

          case "folder_renamed": {
            if (!data.id || !data.newName) {
              console.warn("[folder_renamed] Missing required data", data);
              break;
            }
            updateItemInTree(data.id, { name: data.newName });
            break;
          }

          case "file_moved": {
            if (!data.id || data.newParentId === undefined) {
              console.warn("[file_moved] Missing required data", data);
              break;
            }
            moveItemToNewParent(data.id, data.newParentId);
            break;
          }

          case "folder_moved": {
            if (!data.id || data.newParentId === undefined) {
              console.warn("[folder_moved] Missing required data", data);
              break;
            }
            moveItemToNewParent(data.id, data.newParentId);
            break;
          }

          case "file_reverted": {
            if (data.id === currentActiveFileId && data.content !== undefined) {
              // Update content when a file is reverted
              console.log(
                `[WebSocket] File reverted: ${data.id} to version: ${data.currentVersion}`
              );
              setDocumentContent(data.content);
              setLastSavedContent(data.content);

              // Update item metadata
              handleItemUpdated(data);
            }
            break;
          }

          case "file_revert_error": {
            console.error(
              `[WebSocket] File revert error for ${data.id}: ${data.error}`
            );
            break;
          }

          default: {
            console.log(`[WebSocket] Unhandled message type: ${data.type}`);
            break;
          }
        }
      } catch (err) {
        console.error("[websocket] Error parsing message:", err);
      }
    });

    setWsManager(manager);

    // Add event handlers
    manager.onOpen(() => {
      console.log("[useFileSystem] WebSocket connection established");

      if (activeOrganization) {
        manager.send({
          type: "join_organization",
          organizationId: activeOrganization,
        });
      }

      fetchFiles(manager, activeOrganization)
        .then((files: FilesList) => {
          const hierarchicalItems = buildFileHierarchy(files);
          const sortedItems = sortItems(hierarchicalItems);
          setProjectItems(sortedItems);

          if (!activeFileId && hierarchicalItems.length > 0) {
            const firstFileId = findFirstFile(sortedItems);
            if (firstFileId) setActiveFileId(firstFileId);
          }
        })
        .catch((error) => {
          console.error("[client] Failed to fetch files", error);
          setProjectItems([]);
        });
    });

    manager.onClose((event) => {
      console.log(
        `[useFileSystem] WebSocket connection closed (code: ${event.code})`
      );
    });

    manager.onError((event) => {
      console.error("[useFileSystem] WebSocket error:", event);
    });

    manager.onReconnect(() => {
      console.log("[useFileSystem] WebSocket reconnected");

      // Re-join organization after reconnect
      if (activeOrganization) {
        manager.send({
          type: "join_organization",
          organizationId: activeOrganization,
        });
      }

      // Re-join file after reconnect
      if (activeFileId) {
        joinFileSession(
          manager,
          activeFileId,
          userId || "anonymous",
          userName || "You",
          userAvatar || "",
          sessionId
        );
      }
    });

    // Connect to WebSocket server
    manager.connect().catch((error) => {
      console.error("[useFileSystem] Failed to connect:", error);
    });

    // --- Cleanup Logic ---
    return () => {
      // Send leave message for the active file on disconnect/unmount
      if (wsManager && wsManager.isConnected && activeFileId && userId) {
        console.log(
          `[Cleanup] Sending leave for file ${activeFileId} before disconnect`
        );
        leaveFileSession(wsManager, activeFileId, userId);
      }
      manager.disconnect();
    };
    // --- End Cleanup Logic ---
  }, [activeOrganization, token]);

  useEffect(() => {
    if (!wsManager || !activeOrganization || !wsManager.isConnected) return;

    if (activeFileId) {
      // Join the file session first
      joinFileSession(
        wsManager,
        activeFileId,
        userId || "anonymous",
        userName || "You",
        userAvatar || "",
        sessionId
      );

      // Always request file info when joining a file, not just if it doesn't exist locally
      // This ensures we get the most up-to-date content from the server
      console.log(
        `[useFileSystem] Requesting info for file ${activeFileId} after joining`
      );
      requestFileInfo(wsManager, activeFileId, activeOrganization);
    }
  }, [
    wsManager,
    activeFileId,
    sessionId,
    activeOrganization,
    userId,
    userName,
    userAvatar,
  ]);

  // Effect to update document title when active file changes or item metadata updates
  useEffect(() => {
    if (activeFileId) {
      const itemData = findItemById(activeFileId, projectItems); // Find the item, not just content
      if (itemData && itemData.type === "file") {
        // Only set the title based on the projectItems state
        // Content is set directly via WebSocket message handler
        setDocumentTitle(itemData.name);
        setLastSavedTitle(itemData.name);

        // If the file has content in projectItems, set it directly
        if (itemData.content !== undefined) {
          setDocumentContent(itemData.content);
          setLastSavedContent(itemData.content);
        }
        // Otherwise, request the content if we have a connection
        else if (wsManager && wsManager.isConnected && activeOrganization) {
          console.log(
            `[useFileSystem] Requesting content for file ${activeFileId} - not found locally`
          );
          requestFileInfo(wsManager, activeFileId, activeOrganization);
        }
      }
    } else {
      // Clear title if no file is active
      setDocumentTitle("");
      setLastSavedTitle("");
    }
  }, [activeFileId, projectItems, wsManager, activeOrganization]);

  const findFirstFile = (items: ProjectItem[]): string | null => {
    for (const item of items) {
      if (item.type === "file") {
        return item.id;
      } else if (item.type === "folder" && item.children?.length > 0) {
        const fileId = findFirstFile(item.children);
        if (fileId) return fileId;
      }
    }
    return null;
  };

  const findFileContent = (
    items: ProjectItem[],
    fileId: string
  ): { content: string; name: string } | null => {
    for (const item of items) {
      if (item.type === "file" && item.id === fileId) {
        return { content: item.content, name: item.name };
      } else if (item.type === "folder" && item.children) {
        const content = findFileContent(item.children, fileId);
        if (content) return content;
      }
    }
    return null;
  };

  const handleFileCreated = (data: any) => {
    if (!data.id || !data.name) return;

    // Check if an item with this ID already exists to prevent duplicates
    const existingItem = findItemById(data.id, projectItems);

    // First check if we're already processing this ID to prevent duplicates
    if (processingIdsRef.current.has(data.id)) {
      console.warn(
        `[handleFileCreated] Item with ID ${data.id} is already being processed, skipping`
      );
      return;
    }

    // If item already exists in the tree, just update it
    if (existingItem) {
      console.warn(
        `[handleFileCreated] Item with ID ${data.id} already exists, updating instead of creating`
      );
      handleItemUpdated(data);
      return;
    }

    // Add to processing set to prevent concurrent creation of the same item
    processingIdsRef.current.add(data.id);

    const newItem: ProjectItem =
      data.type === "file_created"
        ? {
            id: data.id,
            name: data.name,
            type: "file",
            content: data.content || "",
            provider: "local",
          }
        : {
            id: data.id,
            name: data.name,
            type: "folder",
            children: [],
            expanded: true,
            provider: "local",
          };

    if (data.parentId) {
      const updateParentChildren = (items: ProjectItem[]): ProjectItem[] => {
        return items.map((item) => {
          if (item.id === data.parentId && item.type === "folder") {
            const updatedChildren = [...item.children, newItem];
            const sortedChildren = sortItems(updatedChildren);
            return {
              ...item,
              children: sortedChildren,
              expanded: true,
            };
          } else if (item.type === "folder" && item.children.length > 0) {
            return {
              ...item,
              children: updateParentChildren(item.children),
            };
          }
          return item;
        });
      };

      setProjectItems((prev) => updateParentChildren(prev));
    } else {
      setProjectItems((prev) => sortItems([...prev, newItem]));
    }

    if (data.type === "file_created" && data.sessionId === sessionId) {
      setActiveFileId(data.id);
    }

    // Remove from processing set after a delay to handle potential race conditions
    setTimeout(() => {
      processingIdsRef.current.delete(data.id);
    }, 50);
  };

  const handleItemDeleted = (data: any) => {
    if (!data.id) return;

    const removeItem = (items: ProjectItem[]): ProjectItem[] => {
      return items.filter((item) => {
        if (item.id === data.id) {
          return false;
        } else if (item.type === "folder") {
          item.children = removeItem(item.children);
        }
        return true;
      });
    };

    setProjectItems((prev) => removeItem(prev));

    if (activeFileId === data.id) {
      setActiveFileId(null);
      setDocumentContent("");
      setDocumentTitle("");
    }
  };

  const handleItemUpdated = (data: any) => {
    if (!data.id) return;
    const currentActiveFileId = activeFileIdRef.current; // Use ref for current ID

    const existingItem = findItemById(data.id, projectItems);

    // Special case: this might be an update for a file currently being created
    // but not yet added to projectItems. In this case, ignore it - we're still processing the creation.
    if (!existingItem && processingIdsRef.current.has(data.id)) {
      console.log(
        `[handleItemUpdated] Update received for ID ${data.id} still being processed, will be updated when created`
      );
      return;
    }

    // If the item doesn't exist and it's not in processing, request its info
    if (!existingItem) {
      if (wsManager && activeOrganization) {
        console.log(
          `[handleItemUpdated] Item with ID ${data.id} not found, requesting full info`
        );
        // import("@/lib/websocket/client/websocketService").then((module) => {
        //   module.requestFileInfo(wsManager, data.id, activeOrganization);
        // });
        requestFileInfo(wsManager, data.id, activeOrganization);
      }
      return;
    }

    const updateItemInTree = (items: ProjectItem[]): ProjectItem[] => {
      return items.map((item) => {
        if (item.id === data.id) {
          const updatedItem = {
            ...item,
            name: data.name !== undefined ? data.name : item.name,
          };

          if (item.type === "file" && data.content !== undefined) {
            // Update the content within the project item structure
            (updatedItem as ProjectItem & { content: string }).content =
              data.content;

            // Update last saved state ONLY if it's the active file
            if (currentActiveFileId === data.id) {
              // Also update the current document content to ensure it's always in sync
              setDocumentContent(data.content);
              setLastSavedContent(data.content);
              setLastSavedTitle(updatedItem.name);
            }
          }

          return updatedItem;
        } else if (item.type === "folder") {
          return {
            ...item,
            children: updateItemInTree(item.children),
          };
        }
        return item;
      });
    };

    let updatedItems = [...projectItems];
    if (data.parentId !== undefined) {
      const item = findItemById(data.id, updatedItems);
      const originalParent = findParentById(data.id, updatedItems);

      if (item && originalParent?.id !== data.parentId) {
        updatedItems = removeItemFromParent(updatedItems, data.id);

        if (data.parentId) {
          updatedItems = addItemToParent(updatedItems, item, data.parentId);
        } else {
          updatedItems.push(item);
        }

        updatedItems = sortItems(updatedItems);
      } else {
        updatedItems = updateItemInTree(updatedItems);
      }
    } else {
      updatedItems = updateItemInTree(updatedItems);
    }

    setProjectItems(updatedItems);
  };

  const handleFileInfo = (data: any) => {
    if (!data.id) return;

    // Check if we're already processing this ID
    if (processingIdsRef.current.has(data.id)) {
      console.warn(
        `[handleFileInfo] Item with ID ${data.id} is already being processed, skipping`
      );
      return;
    }

    // First check for existing item
    const existingItem = findItemById(data.id, projectItems);
    console.log("[handleFileInfo] Existing item:", existingItem);

    // Update document content if this is for the active file
    const currentActiveFileId = activeFileIdRef.current;
    if (data.id === currentActiveFileId && data.content !== undefined) {
      console.log(
        `[handleFileInfo] Updating content for active file: ${data.id}`
      );
      setDocumentContent(data.content);
      setLastSavedContent(data.content);
    }

    // Set accessLogs if present in the WebSocket message
    if (data.id === currentActiveFileId && Array.isArray(data.accessLogs)) {
      setAccessLogs(data.accessLogs);
    }

    if (existingItem) {
      // Item exists, just update it
      handleItemUpdated(data);
    } else {
      // Item doesn't exist, add it to processing cache to prevent duplicates
      processingIdsRef.current.add(data.id);

      console.log(`[handleFileInfo] Creating new item for ID ${data.id}`);
      // Create the item directly
      handleFileCreated({
        ...data,
        type: data.type === "file_info" ? "file_created" : "folder_created",
      });

      // Remove from processing cache after a short delay
      setTimeout(() => {
        processingIdsRef.current.delete(data.id);
      }, 50);
    }
  };

  const findItemById = (
    id: string,
    items: ProjectItem[]
  ): ProjectItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.type === "folder") {
        const found = findItemById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const removeItemFromParent = (
    items: ProjectItem[],
    itemId: string
  ): ProjectItem[] => {
    return items
      .map((item) => {
        if (item.type === "folder") {
          return {
            ...item,
            children: item.children
              .filter((child) => child.id !== itemId)
              .map((child) =>
                child.type === "folder"
                  ? {
                      ...child,
                      children: removeItemFromParent(child.children, itemId),
                    }
                  : child
              ),
          };
        }
        return item;
      })
      .filter((item) => item.id !== itemId);
  };

  const addItemToParent = (
    items: ProjectItem[],
    item: ProjectItem,
    parentId: string
  ): ProjectItem[] => {
    return items.map((current) => {
      if (current.id === parentId && current.type === "folder") {
        return {
          ...current,
          children: sortItems([...current.children, item]),
          expanded: true,
        };
      } else if (current.type === "folder") {
        return {
          ...current,
          children: addItemToParent(current.children, item, parentId),
        };
      }
      return current;
    });
  };

  const saveDocument = useCallback((): boolean => {
    if (
      !activeFileId ||
      !activeOrganization ||
      !wsManager ||
      !wsManager.isConnected
    ) {
      console.warn(
        "[saveDocument] Aborted: Not connected or required info missing."
      );
      return false;
    }

    let changesMade = false;

    const updateFile = (items: ProjectItem[]): ProjectItem[] => {
      return items.map((item) => {
        if (item.type === "file" && item.id === activeFileId) {
          const contentChanged = item.content !== documentContent;
          const titleChanged = item.name !== documentTitle;

          if (contentChanged || titleChanged) {
            updateFileContent(
              wsManager,
              item.id,
              documentContent,
              activeOrganization,
              sessionId // Make sure you have access to the sessionId
            );
            changesMade = true;
          }

          setLastSavedContent(documentContent);
          setLastSavedTitle(documentTitle);

          return { ...item, content: documentContent, name: documentTitle };
        } else if (item.type === "folder") {
          return {
            ...item,
            children: updateFile(item.children),
          };
        }
        return item;
      });
    };

    setProjectItems(updateFile(projectItems));
    return changesMade;
  }, [
    activeFileId,
    activeOrganization,
    wsManager,
    documentContent,
    documentTitle,
    projectItems,
    sessionId,
  ]);

  const hasUnsavedChanges = useCallback((): boolean => {
    if (!activeFileId) return false;

    return (
      documentContent !== lastSavedContent || documentTitle !== lastSavedTitle
    );
  }, [
    activeFileId,
    documentContent,
    documentTitle,
    lastSavedContent,
    lastSavedTitle,
  ]);

  const createFileItem = useCallback(
    (name: string, parentId: string | null = null, content: string = "") => {
      if (!activeOrganization || !wsManager) return;
      createFile(
        wsManager,
        activeOrganization,
        sessionId,
        name,
        parentId,
        content
      );
    },
    [activeOrganization, wsManager, sessionId]
  );

  const deleteFileItem = useCallback(
    (fileId: string) => {
      if (!activeOrganization || !wsManager) return;
      deleteFile(wsManager, activeOrganization, sessionId, fileId);
    },
    [activeOrganization, wsManager, sessionId]
  );

  const renameFileItem = useCallback(
    (fileId: string, newName: string) => {
      if (!activeOrganization || !wsManager) return;
      renameFileOperation(wsManager, fileId, newName, activeOrganization);
    },
    [activeOrganization, wsManager]
  );

  const moveFileItem = useCallback(
    (fileId: string, newParentId: string | null) => {
      if (!activeOrganization || !wsManager) return;
      moveFileOperation(wsManager, fileId, newParentId, activeOrganization);
    },
    [activeOrganization, wsManager]
  );

  const createFolderItem = useCallback(
    (name: string, parentId: string | null = null) => {
      if (!activeOrganization || !wsManager) return;
      createFolder(wsManager, activeOrganization, sessionId, name, parentId);
    },
    [activeOrganization, wsManager, sessionId]
  );

  const deleteFolderItem = useCallback(
    (folderId: string) => {
      if (!activeOrganization || !wsManager) return;
      deleteFolder(wsManager, activeOrganization, sessionId, folderId);
    },
    [activeOrganization, wsManager, sessionId]
  );

  const renameFolderItem = useCallback(
    (folderId: string, newName: string) => {
      if (!activeOrganization || !wsManager) return;
      renameFolderOperation(wsManager, folderId, newName, activeOrganization);
    },
    [activeOrganization, wsManager]
  );

  const moveFolderItem = useCallback(
    (folderId: string, newParentId: string | null) => {
      if (!activeOrganization || !wsManager) return;
      moveFolder(wsManager, folderId, newParentId, activeOrganization);
    },
    [activeOrganization, wsManager]
  );

  const handleFileSelect = useCallback((fileId: string) => {
    setActiveFileId(fileId);
  }, []);

  const updateItemParent = useCallback(
    (itemId: string, parentId: string | null, itemType: "file" | "folder") => {
      if (!activeOrganization || !wsManager) return;

      if (itemType === "file") {
        moveFileItem(itemId, parentId);
      } else {
        moveFolderItem(itemId, parentId);
      }
    },
    [activeOrganization, wsManager, moveFileItem, moveFolderItem]
  );

  // --- Effect to Handle File Switching (Leave/Join) ---
  useEffect(() => {
    const previousActiveFileId = previousActiveFileIdRef.current;
    const currentActiveFileId = activeFileId; // Use state variable directly here

    // If we switched from one file to another
    if (
      wsManager &&
      wsManager.isConnected &&
      userId &&
      previousActiveFileId && // Ensure there was a previous file
      previousActiveFileId !== currentActiveFileId // Ensure it's a different file
    ) {
      console.log(
        `[Switching] Sending leave for previous file: ${previousActiveFileId}`
      );
      leaveFileSession(wsManager, previousActiveFileId, userId);
      setOnlineUsers([]); // Clear old user list immediately
    }

    // Update the ref *after* potentially sending leave
    // This ref stores the ID of the file we just switched *from*.
    previousActiveFileIdRef.current = currentActiveFileId;

    // Logic to join the new file room (only if switching TO a file)
    if (
      wsManager &&
      wsManager.isConnected &&
      currentActiveFileId && // Ensure there's a new file selected
      userId &&
      currentActiveFileId !== previousActiveFileId // Ensure we are not joining the same file again unnecessarily
    ) {
      console.log(
        `[Switching/Joining] Sending join for current file: ${currentActiveFileId}`
      );
      joinFileSession(
        wsManager,
        currentActiveFileId,
        userId,
        userName || "You",
        userAvatar || "",
        sessionId
      );

      // Only request file info if:
      // 1. We don't already have it locally
      // 2. We're not already processing this ID
      // 3. We have an active organization
      if (
        activeOrganization &&
        !findItemById(currentActiveFileId, projectItems) &&
        !processingIdsRef.current.has(currentActiveFileId)
      ) {
        console.log(
          `[Switching/Joining] Requesting info for file ${currentActiveFileId} - not found locally`
        );

        // Add to processing set before requesting
        processingIdsRef.current.add(currentActiveFileId);

        requestFileInfo(wsManager, currentActiveFileId, activeOrganization);

        // Remove from processing set after a delay
        setTimeout(() => {
          processingIdsRef.current.delete(currentActiveFileId);
        }, 50);
      } else {
        console.log(
          `[Switching/Joining] File ${currentActiveFileId} already exists locally or is being processed, skipping info request`
        );
      }
    } else if (!currentActiveFileId) {
      // If no file is active (e.g., switched to null), clear the user list
      setOnlineUsers([]);
    }

    // Note: We don't include wsManager, userId, userName, userAvatar in deps
    // because we only want this effect to run when activeFileId changes.
    // The checks inside handle the case where dependencies aren't ready.
  }, [
    activeFileId,
    wsManager,
    userId,
    userName,
    userAvatar,
    sessionId,
    activeOrganization,
    projectItems, // Add projectItems to dependencies since we now check it
  ]); // Added activeOrganization and sessionId to deps
  // --- End File Switching Effect ---

  /**
   * Helper function to update an item's properties in the project tree
   */
  const updateItemInTree = (itemId: string, updates: Partial<ProjectItem>) => {
    setProjectItems((prevItems) => {
      return updateItemProperties(prevItems, itemId, updates);
    });
  };

  /**
   * Recursively updates an item's properties in a tree of ProjectItems
   */
  const updateItemProperties = (
    items: ProjectItem[],
    itemId: string,
    updates: Partial<ProjectItem>
  ): ProjectItem[] => {
    return items.map((item) => {
      if (item.id === itemId) {
        // Update this item with the new properties while preserving the type
        if (item.type === "file") {
          return { ...item, ...updates, type: "file" } as ProjectItem;
        } else {
          return { ...item, ...updates, type: "folder" } as ProjectItem;
        }
      } else if (item.type === "folder") {
        // Recursively process children of folders
        return {
          ...item,
          children: updateItemProperties(item.children, itemId, updates),
        } as ProjectItem;
      }
      return item;
    });
  };

  /**
   * Helper function to move an item to a new parent in the project tree
   */
  const moveItemToNewParent = (itemId: string, newParentId: string | null) => {
    const item = findItemById(itemId, projectItems);
    if (!item) {
      console.warn(
        `[moveItemToNewParent] Item ${itemId} not found in project tree`
      );
      return;
    }

    // First remove the item from its old location
    let updatedItems = removeItemFromParent(projectItems, itemId);

    // Create a deep clone of the item to avoid reference issues
    const clonedItem: ProjectItem =
      item.type === "file"
        ? { ...item, type: "file" }
        : {
            ...item,
            type: "folder",
            children: [...item.children], // Clone children array
          };

    // Then add the cloned item to its new parent
    if (newParentId) {
      updatedItems = addItemToParent(updatedItems, clonedItem, newParentId);
    } else {
      // If newParentId is null, add to root
      updatedItems.push(clonedItem);
    }

    // Sort and update
    setProjectItems(sortItems(updatedItems));

    // Add debug log to verify update
    console.log(
      `[moveItemToNewParent] Item ${itemId} moved to parent ${newParentId}`,
      updatedItems
    );
  };

  // Add a function to revert to a specific version
  const revertToVersion = useCallback(
    (fileId: string, version: number): Promise<void> => {
      if (!wsManager || !wsManager.isConnected || !activeOrganization) {
        return Promise.reject(new Error("WebSocket connection is not open"));
      }

      return new Promise<void>((resolve, reject) => {
        // Setup one-time message handler for the revert response
        const handleMessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);

            // Handle successful revert
            if (data.type === "file_reverted" && data.id === fileId) {
              wsManager.removeEventListener("message", handleMessage);
              resolve();
            }

            // Handle revert errors
            if (data.type === "file_revert_error" && data.id === fileId) {
              wsManager.removeEventListener("message", handleMessage);
              reject(new Error(data.error));
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        // Add temporary message listener
        wsManager.addEventListener("message", handleMessage);

        // Send revert message
        wsManager.send({
          type: "revert_file_version",
          path: fileId,
          organizationId: activeOrganization,
          sessionId,
          version,
        });

        // Set a timeout to clean up and reject if no response
        setTimeout(() => {
          wsManager.removeEventListener("message", handleMessage);
          reject(new Error("Revert operation timed out"));
        }, 10000);
      });
    },
    [wsManager, activeOrganization, sessionId]
  );

  return {
    ws: wsManager,
    projectItems,
    setProjectItems,
    activeFileId,
    setActiveFileId,
    documentTitle,
    setDocumentTitle,
    documentContent,
    setDocumentContent,
    lastSavedContent,
    lastSavedTitle,
    sessionId,
    connectionState,

    saveDocument,
    createFile: createFileItem,
    createFolder: createFolderItem,
    handleFileSelect,
    deleteFile: deleteFileItem,
    deleteFolder: deleteFolderItem,
    updateItemParent,
    renameFileItem,
    renameFolderItem,
    moveFileItem,
    moveFolderItem,
    hasUnsavedChanges,
    onlineUsers,
    accessLogs,
    fileVersions,
    revertToVersion,
    currentVersion,
  };
}

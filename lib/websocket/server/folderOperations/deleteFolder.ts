import {
  deleteNode,
  getNodeById,
  getNodesByParentId,
  logFileAccess,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core folder deletion logic that can be used with or without WebSockets
 */
export async function deleteFolder(
  folderId: string,
  organizationId: string,
  userId: string
): Promise<boolean> {
  if (!folderId) {
    console.log(`[delete_folder] Missing folder ID in org: ${organizationId}`);
    return false;
  }

  try {
    // Get folder from database
    const folderNode = await getNodeById(folderId);

    if (folderNode && folderNode.type === "folder") {
      console.log(
        `[delete_folder] Deleting folder: ${folderId} in org: ${organizationId}`
      );

      // Recursively delete all children from database
      const deleteNodeRecursively = async (nodeId: string) => {
        // First get all children
        const children = await getNodesByParentId(nodeId, organizationId);

        // Delete each child recursively
        for (const child of children) {
          await deleteNodeRecursively(child.id);
        }

        // Delete the node itself
        await deleteNode(nodeId);
        await logFileAccess(nodeId, userId, "delete");
      };

      // Start recursive deletion
      await deleteNodeRecursively(folderId);

      // For backward compatibility with in-memory system
      if (fsTree[organizationId] && fsTree[organizationId][folderId]) {
        // Remove folder from parent's children array
        const parentId = fsTree[organizationId][folderId].parentId;
        if (parentId && fsTree[organizationId][parentId]?.children) {
          fsTree[organizationId][parentId].children = fsTree[organizationId][
            parentId
          ].children.filter((id) => id !== folderId);
        }

        // Recursively delete all children (files and folders) from memory
        const deleteRecursively = (id: string) => {
          const node = fsTree[organizationId][id];

          // If it's a folder with children, delete them first
          if (
            node?.type === "folder" &&
            node.children &&
            node.children.length > 0
          ) {
            // Create a copy of the children array before iterating
            const childrenToDelete = [...node.children];
            childrenToDelete.forEach((childId) => {
              deleteRecursively(childId);
            });
          }

          // Delete the node itself
          delete fsTree[organizationId][id];
        };

        // Start recursive deletion with the target folder
        deleteRecursively(folderId);
      }

      return true;
    } else if (
      fsTree[organizationId] &&
      fsTree[organizationId][folderId]?.type === "folder"
    ) {
      // Fallback to in-memory if not in database
      console.log(
        `[delete_folder] Folder not in database, using in-memory: ${folderId}`
      );

      // Remove folder from parent's children array
      const parentId = fsTree[organizationId][folderId].parentId;
      if (parentId && fsTree[organizationId][parentId]?.children) {
        fsTree[organizationId][parentId].children = fsTree[organizationId][
          parentId
        ].children.filter((id) => id !== folderId);
      }

      // Recursively delete all children (files and folders)
      const deleteRecursively = (id: string) => {
        const node = fsTree[organizationId][id];

        // If it's a folder with children, delete them first
        if (
          node?.type === "folder" &&
          node.children &&
          node.children.length > 0
        ) {
          // Create a copy of the children array before iterating
          const childrenToDelete = [...node.children];
          childrenToDelete.forEach((childId) => {
            deleteRecursively(childId);
          });
        }

        // Delete the node itself
        delete fsTree[organizationId][id];
      };

      // Start recursive deletion with the target folder
      deleteRecursively(folderId);

      return true;
    } else {
      console.log(
        `[delete_folder] Failed to delete folder: ${folderId} in org: ${organizationId} - not found`
      );
      return false;
    }
  } catch (error) {
    console.error(`[delete_folder] Error deleting folder: ${folderId}`, error);
    return false;
  }
}

/**
 * Handles folder deletion operation via WebSocket
 */
export async function handleDeleteFolder(
  ws: Client,
  msg: Message
): Promise<void> {
  const { path: folderId } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  // Guard against undefined values
  if (!folderId) {
    console.log(`[delete_folder] Missing folder ID in org: ${orgId}`);
    return;
  }

  const success = await deleteFolder(folderId, orgId, userId);

  if (success) {
    // Create deletion message
    const deleteMsg = {
      type: "folder_deleted",
      id: folderId,
      organizationId: orgId,
    };

    // Broadcast to all organization clients
    broadcastToOrganization(orgId, deleteMsg, ws);
  }
}

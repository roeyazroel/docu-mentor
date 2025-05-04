import {
  getNodeById,
  getNodePath,
  getNodesByParentId,
  logFileAccess,
  updateNode,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core folder moving logic that can be used with or without WebSockets
 */
export async function moveFolder(
  folderId: string,
  newParentId: string | null,
  organizationId: string,
  userId: string
): Promise<{ success: boolean; folderData: any }> {
  if (!folderId) {
    console.log(`[move_folder] Missing folder ID in org: ${organizationId}`);
    return { success: false, folderData: null };
  }

  if (newParentId === undefined) {
    console.log(
      `[move_folder] Missing parentId for folder: ${folderId} in org: ${organizationId}`
    );
    return { success: false, folderData: null };
  }

  try {
    // Get folder from database
    const folderNode = await getNodeById(folderId);

    if (folderNode && folderNode.type === "folder") {
      const oldParentId = folderNode.parent_id;

      // Only proceed if this is actually a move (parent changed)
      if (newParentId !== oldParentId) {
        console.log(
          `[move_folder] Moving folder: ${folderId} from parent ${oldParentId} to ${newParentId} in org: ${organizationId}`
        );

        // Validate that we're not creating a circular reference
        if (newParentId === folderId) {
          console.log(
            `[move_folder] Cannot move folder to itself: ${folderId}`
          );
          return { success: false, folderData: null };
        }

        // Check if the parent is a child of this folder (would create circular reference)
        const isChildOfFolder = async (
          checkId: string,
          targetFolderId: string
        ): Promise<boolean> => {
          if (checkId === targetFolderId) return true;

          const parentNode = await getNodeById(checkId);
          if (!parentNode || !parentNode.parent_id) return false;

          return isChildOfFolder(parentNode.parent_id, targetFolderId);
        };

        if (newParentId && (await isChildOfFolder(newParentId, folderId))) {
          console.log(
            `[move_folder] Cannot move folder to its own child: ${folderId}`
          );
          return { success: false, folderData: null };
        }

        // Generate new path based on parent
        let newBasePath = "";
        if (newParentId) {
          // If has parent, get parent path and append
          const parentNode = await getNodeById(newParentId);
          if (parentNode) {
            const parentPath = await getNodePath(newParentId);
            newBasePath = `${parentPath}/${folderNode.name}`;
          } else {
            console.log(`[move_folder] Parent node ${newParentId} not found`);
            return { success: false, folderData: null };
          }
        } else {
          // If moving to root
          newBasePath = `/${folderNode.name}`;
        }

        // Update folder in database
        const updatedNode = await updateNode(folderId, {
          parent_id: newParentId === null ? undefined : newParentId,
          path: newBasePath,
        });

        if (updatedNode) {
          // Log access
          await logFileAccess(folderId, userId, "move");

          // Update paths for all children
          const updateChildPaths = async (nodeId: string, basePath: string) => {
            const children = await getNodesByParentId(nodeId, organizationId);

            for (const child of children) {
              const childPath = `${basePath}/${child.name}`;
              await updateNode(child.id, { path: childPath });

              // If it's a folder, recursively update its children
              if (child.type === "folder") {
                await updateChildPaths(child.id, childPath);
              }
            }
          };

          // Update all children's paths
          await updateChildPaths(folderId, newBasePath);

          // For backward compatibility with in-memory system
          if (fsTree[organizationId] && fsTree[organizationId][folderId]) {
            const folder = fsTree[organizationId][folderId];

            // Remove from old parent's children array
            if (oldParentId && fsTree[organizationId][oldParentId]?.children) {
              fsTree[organizationId][oldParentId].children = fsTree[
                organizationId
              ][oldParentId].children.filter((id) => id !== folderId);
            }

            // Add to new parent's children array
            if (newParentId && fsTree[organizationId][newParentId]) {
              if (!fsTree[organizationId][newParentId].children) {
                fsTree[organizationId][newParentId].children = [];
              }
              fsTree[organizationId][newParentId].children.push(folderId);
            }

            // Update folder's parentId
            folder.parentId = newParentId;
          }

          return {
            success: true,
            folderData: {
              id: folderId,
              name: folderNode.name,
              oldParentId,
              newParentId,
            },
          };
        } else {
          console.log(
            `[move_folder] Failed to update folder in database: ${folderId}`
          );
          return { success: false, folderData: null };
        }
      } else {
        console.log(
          `[move_folder] No change in parent for folder: ${folderId} in org: ${organizationId}`
        );
        return { success: false, folderData: null };
      }
    } else if (
      fsTree[organizationId] &&
      fsTree[organizationId][folderId]?.type === "folder"
    ) {
      // Fallback to in-memory
      console.log(
        `[move_folder] Folder not in database, using in-memory: ${folderId}`
      );
      const folder = fsTree[organizationId][folderId];
      const oldParentId = folder.parentId;

      // Only proceed if this is actually a move (parent changed)
      if (newParentId !== oldParentId) {
        // Validate that we're not creating a circular reference
        if (newParentId === folderId) {
          console.log(
            `[move_folder] Cannot move folder to itself: ${folderId}`
          );
          return { success: false, folderData: null };
        }

        // Check if newParentId is a child of this folder (would create circular reference)
        const isChildOfFolder = (
          checkId: string,
          targetFolderId: string
        ): boolean => {
          if (checkId === targetFolderId) return true;

          const node = fsTree[organizationId][checkId];
          if (!node || !node.parentId) return false;

          return isChildOfFolder(node.parentId, targetFolderId);
        };

        if (newParentId && isChildOfFolder(newParentId, folderId)) {
          console.log(
            `[move_folder] Cannot move folder to its own child: ${folderId}`
          );
          return { success: false, folderData: null };
        }

        // Remove from old parent's children array
        if (oldParentId && fsTree[organizationId][oldParentId]?.children) {
          fsTree[organizationId][oldParentId].children = fsTree[organizationId][
            oldParentId
          ].children.filter((id) => id !== folderId);
        }

        // Add to new parent's children array
        if (newParentId && fsTree[organizationId][newParentId]) {
          if (!fsTree[organizationId][newParentId].children) {
            fsTree[organizationId][newParentId].children = [];
          }
          fsTree[organizationId][newParentId].children.push(folderId);
        }

        // Update folder's parentId
        folder.parentId = newParentId;

        return {
          success: true,
          folderData: {
            id: folderId,
            name: folder.name,
            oldParentId,
            newParentId,
          },
        };
      } else {
        console.log(
          `[move_folder] No change in parent for folder: ${folderId} in org: ${organizationId}`
        );
        return { success: false, folderData: null };
      }
    } else {
      console.log(
        `[move_folder] Failed to move folder: ${folderId} in org: ${organizationId} - not found`
      );
      return { success: false, folderData: null };
    }
  } catch (error) {
    console.error(`[move_folder] Error moving folder: ${folderId}`, error);
    return { success: false, folderData: null };
  }
}

/**
 * Handles folder moving operation via WebSocket
 */
export async function handleMoveFolder(
  ws: Client,
  msg: Message
): Promise<void> {
  const { oldPath, parentId } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  if (!oldPath || parentId === undefined) {
    console.log(`[move_folder] Missing required parameters in org: ${orgId}`);
    return;
  }

  const result = await moveFolder(oldPath, parentId, orgId, userId);

  if (result.success && result.folderData) {
    const { id: folderId, name, oldParentId, newParentId } = result.folderData;

    // Create move event
    const moveMsg = {
      type: "folder_moved",
      id: folderId,
      name: name,
      oldParentId: oldParentId,
      newParentId: newParentId,
      organizationId: orgId,
    };

    // Broadcast to all organization clients including the sender
    broadcastToOrganization(orgId, moveMsg, null);

    // Also send the traditional folder_updated for backward compatibility
    const updateMsg = {
      type: "folder_updated",
      id: folderId,
      name: name,
      parentId: newParentId,
      organizationId: orgId,
    };

    // Broadcast update to all organization clients
    broadcastToOrganization(orgId, updateMsg, null);
  }
}

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
 * Handles folder moving operation
 */
export async function handleMoveFolder(
  ws: Client,
  msg: Message
): Promise<void> {
  const { oldPath, parentId } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  // Guard against undefined values
  if (!oldPath) {
    console.log(`[move_folder] Missing folder ID in org: ${orgId}`);
    return;
  }

  if (parentId === undefined) {
    console.log(
      `[move_folder] Missing parentId for folder: ${oldPath} in org: ${orgId}`
    );
    return;
  }

  try {
    // Get folder from database
    const folderNode = await getNodeById(oldPath);
    const folderId = oldPath;

    if (folderNode && folderNode.type === "folder") {
      const oldParentId = folderNode.parent_id;

      // Only proceed if this is actually a move (parent changed)
      if (parentId !== oldParentId) {
        console.log(
          `[move_folder] Moving folder: ${folderId} from parent ${oldParentId} to ${parentId} in org: ${orgId}`
        );

        // Validate that we're not creating a circular reference
        if (parentId === folderId) {
          console.log(
            `[move_folder] Cannot move folder to itself: ${folderId}`
          );
          return;
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

        if (parentId && (await isChildOfFolder(parentId, folderId))) {
          console.log(
            `[move_folder] Cannot move folder to its own child: ${folderId}`
          );
          return;
        }

        // Generate new path based on parent
        let newBasePath = "";
        if (parentId) {
          // If has parent, get parent path and append
          const parentNode = await getNodeById(parentId);
          if (parentNode) {
            const parentPath = await getNodePath(parentId);
            newBasePath = `${parentPath}/${folderNode.name}`;
          } else {
            console.log(`[move_folder] Parent node ${parentId} not found`);
            return;
          }
        } else {
          // If moving to root
          newBasePath = `/${folderNode.name}`;
        }

        // Update folder in database
        const updatedNode = await updateNode(folderId, {
          parent_id: parentId === null ? undefined : parentId,
          path: newBasePath,
        });

        if (updatedNode) {
          // Log access
          await logFileAccess(folderId, userId, "move");

          // Update paths for all children
          const updateChildPaths = async (nodeId: string, basePath: string) => {
            const children = await getNodesByParentId(nodeId, orgId);

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
          if (fsTree[orgId] && fsTree[orgId][folderId]) {
            const folder = fsTree[orgId][folderId];

            // Remove from old parent's children array
            if (oldParentId && fsTree[orgId][oldParentId]?.children) {
              fsTree[orgId][oldParentId].children = fsTree[orgId][
                oldParentId
              ].children.filter((id) => id !== folderId);
            }

            // Add to new parent's children array
            if (parentId && fsTree[orgId][parentId]) {
              if (!fsTree[orgId][parentId].children) {
                fsTree[orgId][parentId].children = [];
              }
              fsTree[orgId][parentId].children.push(folderId);
            }

            // Update folder's parentId
            folder.parentId = parentId;
          }

          // Create move event
          const moveMsg = {
            type: "folder_moved",
            id: folderId,
            name: folderNode.name,
            oldParentId: oldParentId,
            newParentId: parentId,
            organizationId: orgId,
          };

          // Broadcast to all organization clients including the sender
          broadcastToOrganization(orgId, moveMsg, null);

          // Also send the traditional folder_updated for backward compatibility
          const updateMsg = {
            type: "folder_updated",
            id: folderId,
            name: folderNode.name,
            parentId: parentId,
            organizationId: orgId,
          };

          // Broadcast update to all organization clients
          broadcastToOrganization(orgId, updateMsg, null);
        } else {
          console.log(
            `[move_folder] Failed to update folder in database: ${folderId}`
          );
        }
      } else {
        console.log(
          `[move_folder] No change in parent for folder: ${folderId} in org: ${orgId}`
        );
      }
    } else if (fsTree[orgId] && fsTree[orgId][oldPath]?.type === "folder") {
      // Fallback to in-memory
      console.log(
        `[move_folder] Folder not in database, using in-memory: ${folderId}`
      );
      const folder = fsTree[orgId][folderId];
      const oldParentId = folder.parentId;

      // Only proceed if this is actually a move (parent changed)
      if (parentId !== oldParentId) {
        // Remove from old parent's children array
        if (oldParentId && fsTree[orgId][oldParentId]?.children) {
          fsTree[orgId][oldParentId].children = fsTree[orgId][
            oldParentId
          ].children.filter((id) => id !== folderId);
        }

        // Add to new parent's children array
        if (parentId && fsTree[orgId][parentId]) {
          if (!fsTree[orgId][parentId].children) {
            fsTree[orgId][parentId].children = [];
          }
          fsTree[orgId][parentId].children.push(folderId);
        }

        // Update folder's parentId
        folder.parentId = parentId;

        // Create move event
        const moveMsg = {
          type: "folder_moved",
          id: folderId,
          name: folder.name,
          oldParentId: oldParentId,
          newParentId: parentId,
          organizationId: orgId,
        };

        // Broadcast to all organization clients including the sender
        broadcastToOrganization(orgId, moveMsg, null);

        // Also send the traditional folder_updated for backward compatibility
        const updateMsg = {
          type: "folder_updated",
          id: folderId,
          name: folder.name,
          parentId: folder.parentId,
          organizationId: orgId,
        };

        // Broadcast update to all organization clients
        broadcastToOrganization(orgId, updateMsg, null);
      } else {
        console.log(
          `[move_folder] No change in parent for folder: ${folderId} in org: ${orgId}`
        );
      }
    } else {
      console.log(
        `[move_folder] Failed to move folder: ${oldPath} in org: ${orgId} - not found`
      );
    }
  } catch (error) {
    console.error(`[move_folder] Error moving folder: ${oldPath}`, error);
  }
}

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
 * Core folder renaming logic that can be used with or without WebSockets
 */
export async function renameFolder(
  folderId: string,
  newName: string,
  organizationId: string,
  userId: string
): Promise<{ success: boolean; folderData: any }> {
  if (!folderId) {
    console.log(`[rename_folder] Missing folder ID in org: ${organizationId}`);
    return { success: false, folderData: null };
  }

  if (!newName) {
    console.log(
      `[rename_folder] Missing new name for folder: ${folderId} in org: ${organizationId}`
    );
    return { success: false, folderData: null };
  }

  try {
    // Get folder from database
    const folderNode = await getNodeById(folderId);

    if (folderNode && folderNode.type === "folder") {
      const oldName = folderNode.name;

      console.log(
        `[rename_folder] Renaming folder: ${folderId} from "${oldName}" to "${newName}" in org: ${organizationId}`
      );

      // Calculate the new path
      let newBasePath = "";
      if (folderNode.parent_id) {
        const parentPath = await getNodePath(folderNode.parent_id);
        newBasePath = `${parentPath}/${newName}`;
      } else {
        newBasePath = `/${newName}`;
      }

      // Update the folder in the database
      const updatedNode = await updateNode(folderId, {
        name: newName,
        path: newBasePath,
      });

      if (updatedNode) {
        // Log access
        await logFileAccess(folderId, userId, "rename");

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
          // Update name
          fsTree[organizationId][folderId].name = newName;
        }

        return {
          success: true,
          folderData: {
            id: folderId,
            oldName,
            newName,
            parentId: folderNode.parent_id,
          },
        };
      } else {
        console.log(
          `[rename_folder] Failed to update folder in database: ${folderId}`
        );
        return { success: false, folderData: null };
      }
    } else if (
      fsTree[organizationId] &&
      fsTree[organizationId][folderId]?.type === "folder"
    ) {
      // Fallback to in-memory if not in database
      console.log(
        `[rename_folder] Folder not in database, using in-memory: ${folderId}`
      );

      const folder = fsTree[organizationId][folderId];
      const oldName = folder.name;

      console.log(
        `[rename_folder] Renaming folder: ${folderId} from "${oldName}" to "${newName}" in org: ${organizationId}`
      );

      // Update name
      folder.name = newName;

      return {
        success: true,
        folderData: {
          id: folderId,
          oldName,
          newName,
          parentId: folder.parentId,
        },
      };
    } else {
      console.log(
        `[rename_folder] Failed to rename folder: ${folderId} in org: ${organizationId} - not found`
      );
      return { success: false, folderData: null };
    }
  } catch (error) {
    console.error(`[rename_folder] Error renaming folder: ${folderId}`, error);
    return { success: false, folderData: null };
  }
}

/**
 * Handles folder renaming operation via WebSocket
 */
export async function handleRenameFolder(
  ws: Client,
  msg: Message
): Promise<void> {
  const { oldPath, name } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  if (!oldPath || !name) {
    console.log(`[rename_folder] Missing required parameters in org: ${orgId}`);
    return;
  }

  const result = await renameFolder(oldPath, name, orgId, userId);

  if (result.success && result.folderData) {
    const { id: folderId, oldName, newName, parentId } = result.folderData;

    // Create rename event
    const renameMsg = {
      type: "folder_renamed",
      id: folderId,
      oldName: oldName,
      newName: newName,
      parentId: parentId,
      organizationId: orgId,
    };

    // Broadcast to all organization clients including the sender
    broadcastToOrganization(orgId, renameMsg, null);

    // Also send the traditional folder_updated for backward compatibility
    const updateMsg = {
      type: "folder_updated",
      id: folderId,
      name: newName,
      parentId: parentId,
      organizationId: orgId,
    };

    // Broadcast update to all organization clients
    broadcastToOrganization(orgId, updateMsg, null);
  }
}

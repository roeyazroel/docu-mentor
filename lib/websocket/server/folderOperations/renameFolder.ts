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
 * Handles folder renaming operation
 */
export async function handleRenameFolder(
  ws: Client,
  msg: Message
): Promise<void> {
  const { oldPath, name } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  // Guard against undefined values
  if (!oldPath) {
    console.log(`[rename_folder] Missing folder ID in org: ${orgId}`);
    return;
  }

  if (!name) {
    console.log(
      `[rename_folder] Missing new name for folder: ${oldPath} in org: ${orgId}`
    );
    return;
  }

  try {
    // Get folder from database
    const folderNode = await getNodeById(oldPath);
    const folderId = oldPath;

    if (folderNode && folderNode.type === "folder") {
      const oldName = folderNode.name;

      console.log(
        `[rename_folder] Renaming folder: ${folderId} from "${oldName}" to "${name}" in org: ${orgId}`
      );

      // Calculate the new path
      let newBasePath = "";
      if (folderNode.parent_id) {
        const parentPath = await getNodePath(folderNode.parent_id);
        newBasePath = `${parentPath}/${name}`;
      } else {
        newBasePath = `/${name}`;
      }

      // Update the folder in the database
      const updatedNode = await updateNode(folderId, {
        name: name,
        path: newBasePath,
      });

      if (updatedNode) {
        // Log access
        await logFileAccess(folderId, userId, "rename");

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
          // Update name
          fsTree[orgId][folderId].name = name;
        }

        // Create rename event
        const renameMsg = {
          type: "folder_renamed",
          id: folderId,
          oldName: oldName,
          newName: name,
          parentId: folderNode.parent_id,
          organizationId: orgId,
        };

        // Broadcast to all organization clients including the sender
        broadcastToOrganization(orgId, renameMsg, null);

        // Also send the traditional folder_updated for backward compatibility
        const updateMsg = {
          type: "folder_updated",
          id: folderId,
          name: name,
          parentId: folderNode.parent_id,
          organizationId: orgId,
        };

        // Broadcast update to all organization clients
        broadcastToOrganization(orgId, updateMsg, null);
      } else {
        console.log(
          `[rename_folder] Failed to update folder in database: ${folderId}`
        );
      }
    } else if (fsTree[orgId] && fsTree[orgId][oldPath]?.type === "folder") {
      // Fallback to in-memory if not in database
      console.log(
        `[rename_folder] Folder not in database, using in-memory: ${folderId}`
      );

      const folder = fsTree[orgId][folderId];
      const oldName = folder.name;

      console.log(
        `[rename_folder] Renaming folder: ${folderId} from "${oldName}" to "${name}" in org: ${orgId}`
      );

      // Update name
      folder.name = name;

      // Create rename event
      const renameMsg = {
        type: "folder_renamed",
        id: folderId,
        oldName: oldName,
        newName: name,
        parentId: folder.parentId,
        organizationId: orgId,
      };

      // Broadcast to all organization clients including the sender
      broadcastToOrganization(orgId, renameMsg, null);

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
        `[rename_folder] Failed to rename folder: ${oldPath} in org: ${orgId} - not found`
      );
    }
  } catch (error) {
    console.error(`[rename_folder] Error renaming folder: ${oldPath}`, error);
  }
}

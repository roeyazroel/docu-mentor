import {
  getNodeById,
  getNodePath,
  logFileAccess,
  updateNode,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core file renaming logic that can be used with or without WebSockets
 */
export async function renameFile(
  fileId: string,
  newName: string,
  organizationId: string,
  userId: string
): Promise<{ success: boolean; fileData: any }> {
  if (!fileId) {
    console.log(`[rename_file] Missing file ID in org: ${organizationId}`);
    return { success: false, fileData: null };
  }

  if (!newName) {
    console.log(
      `[rename_file] Missing new name for file: ${fileId} in org: ${organizationId}`
    );
    return { success: false, fileData: null };
  }

  try {
    // Get file from database
    const fileNode = await getNodeById(fileId);

    if (fileNode && fileNode.type === "file") {
      const oldName = fileNode.name;

      console.log(
        `[rename_file] Renaming file: ${fileId} from "${oldName}" to "${newName}" in org: ${organizationId}`
      );

      // Calculate the new path
      let newPath = "";
      if (fileNode.parent_id) {
        const parentPath = await getNodePath(fileNode.parent_id);
        newPath = `${parentPath}/${newName}`;
      } else {
        newPath = `/${newName}`;
      }

      // Update the node in the database
      const updatedNode = await updateNode(fileId, {
        name: newName,
        path: newPath,
      });

      if (updatedNode) {
        // Log access
        await logFileAccess(fileId, userId, "rename");

        // For backward compatibility with in-memory system
        if (fsTree[organizationId] && fsTree[organizationId][fileId]) {
          // Update name
          fsTree[organizationId][fileId].name = newName;
        }

        return {
          success: true,
          fileData: {
            id: fileId,
            oldName,
            newName,
            parentId: fileNode.parent_id
          }
        };
      } else {
        console.log(
          `[rename_file] Failed to update file in database: ${fileId}`
        );
        return { success: false, fileData: null };
      }
    } else if (fsTree[organizationId] && fsTree[organizationId][fileId]?.type === "file") {
      // Fallback to in-memory if not in database
      console.log(
        `[rename_file] File not in database, using in-memory: ${fileId}`
      );

      const file = fsTree[organizationId][fileId];
      const oldName = file.name;

      console.log(
        `[rename_file] Renaming file: ${fileId} from "${oldName}" to "${newName}" in org: ${organizationId}`
      );

      // Update name
      file.name = newName;

      return {
        success: true,
        fileData: {
          id: fileId,
          oldName,
          newName,
          parentId: file.parentId
        }
      };
    } else {
      console.log(
        `[rename_file] Failed to rename file: ${fileId} in org: ${organizationId} - not found`
      );
      return { success: false, fileData: null };
    }
  } catch (error) {
    console.error(`[rename_file] Error renaming file: ${fileId}`, error);
    return { success: false, fileData: null };
  }
}

/**
 * Handles file renaming operation via WebSocket
 */
export async function handleRenameFile(
  ws: Client,
  msg: Message
): Promise<void> {
  const { oldPath, name } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  if (!oldPath || !name) {
    console.log(`[rename_file] Missing required parameters in org: ${orgId}`);
    return;
  }

  const result = await renameFile(oldPath, name, orgId, userId);

  if (result.success && result.fileData) {
    const { id: fileId, oldName, newName, parentId } = result.fileData;

    // Create rename event
    const renameMsg = {
      type: "file_renamed",
      id: fileId,
      oldName: oldName,
      newName: newName,
      parentId: parentId,
      organizationId: orgId,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast to specific file room if anyone is viewing it
    broadcast(fileId, renameMsg, null);

    // Broadcast to all organization clients including the sender
    broadcastToOrganization(orgId, renameMsg, null);

    // Also send the traditional file_updated for backward compatibility
    const updateMsg = {
      type: "file_updated",
      id: fileId,
      name: newName,
      parentId: parentId,
      organizationId: orgId,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast update to all organization clients
    broadcastToOrganization(orgId, updateMsg, null);
  }
}

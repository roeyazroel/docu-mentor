import {
  getNodeById,
  getNodePath,
  logFileAccess,
  updateNode,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles file renaming operation
 */
export async function handleRenameFile(
  ws: Client,
  msg: Message
): Promise<void> {
  const { oldPath, name } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  // Guard against undefined values
  if (!oldPath) {
    console.log(`[rename_file] Missing file ID in org: ${orgId}`);
    return;
  }

  if (!name) {
    console.log(
      `[rename_file] Missing new name for file: ${oldPath} in org: ${orgId}`
    );
    return;
  }

  try {
    // Get file from database
    const fileNode = await getNodeById(oldPath);
    const fileId = oldPath;

    if (fileNode && fileNode.type === "file") {
      const oldName = fileNode.name;

      console.log(
        `[rename_file] Renaming file: ${fileId} from "${oldName}" to "${name}" in org: ${orgId}`
      );

      // Calculate the new path
      let newPath = "";
      if (fileNode.parent_id) {
        const parentPath = await getNodePath(fileNode.parent_id);
        newPath = `${parentPath}/${name}`;
      } else {
        newPath = `/${name}`;
      }

      // Update the node in the database
      const updatedNode = await updateNode(fileId, {
        name: name,
        path: newPath,
      });

      if (updatedNode) {
        // Log access
        await logFileAccess(fileId, userId, "rename");

        // For backward compatibility with in-memory system
        if (fsTree[orgId] && fsTree[orgId][fileId]) {
          // Update name
          fsTree[orgId][fileId].name = name;
        }

        // Create rename event
        const renameMsg = {
          type: "file_renamed",
          id: fileId,
          oldName: oldName,
          newName: name,
          parentId: fileNode.parent_id,
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
          name: name,
          parentId: fileNode.parent_id,
          organizationId: orgId,
          lastUpdated: new Date().toISOString(),
        };

        // Broadcast update to all organization clients
        broadcastToOrganization(orgId, updateMsg, null);
      } else {
        console.log(
          `[rename_file] Failed to update file in database: ${fileId}`
        );
      }
    } else if (fsTree[orgId] && fsTree[orgId][oldPath]?.type === "file") {
      // Fallback to in-memory if not in database
      console.log(
        `[rename_file] File not in database, using in-memory: ${fileId}`
      );

      const file = fsTree[orgId][fileId];
      const oldName = file.name;

      console.log(
        `[rename_file] Renaming file: ${fileId} from "${oldName}" to "${name}" in org: ${orgId}`
      );

      // Update name
      file.name = name;

      // Create rename event
      const renameMsg = {
        type: "file_renamed",
        id: fileId,
        oldName: oldName,
        newName: name,
        parentId: file.parentId,
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
        name: file.name,
        parentId: file.parentId,
        organizationId: orgId,
        lastUpdated: new Date().toISOString(),
      };

      // Broadcast update to all organization clients
      broadcastToOrganization(orgId, updateMsg, null);
    } else {
      console.log(
        `[rename_file] Failed to rename file: ${oldPath} in org: ${orgId} - not found`
      );
    }
  } catch (error) {
    console.error(`[rename_file] Error renaming file: ${oldPath}`, error);
  }
}

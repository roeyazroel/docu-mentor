import { deleteNode, getNodeById, logFileAccess } from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core file deletion logic that can be used with or without WebSockets
 */
export async function deleteFile(
  fileId: string,
  organizationId: string,
  userId: string
): Promise<boolean> {
  if (!fileId) {
    console.log(`[delete_file] Missing file ID in org: ${organizationId}`);
    return false;
  }

  try {
    // First check if file exists in database
    const node = await getNodeById(fileId);

    if (node && node.type === "file") {
      console.log(
        `[delete_file] Deleting file: ${fileId} in org: ${organizationId}`
      );

      // Soft delete the node in the database
      const success = await deleteNode(fileId);

      if (success) {
        // Log access
        await logFileAccess(fileId, userId, "delete");

        // For backward compatibility with in-memory system
        if (
          fsTree[organizationId] &&
          fsTree[organizationId][fileId]?.type === "file"
        ) {
          // Remove from parent's children array
          const parentId = fsTree[organizationId][fileId].parentId;
          if (parentId && fsTree[organizationId][parentId]?.children) {
            fsTree[organizationId][parentId].children = fsTree[organizationId][
              parentId
            ].children.filter((id) => id !== fileId);
          }

          delete fsTree[organizationId][fileId];
        }

        return true;
      } else {
        console.log(
          `[delete_file] Database deletion failed for file: ${fileId}`
        );
        return false;
      }
    } else if (
      fsTree[organizationId] &&
      fsTree[organizationId][fileId]?.type === "file"
    ) {
      // Fallback to in-memory only if not found in database
      console.log(
        `[delete_file] File not found in database, using in-memory: ${fileId}`
      );

      // Remove from parent's children array
      const parentId = fsTree[organizationId][fileId].parentId;
      if (parentId && fsTree[organizationId][parentId]?.children) {
        fsTree[organizationId][parentId].children = fsTree[organizationId][
          parentId
        ].children.filter((id) => id !== fileId);
      }

      delete fsTree[organizationId][fileId];
      return true;
    } else {
      console.log(
        `[delete_file] Failed to delete file: ${fileId} in org: ${organizationId} - not found`
      );
      return false;
    }
  } catch (error) {
    console.error(`[delete_file] Error deleting file: ${fileId}`, error);
    return false;
  }
}

/**
 * Handles file deletion operation via WebSocket
 */
export async function handleDeleteFile(
  ws: Client,
  msg: Message
): Promise<void> {
  const { path: fileId } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  // Guard against undefined fileId
  if (!fileId) {
    console.log(`[delete_file] Missing file ID in org: ${orgId}`);
    return;
  }

  const success = await deleteFile(fileId, orgId, userId);

  if (success) {
    // Create deletion message
    const deleteMsg = {
      type: "file_deleted",
      id: fileId,
      organizationId: orgId,
    };

    // Broadcast to file room in case anyone is viewing it
    broadcast(fileId, deleteMsg, ws);

    // Broadcast to all organization clients
    broadcastToOrganization(orgId, deleteMsg, ws);
  }
}

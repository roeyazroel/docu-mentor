import { getNodeById, revertFileToVersion } from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles file revert to version operation
 */
export async function handleRevertFileVersion(
  ws: Client,
  msg: Message
): Promise<void> {
  const { path: fileId, version } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  // Guard against undefined values
  if (!fileId) {
    console.log(`[revert_file_version] Missing file ID in org: ${orgId}`);
    return;
  }

  if (version === undefined || typeof version !== "number") {
    console.log(
      `[revert_file_version] Missing or invalid version for file: ${fileId} in org: ${orgId}`
    );
    return;
  }

  try {
    // Get file node from database to validate it exists
    const fileNode = await getNodeById(fileId);

    if (!fileNode || fileNode.type !== "file") {
      console.log(
        `[revert_file_version] File not found or not a file: ${fileId} in org: ${orgId}`
      );

      // Send error message back to client
      ws.send(
        JSON.stringify({
          type: "file_revert_error",
          id: fileId,
          error: "File not found",
          organizationId: orgId,
        })
      );
      return;
    }

    // Revert the file to the specified version
    const result = await revertFileToVersion(fileId, version, userId);

    if (result) {
      console.log(
        `[revert_file_version] Successfully reverted file: ${fileId} to version: ${version}`
      );

      // For backward compatibility with in-memory system
      if (fsTree[orgId] && fsTree[orgId][fileId]) {
        // Update content in memory
        fsTree[orgId][fileId].content = result.content;
      }

      // Create revert event message
      const revertMsg = {
        type: "file_reverted",
        id: fileId,
        name: fileNode.name,
        content: result.content,
        currentVersion: result.version,
        revertedFromVersion: version,
        parentId: fileNode.parent_id,
        organizationId: orgId,
        lastUpdated: new Date().toISOString(),
      };

      // Broadcast to specific file room if anyone is viewing it
      broadcast(fileId, revertMsg, null);

      // Broadcast to all organization clients including the sender
      broadcastToOrganization(orgId, revertMsg, null);

      // Also send the traditional file_updated for backward compatibility
      const updateMsg = {
        type: "file_updated",
        id: fileId,
        name: fileNode.name,
        content: result.content,
        parentId: fileNode.parent_id,
        organizationId: orgId,
        lastUpdated: new Date().toISOString(),
      };

      // Broadcast update to all organization clients
      broadcastToOrganization(orgId, updateMsg, null);
    } else {
      console.log(
        `[revert_file_version] Failed to revert file: ${fileId} to version: ${version}`
      );

      // Send error message back to client
      ws.send(
        JSON.stringify({
          type: "file_revert_error",
          id: fileId,
          error: `Failed to revert to version ${version}`,
          organizationId: orgId,
        })
      );
    }
  } catch (error) {
    console.error(
      `[revert_file_version] Error reverting file: ${fileId}`,
      error
    );

    // Send error message back to client
    ws.send(
      JSON.stringify({
        type: "file_revert_error",
        id: fileId,
        error: "Server error",
        organizationId: orgId,
      })
    );
  }
}

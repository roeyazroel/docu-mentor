import { getNodeById, revertFileToVersion } from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core file version revert logic that can be used with or without WebSockets
 */
export async function revertFileVersion(
  fileId: string,
  version: number,
  organizationId: string,
  userId: string
): Promise<{ success: boolean; fileData: any; error?: string }> {
  if (!fileId) {
    console.log(
      `[revert_file_version] Missing file ID in org: ${organizationId}`
    );
    return { success: false, fileData: null, error: "Missing file ID" };
  }

  if (version === undefined || typeof version !== "number") {
    console.log(
      `[revert_file_version] Missing or invalid version for file: ${fileId} in org: ${organizationId}`
    );
    return {
      success: false,
      fileData: null,
      error: "Missing or invalid version number",
    };
  }

  try {
    // Get file node from database to validate it exists
    const fileNode = await getNodeById(fileId);

    if (!fileNode || fileNode.type !== "file") {
      console.log(
        `[revert_file_version] File not found or not a file: ${fileId} in org: ${organizationId}`
      );
      return { success: false, fileData: null, error: "File not found" };
    }

    // Revert the file to the specified version
    const result = await revertFileToVersion(fileId, version, userId);

    if (result) {
      console.log(
        `[revert_file_version] Successfully reverted file: ${fileId} to version: ${version}`
      );

      // For backward compatibility with in-memory system
      if (fsTree[organizationId] && fsTree[organizationId][fileId]) {
        // Update content in memory
        fsTree[organizationId][fileId].content = result.content;
      }

      return {
        success: true,
        fileData: {
          id: fileId,
          name: fileNode.name,
          content: result.content,
          currentVersion: result.version,
          revertedFromVersion: version,
          parentId: fileNode.parent_id,
        },
      };
    } else {
      console.log(
        `[revert_file_version] Failed to revert file: ${fileId} to version: ${version}`
      );
      return {
        success: false,
        fileData: null,
        error: `Failed to revert to version ${version}`,
      };
    }
  } catch (error) {
    console.error(
      `[revert_file_version] Error reverting file: ${fileId}`,
      error
    );
    return { success: false, fileData: null, error: "Server error" };
  }
}

/**
 * Handles file revert to version operation via WebSocket
 */
export async function handleRevertFileVersion(
  ws: Client,
  msg: Message
): Promise<void> {
  const { path: fileId, version } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  if (!fileId || version === undefined) {
    console.log(
      `[revert_file_version] Missing required parameters in org: ${orgId}`
    );

    if (fileId) {
      ws.send(
        JSON.stringify({
          type: "file_revert_error",
          id: fileId,
          error: "Missing or invalid version",
          organizationId: orgId,
        })
      );
    }
    return;
  }

  const result = await revertFileVersion(fileId, version, orgId, userId);

  if (result.success && result.fileData) {
    const { id, name, content, currentVersion, revertedFromVersion, parentId } =
      result.fileData;

    // Create revert event message
    const revertMsg = {
      type: "file_reverted",
      id: id,
      name: name,
      content: content,
      currentVersion: currentVersion,
      revertedFromVersion: revertedFromVersion,
      parentId: parentId,
      organizationId: orgId,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast to specific file room if anyone is viewing it
    broadcast(id, revertMsg, null);

    // Broadcast to all organization clients including the sender
    broadcastToOrganization(orgId, revertMsg, null);

    // Also send the traditional file_updated for backward compatibility
    const updateMsg = {
      type: "file_updated",
      id: id,
      name: name,
      content: content,
      parentId: parentId,
      organizationId: orgId,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast update to all organization clients
    broadcastToOrganization(orgId, updateMsg, null);
  } else {
    // Send error message back to client
    ws.send(
      JSON.stringify({
        type: "file_revert_error",
        id: fileId,
        error: result.error || "Unknown error",
        organizationId: orgId,
      })
    );
  }
}

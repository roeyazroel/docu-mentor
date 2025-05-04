import {
  getNodeById,
  logFileAccess,
  updateFileContent,
  updateNode,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core file update logic that can be used with or without WebSockets
 */
export async function updateFile(
  fileId: string,
  organizationId: string,
  userId: string,
  updates: {
    content?: string;
    name?: string;
  }
): Promise<{ success: boolean; nodeData: any }> {
  if (!fileId) {
    console.log(`[update_file] Missing file ID in org: ${organizationId}`);
    return { success: false, nodeData: null };
  }

  const { content, name } = updates;

  try {
    console.log(
      `[update_file] Updating file: ${fileId} in org: ${organizationId}`
    );
    console.log(
      `[update_file] Content length: ${content ? content.length : 0}`
    );

    // Get the current node from database
    const nodeData = await getNodeById(fileId);

    // If node doesn't exist in the database, check in-memory
    let updatePromises = [];

    if (!nodeData) {
      if (
        !(
          fsTree[organizationId] &&
          fsTree[organizationId][fileId]?.type === "file"
        )
      ) {
        console.log(
          `[update_file] Failed to update file: ${fileId} in org: ${organizationId} - not found`
        );
        return { success: false, nodeData: null };
      }
    }

    // Update content if provided
    if (content !== undefined) {
      console.log(` -> Content updated for ${fileId}`);
      updatePromises.push(updateFileContent(fileId, content, userId));

      // Update in-memory storage too (dual write)
      if (fsTree[organizationId] && fsTree[organizationId][fileId]) {
        fsTree[organizationId][fileId].content = content;
      }
    }

    // Update name if provided
    if (name !== undefined) {
      console.log(` -> Name updated for ${fileId}`);

      // Update in database
      updatePromises.push(updateNode(fileId, { name }));

      // Update in-memory storage too (dual write)
      if (fsTree[organizationId] && fsTree[organizationId][fileId]) {
        fsTree[organizationId][fileId].name = name;
      }
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Log the access
    await logFileAccess(fileId, userId, "update");

    return {
      success: true,
      nodeData: nodeData || fsTree[organizationId]?.[fileId] || null,
    };
  } catch (error) {
    console.error(`[update_file] Error updating file: ${fileId}`, error);
    return { success: false, nodeData: null };
  }
}

/**
 * Handles file update operation via WebSocket
 */
export async function handleUpdateFile(
  ws: Client,
  msg: Message
): Promise<void> {
  const { path: fileId, content, name, sessionId, userId } = msg;
  const orgId = getOrgId(msg);
  const user = ws.userId || userId || "anonymous";

  if (!fileId) {
    console.log(
      `[update_file] Failed to update file: missing fileId in org: ${orgId}`
    );
    return;
  }

  console.log(`[update_file] Session ID: ${sessionId || "unknown"}`);

  try {
    // Store client info for room membership
    if (sessionId) ws.sessionId = sessionId;
    if (userId) ws.userId = userId;

    // Make sure client is in the file room (auto-join)
    const fileRooms = require("../types").fileRooms;
    const isInRoom = fileRooms.has(fileId) && fileRooms.get(fileId).has(ws);
    if (!isInRoom) {
      console.log(`[update_file] Auto-joining client to file room: ${fileId}`);
      // Use the joinFile utility if user info is available
      if (userId) {
        const { joinFile } = require("../utils");
        joinFile(ws, fileId, userId);
      } else {
        // Fallback: Just add to room without full join process
        if (!fileRooms.has(fileId)) fileRooms.set(fileId, new Set());
        fileRooms.get(fileId).add(ws);
      }
    }

    const result = await updateFile(fileId, orgId, user, { content, name });

    if (result.success) {
      const nodeData = result.nodeData;

      // Create a message with all update details including content
      const updateMsg = {
        type: "file_updated",
        id: fileId,
        name: nodeData?.name || name,
        content: content,
        parentId: nodeData?.parent_id || nodeData?.parentId,
        organizationId: orgId,
        lastUpdated: new Date().toISOString(),
        sessionId: sessionId, // Include session ID to help client identify source
      };

      // IMPORTANT: Previously we were passing ws as the exclude parameter, which
      // might have caused issues - we should send to ALL clients including the sender
      // as confirmation that the update was processed
      console.log(
        `[update_file] Broadcasting to all clients in file room, including sender`
      );
      broadcast(fileId, updateMsg, null); // Changed from passing ws to null to send to all clients

      // Create metadata-only message for organization-wide broadcast
      const metadataMsg = {
        type: "file_updated",
        id: fileId,
        name: nodeData?.name || name,
        // No content field
        parentId: nodeData?.parent_id || nodeData?.parentId,
        organizationId: orgId,
        lastUpdated: new Date().toISOString(),
        sessionId: sessionId, // Include session ID to help client identify source
      };

      // Broadcast metadata to all organization clients (WITHOUT content)
      // This ensures all clients know about file tree updates but not content changes
      broadcastToOrganization(orgId, metadataMsg, ws);
    }
  } catch (error) {
    console.error(
      `[update_file] Error in WebSocket handler for file: ${fileId}`,
      error
    );
  }
}

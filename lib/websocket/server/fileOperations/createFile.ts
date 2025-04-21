import {
  createNode,
  getNodePath,
  logFileAccess,
  updateFileContent,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles file creation operation
 */
export async function handleCreateFile(
  ws: Client,
  msg: Message
): Promise<void> {
  const { name = "", content = "", parentId = null } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  if (name) {
    try {
      // Generate a path for the new file
      let path = "";
      if (parentId) {
        const parentPath = await getNodePath(parentId);
        path = `${parentPath}/${name}`;
      } else {
        path = `/${name}`;
      }

      console.log(
        `[create_file] Creating file with name: ${name} in org: ${orgId}, path: ${path}`
      );

      // Create the file node in the database
      const fileNode = await createNode({
        name,
        type: "file",
        parentId,
        organizationId: orgId,
        userId,
        path,
      });

      if (!fileNode) {
        console.error(
          `[create_file] Failed to create file in database: ${name}`
        );
        return;
      }

      const fileId = fileNode.id;

      // Store the file content
      await updateFileContent(fileId, content, userId);

      // Log the access
      await logFileAccess(fileId, userId, "create");

      // --- DUAL WRITE APPROACH: STILL UPDATE IN-MEMORY STORAGE ---
      // This ensures backward compatibility during the transition
      if (!fsTree[orgId]) fsTree[orgId] = {};

      // Create the file node in memory
      fsTree[orgId][fileId] = {
        type: "file",
        name,
        content,
        parentId,
      };

      // Add to parent's children if it has a parent
      if (parentId && fsTree[orgId][parentId]) {
        if (!fsTree[orgId][parentId].children) {
          fsTree[orgId][parentId].children = [];
        }
        fsTree[orgId][parentId].children.push(fileId);
      }
      // --------------------------------------------------------

      console.log(`[create_file] File created successfully: ${fileId}`);

      // Send back the created file with its ID
      ws.send(
        JSON.stringify({
          type: "file_created",
          id: fileId,
          name,
          parentId,
          content,
          organizationId: orgId,
        })
      );

      // Broadcast to all clients in the organization for file tree updates
      broadcastToOrganization(
        orgId,
        {
          type: "file_created",
          id: fileId,
          name,
          parentId,
          // Don't include content in broadcasts to other clients
          organizationId: orgId,
        },
        ws
      );
    } catch (error) {
      console.error(`[create_file] Error creating file:`, error);
    }
  }
}

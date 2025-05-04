import {
  createNode,
  getNodePath,
  logFileAccess,
  updateFileContent,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core file creation logic that can be used with or without WebSockets
 */
export async function createFile(
  name: string,
  content: string = "",
  parentId: string | null = null,
  organizationId: string,
  userId: string
): Promise<{ fileId: string; path: string } | null> {
  if (!name) {
    console.error("[create_file] File name is required");
    return null;
  }

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
      `[create_file] Creating file with name: ${name} in org: ${organizationId}, path: ${path}`
    );

    // Create the file node in the database
    const fileNode = await createNode({
      name,
      type: "file",
      parentId,
      organizationId,
      userId,
      path,
    });

    if (!fileNode) {
      console.error(`[create_file] Failed to create file in database: ${name}`);
      return null;
    }

    const fileId = fileNode.id;

    // Store the file content
    await updateFileContent(fileId, content, userId);

    // Log the access
    await logFileAccess(fileId, userId, "create");

    // --- DUAL WRITE APPROACH: STILL UPDATE IN-MEMORY STORAGE ---
    // This ensures backward compatibility during the transition
    if (!fsTree[organizationId]) fsTree[organizationId] = {};

    // Create the file node in memory
    fsTree[organizationId][fileId] = {
      type: "file",
      name,
      content,
      parentId,
    };

    // Add to parent's children if it has a parent
    if (parentId && fsTree[organizationId][parentId]) {
      if (!fsTree[organizationId][parentId].children) {
        fsTree[organizationId][parentId].children = [];
      }
      fsTree[organizationId][parentId].children.push(fileId);
    }
    // --------------------------------------------------------

    console.log(`[create_file] File created successfully: ${fileId}`);

    return { fileId, path };
  } catch (error) {
    console.error(`[create_file] Error creating file:`, error);
    return null;
  }
}

/**
 * Handles file creation operation via WebSocket
 */
export async function handleCreateFile(
  ws: Client,
  msg: Message
): Promise<void> {
  const { name = "", content = "", parentId = null } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  const result = await createFile(name, content, parentId, orgId, userId);

  if (result) {
    const { fileId } = result;

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
  }
}

import { createNode, getNodePath, logFileAccess } from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core folder creation logic that can be used with or without WebSockets
 */
export async function createFolder(
  name: string,
  parentId: string | null = null,
  organizationId: string,
  userId: string
): Promise<{ folderId: string; path: string } | null> {
  if (!name) {
    console.error("[create_folder] Folder name is required");
    return null;
  }

  try {
    // Generate a path for the new folder
    let path = "";
    if (parentId) {
      const parentPath = await getNodePath(parentId);
      path = `${parentPath}/${name}`;
    } else {
      path = `/${name}`;
    }

    console.log(
      `[create_folder] Creating folder with name: ${name} in org: ${organizationId}, path: ${path}`
    );

    // Create the folder node in the database
    const folderNode = await createNode({
      name,
      type: "folder",
      parentId,
      organizationId,
      userId,
      path,
    });

    if (!folderNode) {
      console.error(
        `[create_folder] Failed to create folder in database: ${name}`
      );
      return null;
    }

    const folderId = folderNode.id;

    // Log the access
    await logFileAccess(folderId, userId, "create");

    // --- DUAL WRITE APPROACH: STILL UPDATE IN-MEMORY STORAGE ---
    // This ensures backward compatibility during the transition
    if (!fsTree[organizationId]) fsTree[organizationId] = {};

    // Create the folder node in memory
    fsTree[organizationId][folderId] = {
      type: "folder",
      name,
      children: [],
      parentId,
    };

    // Add to parent's children if it has a parent
    if (parentId && fsTree[organizationId][parentId]) {
      if (!fsTree[organizationId][parentId].children) {
        fsTree[organizationId][parentId].children = [];
      }
      fsTree[organizationId][parentId].children.push(folderId);
    }
    // --------------------------------------------------------

    console.log(`[create_folder] Folder created successfully: ${folderId}`);

    return { folderId, path };
  } catch (error) {
    console.error(`[create_folder] Error creating folder:`, error);
    return null;
  }
}

/**
 * Handles folder creation operation via WebSocket
 */
export async function handleCreateFolder(
  ws: Client,
  msg: Message
): Promise<void> {
  const { name = "", parentId = null } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  const result = await createFolder(name, parentId, orgId, userId);

  if (result) {
    const { folderId } = result;

    // Send back the created folder with its ID
    ws.send(
      JSON.stringify({
        type: "folder_created",
        id: folderId,
        name,
        parentId,
        organizationId: orgId,
      })
    );

    // Broadcast to all clients in the organization for folder tree updates
    broadcastToOrganization(
      orgId,
      {
        type: "folder_created",
        id: folderId,
        name,
        parentId,
        organizationId: orgId,
      },
      null // Send to all clients including sender
    );
  }
}

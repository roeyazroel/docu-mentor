import { v4 as uuidv4 } from "uuid";
import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles file creation operation
 */
export function handleCreateFile(ws: Client, msg: Message): void {
  const { name = "", content = "", parentId = null } = msg;
  const orgId = getOrgId(msg);

  if (name) {
    // Generate a UUID for the new file
    const fileId = uuidv4();
    console.log(
      `[create_file] Creating file: ${fileId} with name: ${name} in org: ${orgId}`
    );

    if (!fsTree[orgId]) fsTree[orgId] = {};

    // Create the file node
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

    console.log("[fsTree] After create_file:", JSON.stringify(fsTree, null, 2));

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

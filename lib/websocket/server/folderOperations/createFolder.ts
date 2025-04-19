import { v4 as uuidv4 } from "uuid";
import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles folder creation operation
 */
export function handleCreateFolder(ws: Client, msg: Message): void {
  const { name = "", parentId = null } = msg;
  const orgId = getOrgId(msg);

  if (name) {
    // Generate a UUID for the new folder
    const folderId = uuidv4();
    console.log(
      `[create_folder] Creating folder: ${folderId} with name: ${name} in org: ${orgId}`
    );

    if (!fsTree[orgId]) fsTree[orgId] = {};

    // Create the folder node
    fsTree[orgId][folderId] = {
      type: "folder",
      name,
      children: [],
      parentId,
    };

    // Add to parent's children if it has a parent
    if (parentId && fsTree[orgId][parentId]) {
      if (!fsTree[orgId][parentId].children) {
        fsTree[orgId][parentId].children = [];
      }
      fsTree[orgId][parentId].children.push(folderId);
    }

    console.log(
      "[fsTree] After create_folder:",
      JSON.stringify(fsTree, null, 2)
    );

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
      null // Changed from ws to null to send to all clients including sender
    );
  }
}

import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles folder deletion operation
 */
export function handleDeleteFolder(ws: Client, msg: Message): void {
  const { path: folderId } = msg;
  const orgId = getOrgId(msg);

  if (folderId && fsTree[orgId] && fsTree[orgId][folderId]?.type === "folder") {
    console.log(
      `[delete_folder] Deleting folder: ${folderId} in org: ${orgId}`
    );

    // Remove folder from parent's children array
    const parentId = fsTree[orgId][folderId].parentId;
    if (parentId && fsTree[orgId][parentId]?.children) {
      fsTree[orgId][parentId].children = fsTree[orgId][
        parentId
      ].children.filter((id) => id !== folderId);
    }

    // Recursively delete all children (files and folders)
    const deleteRecursively = (id: string) => {
      const node = fsTree[orgId][id];

      // If it's a folder with children, delete them first
      if (
        node?.type === "folder" &&
        node.children &&
        node.children.length > 0
      ) {
        // Create a copy of the children array before iterating
        const childrenToDelete = [...node.children];
        childrenToDelete.forEach((childId) => {
          deleteRecursively(childId);
        });
      }

      // Delete the node itself
      delete fsTree[orgId][id];
    };

    // Start recursive deletion with the target folder
    deleteRecursively(folderId);

    console.log(
      "[fsTree] After delete_folder:",
      JSON.stringify(fsTree, null, 2)
    );

    // Create deletion message
    const deleteMsg = {
      type: "folder_deleted",
      id: folderId,
      organizationId: orgId,
    };

    // Broadcast to all organization clients
    broadcastToOrganization(orgId, deleteMsg, ws);
  } else {
    console.log(
      `[delete_folder] Failed to delete folder: ${folderId} in org: ${orgId}`
    );
  }
}

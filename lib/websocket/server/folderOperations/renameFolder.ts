import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles folder renaming operation
 */
export function handleRenameFolder(ws: Client, msg: Message): void {
  const { oldPath, name } = msg;
  const orgId = getOrgId(msg);

  if (
    oldPath &&
    name &&
    fsTree[orgId] &&
    fsTree[orgId][oldPath]?.type === "folder"
  ) {
    const folderId = oldPath;
    const folder = fsTree[orgId][folderId];
    const oldName = folder.name;

    console.log(
      `[rename_folder] Renaming folder: ${folderId} from "${oldName}" to "${name}" in org: ${orgId}`
    );

    // Update name
    folder.name = name;

    console.log(
      `[rename_folder] Updated folder: ${folderId} in org: ${orgId}`,
      JSON.stringify(fsTree, null, 2)
    );

    // Create rename event
    const renameMsg = {
      type: "folder_renamed",
      id: folderId,
      oldName: oldName,
      newName: name,
      parentId: folder.parentId,
      organizationId: orgId,
    };

    // Broadcast to all organization clients including the sender
    broadcastToOrganization(orgId, renameMsg, null);

    // Also send the traditional folder_updated for backward compatibility
    const updateMsg = {
      type: "folder_updated",
      id: folderId,
      name: folder.name,
      parentId: folder.parentId,
      organizationId: orgId,
    };

    // Broadcast update to all organization clients
    broadcastToOrganization(orgId, updateMsg, null);
  } else {
    console.log(
      `[rename_folder] Failed to rename folder: ${oldPath} in org: ${orgId}`
    );
  }
}

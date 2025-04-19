import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles file renaming operation
 */
export function handleRenameFile(ws: Client, msg: Message): void {
  const { oldPath, name } = msg;
  const orgId = getOrgId(msg);

  if (
    oldPath &&
    name &&
    fsTree[orgId] &&
    fsTree[orgId][oldPath]?.type === "file"
  ) {
    const fileId = oldPath;
    const file = fsTree[orgId][fileId];
    const oldName = file.name;

    console.log(
      `[rename_file] Renaming file: ${fileId} from "${oldName}" to "${name}" in org: ${orgId}`
    );

    // Update name
    file.name = name;

    console.log(
      `[rename_file] Updated file: ${fileId} in org: ${orgId}`,
      JSON.stringify(fsTree, null, 2)
    );

    // Create rename event
    const renameMsg = {
      type: "file_renamed",
      id: fileId,
      oldName: oldName,
      newName: name,
      parentId: file.parentId,
      organizationId: orgId,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast to specific file room if anyone is viewing it
    broadcast(fileId, renameMsg, null);

    // Broadcast to all organization clients including the sender
    broadcastToOrganization(orgId, renameMsg, null);

    // Also send the traditional file_updated for backward compatibility
    const updateMsg = {
      type: "file_updated",
      id: fileId,
      name: file.name,
      parentId: file.parentId,
      organizationId: orgId,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast update to all organization clients
    broadcastToOrganization(orgId, updateMsg, null);
  } else {
    console.log(
      `[rename_file] Failed to rename file: ${oldPath} in org: ${orgId}`
    );
  }
}

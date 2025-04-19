import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles file deletion operation
 */
export function handleDeleteFile(ws: Client, msg: Message): void {
  const { path: fileId } = msg;
  const orgId = getOrgId(msg);

  if (fileId && fsTree[orgId] && fsTree[orgId][fileId]?.type === "file") {
    console.log(`[delete_file] Deleting file: ${fileId} in org: ${orgId}`);

    // Remove from parent's children array
    const parentId = fsTree[orgId][fileId].parentId;
    if (parentId && fsTree[orgId][parentId]?.children) {
      fsTree[orgId][parentId].children = fsTree[orgId][
        parentId
      ].children.filter((id) => id !== fileId);
    }

    delete fsTree[orgId][fileId];

    console.log("[fsTree] After delete_file:", JSON.stringify(fsTree, null, 2));

    // Create deletion message
    const deleteMsg = {
      type: "file_deleted",
      id: fileId,
      organizationId: orgId,
    };

    // Broadcast to file room in case anyone is viewing it
    broadcast(fileId, deleteMsg, ws);

    // Broadcast to all organization clients
    broadcastToOrganization(orgId, deleteMsg, ws);
  } else {
    console.log(
      `[delete_file] Failed to delete file: ${fileId} in org: ${orgId}`
    );
  }
}

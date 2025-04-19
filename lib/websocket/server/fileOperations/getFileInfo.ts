import { Client, Message, fsTree } from "../types";
import { getOrgId } from "../utils";

/**
 * Handles file info retrieval operation
 */
export function handleGetFileInfo(ws: Client, msg: Message): void {
  const { path: fileId } = msg;
  const orgId = getOrgId(msg);

  if (fileId && fsTree[orgId] && fsTree[orgId][fileId]) {
    console.log(
      `[get_file_info] Getting file info: ${fileId} in org: ${orgId}`
    );

    const fileNode = fsTree[orgId][fileId];

    // Send back the complete file information
    ws.send(
      JSON.stringify({
        type: fileNode.type === "file" ? "file_info" : "folder_info",
        id: fileId,
        name: fileNode.name,
        content: fileNode.type === "file" ? fileNode.content : undefined,
        parentId: fileNode.parentId,
        organizationId: orgId,
      })
    );
  } else {
    console.log(
      `[get_file_info] Failed to get file info: ${fileId} in org: ${orgId}, file not found`
    );

    // Send back a not found message
    ws.send(
      JSON.stringify({
        type: "file_info_error",
        id: fileId,
        error: "File not found",
        organizationId: orgId,
      })
    );
  }
}

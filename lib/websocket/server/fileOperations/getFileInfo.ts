import {
  getFileAccessLogs,
  getFileContent,
  getFileHistory,
  getNodeById,
  logFileAccess,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { getOrgId } from "../utils";

/**
 * Handles file info retrieval operation
 */
export async function handleGetFileInfo(
  ws: Client,
  msg: Message
): Promise<void> {
  const { path: fileId } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  if (fileId) {
    console.log(
      `[get_file_info] Getting file info: ${fileId} in org: ${orgId}`
    );

    try {
      // Get file node from database
      const node = await getNodeById(fileId);

      if (node) {
        // Log file access
        await logFileAccess(fileId, userId, "read");

        // For files, also get content
        let content;
        let accessLogs;
        let history;
        if (node.type === "file") {
          const fileContent = await getFileContent(fileId);
          content = fileContent?.content;
          accessLogs = await getFileAccessLogs(fileId);
          history = await getFileHistory(fileId);
          console.log("Access logs:", accessLogs);
        }

        // Send back the complete file information
        ws.send(
          JSON.stringify({
            type: node.type === "file" ? "file_info" : "folder_info",
            id: fileId,
            name: node.name,
            content,
            parentId: node.parent_id,
            organizationId: orgId,
            accessLogs,
            history,
          })
        );
      } else {
        // --- FALLBACK TO IN-MEMORY IF NOT FOUND IN DATABASE ---
        // This allows for a smooth transition period
        if (fsTree[orgId] && fsTree[orgId][fileId]) {
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
    } catch (error) {
      console.error(`[get_file_info] Error retrieving file info:`, error);
      ws.send(
        JSON.stringify({
          type: "file_info_error",
          id: fileId,
          error: "Server error",
          organizationId: orgId,
        })
      );
    }
  }
}

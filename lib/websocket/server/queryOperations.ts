import { Client, FileNode, fsTree, Message } from "./types";
import { getOrgId } from "./utils";

/**
 * Handles getFiles operation - retrieves all files and folders for an organization
 */
export function handleGetFiles(ws: Client, msg: Message): void {
  // Respond with all files/folders for the specified organization
  const orgId = getOrgId(msg);
  const orgFiles = fsTree[orgId] || {};

  console.log(
    `[get_files] Sending files list for org: ${orgId}, count: ${
      Object.keys(orgFiles).length
    }`
  );

  // Add relationship data for hierarchical display
  const enhancedFiles = Object.entries(orgFiles).reduce((acc, [id, node]) => {
    acc[id] = {
      ...node,
      id, // Include the ID in the node data for easier frontend processing
    };
    return acc;
  }, {} as Record<string, FileNode & { id: string }>);

  console.log(
    "[get_files] Responding with files:",
    JSON.stringify(enhancedFiles, null, 2)
  );

  ws.send(
    JSON.stringify({
      type: "files_list",
      organizationId: orgId,
      files: enhancedFiles,
    })
  );
}

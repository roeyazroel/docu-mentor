import { buildFileTree } from "./database";
import { Client, FileNode, fsTree, Message } from "./types";
import { getOrgId } from "./utils";

/**
 * Handles getFiles operation - retrieves all files and folders for an organization
 */
export async function handleGetFiles(ws: Client, msg: Message): Promise<void> {
  // Get organization ID
  const orgId = getOrgId(msg);

  console.log(`[get_files] Requesting files list for org: ${orgId}`);

  try {
    // Try to get data from database first
    const dbFiles = await buildFileTree(orgId);

    if (Object.keys(dbFiles).length > 0) {
      console.log(
        `[get_files] Retrieved ${
          Object.keys(dbFiles).length
        } files from database for org: ${orgId}`
      );

      // Add relationship data for hierarchical display
      const enhancedFiles = Object.entries(dbFiles).reduce(
        (acc, [id, node]) => {
          acc[id] = {
            ...node,
            id, // Include the ID in the node data for easier frontend processing
          };
          return acc;
        },
        {} as Record<string, FileNode & { id: string }>
      );

      ws.send(
        JSON.stringify({
          type: "files_list",
          organizationId: orgId,
          files: enhancedFiles,
          source: "database",
        })
      );

      return;
    }

    // Fallback to in-memory data if database is empty
    const orgFiles = fsTree[orgId] || {};
    console.log(
      `[get_files] Fallback to in-memory data for org: ${orgId}, count: ${
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

    ws.send(
      JSON.stringify({
        type: "files_list",
        organizationId: orgId,
        files: enhancedFiles,
        source: "memory",
      })
    );
  } catch (error) {
    console.error(`[get_files] Error fetching files for org: ${orgId}`, error);

    // In case of error, fall back to in-memory data
    const orgFiles = fsTree[orgId] || {};

    // Add relationship data for hierarchical display
    const enhancedFiles = Object.entries(orgFiles).reduce((acc, [id, node]) => {
      acc[id] = {
        ...node,
        id,
      };
      return acc;
    }, {} as Record<string, FileNode & { id: string }>);

    ws.send(
      JSON.stringify({
        type: "files_list",
        organizationId: orgId,
        files: enhancedFiles,
        source: "memory",
        error: "Database error, using in-memory fallback",
      })
    );
  }
}

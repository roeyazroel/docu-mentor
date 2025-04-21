import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { FileNode } from "./types";

/**
 * Core database operations for file system nodes
 */

/**
 * Creates an organization if it doesn't already exist
 */
export async function createOrganizationIfNotExists(
  organizationId: string,
  name: string
) {
  // Check if organization exists
  const { data: existingOrg, error: checkError } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // Not found is expected
    console.error(
      `[createOrganizationIfNotExists] Error checking organization: ${organizationId}`,
      checkError
    );
    return null;
  }

  // If organization exists, return it
  if (existingOrg) {
    return existingOrg;
  }

  // Create new organization
  const { data: newOrg, error: createError } = await supabase
    .from("organizations")
    .insert({
      id: organizationId,
      name: name || `Organization ${organizationId.substring(0, 8)}`,
    })
    .select()
    .single();

  if (createError) {
    console.error(
      `[createOrganizationIfNotExists] Error creating organization: ${organizationId}`,
      createError
    );
    return null;
  }

  console.log(
    `[createOrganizationIfNotExists] Created organization: ${organizationId}`
  );
  return newOrg;
}

/**
 * Creates a user if they don't already exist
 */
export async function createUserIfNotExists(
  userId: string,
  name: string,
  email: string,
  avatarUrl?: string
) {
  // Check if user exists
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("id, name, email, avatar_url")
    .eq("id", userId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // Not found is expected
    console.error(
      `[createUserIfNotExists] Error checking user: ${userId}`,
      checkError
    );
    return null;
  }

  // If user exists, return it
  if (existingUser) {
    // check if need to update the user
    if (
      existingUser.name !== name ||
      existingUser.email !== email ||
      existingUser.avatar_url !== avatarUrl
    ) {
      await supabase
        .from("users")
        .update({
          name,
          email,
          avatar_url: avatarUrl,
        })
        .eq("id", userId);
    }
    return existingUser;
  }

  // Create new user
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({
      id: userId,
      name: name || `User ${userId.substring(0, 8)}`,
      email: email || `user-${userId.substring(0, 8)}@example.com`,
      avatar_url: avatarUrl,
    })
    .select()
    .single();

  if (createError) {
    console.error(
      `[createUserIfNotExists] Error creating user: ${userId}`,
      createError
    );
    return null;
  }

  console.log(`[createUserIfNotExists] Created user: ${userId}`);
  return newUser;
}

/**
 * Add user to organization if not already a member
 */
export async function addUserToOrganization(
  userId: string,
  organizationId: string,
  role: string = "member"
) {
  // First validate that both user and organization exist
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error(
      `[addUserToOrganization] User ${userId} does not exist:`,
      userError
    );
    throw new Error(`User ${userId} must exist before adding to organization`);
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .single();

  if (orgError) {
    console.error(
      `[addUserToOrganization] Organization ${organizationId} does not exist:`,
      orgError
    );
    throw new Error(
      `Organization ${organizationId} must exist before adding users`
    );
  }

  // Check if relationship exists
  const { data: existingMembership, error: checkError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // Not found is expected
    console.error(
      `[addUserToOrganization] Error checking membership: ${userId} in ${organizationId}`,
      checkError
    );
    return null;
  }

  // If membership exists, return it
  if (existingMembership) {
    return existingMembership;
  }

  // Add user to organization
  const { data: newMembership, error: createError } = await supabase
    .from("organization_members")
    .insert({
      user_id: userId,
      organization_id: organizationId,
      role,
    })
    .select()
    .single();

  if (createError) {
    console.error(
      `[addUserToOrganization] Error adding user ${userId} to org ${organizationId}`,
      createError
    );
    return null;
  }

  console.log(
    `[addUserToOrganization] Added user ${userId} to organization ${organizationId} as ${role}`
  );
  return newMembership;
}

/**
 * Get a node (file or folder) by ID
 */
export async function getNodeById(id: string) {
  const { data, error } = await supabase
    .from("fs_nodes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error(`[getNodeById] Error fetching node: ${id}`, error);
    return null;
  }

  return data;
}

/**
 * Get all children of a parent node
 */
export async function getNodesByParentId(
  parentId: string | null,
  organizationId: string
) {
  // Build query
  let query = supabase
    .from("fs_nodes")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  if (parentId) {
    query = query.eq("parent_id", parentId);
  } else {
    query = query.is("parent_id", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      `[getNodesByParentId] Error fetching children for parent: ${parentId}`,
      error
    );
    return [];
  }

  return data;
}

/**
 * Creates a new file/folder node
 */
export async function createNode({
  name,
  type,
  parentId,
  organizationId,
  userId,
  path,
}: {
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  organizationId: string;
  userId: string;
  path: string;
}) {
  const id = uuidv4();

  // Create node with parent_id explicitly set to null if parentId is null
  const nodeData = {
    id,
    name,
    type,
    parent_id: parentId,
    organization_id: organizationId,
    created_by: userId,
    path,
  };

  const { data, error } = await supabase
    .from("fs_nodes")
    .insert(nodeData)
    .select()
    .single();

  if (error) {
    console.error(`[createNode] Error creating ${type}:`, error);
    return null;
  }

  return data;
}

/**
 * Updates a node's metadata
 */
export async function updateNode(
  id: string,
  data: { name?: string; parent_id?: string | null; path?: string }
) {
  // Handle null parent_id by converting to database NULL value
  const updateData = { ...data };

  // If parent_id is explicitly undefined, it means we want to set it to NULL in the database
  if ("parent_id" in updateData && updateData.parent_id === undefined) {
    updateData.parent_id = null; // Supabase will convert null to SQL NULL
  }

  const { data: updatedNode, error } = await supabase
    .from("fs_nodes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`[updateNode] Error updating node: ${id}`, error);
    return null;
  }

  return updatedNode;
}

/**
 * Soft delete a node by setting deleted_at
 */
export async function deleteNode(id: string) {
  const { error } = await supabase
    .from("fs_nodes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(`[deleteNode] Error deleting node: ${id}`, error);
    return false;
  }

  return true;
}

/**
 * Get a full path for a node by traversing parent relationships
 */
export async function getNodePath(id: string): Promise<string> {
  const node = await getNodeById(id);
  if (!node) return "";

  if (!node.parent_id) {
    return `/${node.name}`;
  }

  const parentPath = await getNodePath(node.parent_id);
  return `${parentPath}/${node.name}`;
}

/**
 * File content operations
 */

/**
 * Get file content
 */
export async function getFileContent(fileId: string) {
  const { data, error } = await supabase
    .from("file_contents")
    .select("*")
    .eq("file_id", fileId)
    .single();

  if (error) {
    console.error(
      `[getFileContent] Error fetching content for file: ${fileId}`,
      error
    );
    return null;
  }

  return data;
}

/**
 * Update file content and create version
 */
export async function updateFileContent(
  fileId: string,
  content: string,
  userId: string
) {
  // First, get current version
  const { data: currentContent, error: fetchError } = await supabase
    .from("file_contents")
    .select("version, content")
    .eq("file_id", fileId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // Not found is ok for new files
    console.error(
      `[updateFileContent] Error fetching current content: ${fileId}`,
      fetchError
    );
    return null;
  }

  const currentVersion = currentContent?.version || 0;
  const newVersion = currentVersion + 1;

  // Start a transaction
  const { error: transactionError } = await supabase.rpc(
    "update_file_content_with_version",
    {
      p_file_id: fileId,
      p_content: content,
      p_version: newVersion,
      p_user_id: userId,
      p_old_content: currentContent?.content || "",
    }
  );

  if (transactionError) {
    console.error(
      `[updateFileContent] Transaction error for file: ${fileId}`,
      transactionError
    );

    // Fallback: Try to update without transaction
    const { error: updateError } = await supabase
      .from("file_contents")
      .upsert({ file_id: fileId, content, version: newVersion })
      .select();

    if (updateError) {
      console.error(
        `[updateFileContent] Fallback update error: ${fileId}`,
        updateError
      );
      return null;
    }
  }

  return { fileId, version: newVersion, content };
}

/**
 * Get a specific version of file content
 */
export async function getFileContentVersion(fileId: string, version: number) {
  const { data, error } = await supabase
    .from("file_versions")
    .select("*")
    .eq("file_id", fileId)
    .eq("version", version)
    .single();

  if (error) {
    console.error(
      `[getFileContentVersion] Error fetching version ${version} for file: ${fileId}`,
      error
    );
    return null;
  }

  return data;
}

/**
 * Log file access
 */
export async function logFileAccess(
  nodeId: string,
  userId: string,
  action: "create" | "read" | "update" | "delete" | "rename" | "move" | "revert"
) {
  const { error } = await supabase.from("fs_access_logs").insert({
    id: uuidv4(),
    node_id: nodeId,
    user_id: userId,
    action,
  });

  if (error) {
    console.error(
      `[logFileAccess] Error logging access: ${nodeId}, ${action}`,
      error
    );
  }
}

/**
 * Get file history
 */
export async function getFileHistory(nodeId: string) {
  const { data, error } = await supabase
    .from("file_versions")
    .select(
      "id, file_id, content, version, created_by, created_at, users (id, name, email, avatar_url)"
    )
    .eq("file_id", nodeId);

  if (error) {
    console.error(`[getFileHistory] Error fetching history: ${nodeId}`, error);
    return [];
  }

  return data;
}

/**
 * Get file access logs
 */
export async function getFileAccessLogs(nodeId: string) {
  const { data, error } = await supabase
    .from("fs_access_logs")
    .select(
      "id, node_id, users (id, name, email, avatar_url), action, timestamp"
    )
    .eq("node_id", nodeId);

  if (error) {
    console.error(
      `[getFileAccessLogs] Error fetching access logs: ${nodeId}`,
      error
    );
    return [];
  }

  return data;
}

/**
 * Convert a database node to the FileNode format used in-memory
 */
export function dbNodeToFileNode(dbNode: any): FileNode {
  return {
    id: dbNode.id,
    type: dbNode.type,
    name: dbNode.name,
    parentId: dbNode.parent_id,
    children: [],
    accessLogs: [],
  };
}

/**
 * Build an in-memory tree from database nodes for compatibility
 */
export async function buildFileTree(organizationId: string) {
  const { data: nodes, error } = await supabase
    .from("fs_nodes")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  if (error) {
    console.error(
      `[buildFileTree] Error fetching nodes for org: ${organizationId}`,
      error
    );
    return {};
  }

  const tree: Record<string, FileNode> = {};

  // First pass: create all nodes
  for (const node of nodes) {
    tree[node.id] = dbNodeToFileNode(node);

    // If it's a file, fetch its content
    if (node.type === "file") {
      const content = await getFileContent(node.id);
      if (content) {
        tree[node.id].content = content.content;
      }
    }

    // Fetch access logs for the node
    const accessLogs = await getFileAccessLogs(node.id);
    if (accessLogs && accessLogs.length > 0) {
      tree[node.id].accessLogs = accessLogs;
    }
  }

  // Second pass: build parent-child relationships
  for (const node of nodes) {
    if (node.parent_id && tree[node.parent_id]) {
      if (!tree[node.parent_id].children) {
        tree[node.parent_id].children = [];
      }
      tree[node.parent_id]?.children?.push(node.id);
    }
  }

  return tree;
}

/**
 * Create a stored procedure for atomic file content updates with versioning
 */
export async function setupDatabaseProcedures() {
  // Check if the procedure already exists
  const { data: procedures } = await supabase.rpc("pg_get_function_result", {
    functionname: "update_file_content_with_version",
  });

  if (!procedures) {
    // Create the stored procedure
    await supabase.rpc("create_update_file_content_procedure");
  }
}

/**
 * Revert a file to a specific version
 */
export async function revertFileToVersion(
  fileId: string,
  targetVersion: number,
  userId: string
) {
  console.log(
    `[revertFileToVersion] Reverting file ${fileId} to version ${targetVersion}`
  );

  // First, get the target version's content
  const versionData = await getFileContentVersion(fileId, targetVersion);

  if (!versionData) {
    console.error(
      `[revertFileToVersion] Target version ${targetVersion} not found for file: ${fileId}`
    );
    return null;
  }

  // Update file content with the historical version's content
  // This will create a new version with the reverted content
  const result = await updateFileContent(fileId, versionData.content, userId);

  if (!result) {
    console.error(
      `[revertFileToVersion] Failed to revert file: ${fileId} to version: ${targetVersion}`
    );
    return null;
  }

  // Log the revert action
  await logFileAccess(fileId, userId, "revert");

  return {
    fileId,
    version: result.version,
    content: result.content,
    revertedFromVersion: targetVersion,
  };
}

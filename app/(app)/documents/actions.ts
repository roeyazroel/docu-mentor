"use server";

import {
  buildFileTree,
  createNode,
  deleteNode,
  getNodeById,
  getNodesByParentId,
  logFileAccess,
  updateNode,
} from "@/lib/websocket/server/database";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Document } from "./types";

// Get user's ID
export async function getUserId(): Promise<string | null> {
  const user = await currentUser();
  if (!user) {
    console.error("No user ID found");
    return null;
  }
  return user.id;
}

// Define the return type for getDocuments
interface GetDocumentsResult {
  currentFolder: {
    id: string;
    name: string;
    path: string;
    parentId: string | null;
  } | null;
  documents: Document[];
}

// Helper function to format DB nodes into Document type
// (Ensure this handles the structure returned by your database functions)
function formatDocuments(nodes: any[]): Document[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    parentId: node.parent_id,
    path: node.path,
    updatedAt: node.updated_at || node.created_at, // Use appropriate timestamp
    // Add children if your DB function provides it, otherwise default to empty array
    children: node.children || [],
  }));
}

// Get documents for the current user (from organization) with optional parent folder
export async function getDocuments(
  parentId: string | null = null,
  organizationId: string | null = null
): Promise<GetDocumentsResult> {
  // Update return type
  if (!organizationId) {
    return { currentFolder: null, documents: [] }; // Return empty result
  }

  try {
    // Fetch children nodes
    const childNodes = await getNodesByParentId(parentId, organizationId);
    const formattedDocuments = formatDocuments(childNodes);

    // Fetch current folder details if parentId is provided
    let currentFolderData = null;
    if (parentId) {
      const folderNode = await getNodeById(parentId);
      if (folderNode && folderNode.organization_id === organizationId) {
        currentFolderData = {
          id: folderNode.id,
          name: folderNode.name,
          path: folderNode.path,
          parentId: folderNode.parent_id,
        };
      }
    }

    return {
      currentFolder: currentFolderData,
      documents: formattedDocuments,
    };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { currentFolder: null, documents: [] }; // Return empty result on error
  }
}

// Create a new folder
export async function createFolder(
  name: string,
  parentId: string | null = null,
  organizationId: string | null = null
): Promise<Document | null> {
  const userId = await getUserId();

  if (!organizationId || !userId) {
    return null;
  }

  try {
    // Determine the path for the new folder
    let path = `/${name}`;
    if (parentId) {
      // Get parent node to build path
      const parent = await getNodeById(parentId); // Fetch parent directly
      if (parent && parent.organization_id === organizationId) {
        // Check organization
        path = `${parent.path}/${name}`;
      } else if (!parentId) {
        // If parentId is null, path is just /name (root)
      } else {
        console.error(
          "Parent folder not found or doesn't belong to organization."
        );
        return null; // Parent not found or invalid
      }
    }

    // Create the folder node
    const folder = await createNode({
      name,
      type: "folder",
      parentId,
      organizationId,
      userId,
      path,
      // Folders typically don't have content, adjust if needed
    });

    if (!folder) return null;

    // Log creation
    await logFileAccess(folder.id, userId, "create");

    // Revalidate the documents page
    revalidatePath("/documents");

    // Format and return the new folder
    return formatDocuments([folder])[0]; // Use formatDocuments helper
  } catch (error) {
    console.error("Error creating folder:", error);
    return null;
  }
}

// Get full file tree for organization
export async function getFileTree(
  organizationId: string | null = null
): Promise<Record<string, any>> {
  if (!organizationId) {
    return {};
  }

  try {
    const tree = await buildFileTree(organizationId);
    return tree;
  } catch (error) {
    console.error("Error fetching file tree:", error);
    return {};
  }
}

// Create a new document
export async function createDocument(
  name: string,
  parentId: string | null = null,
  organizationId: string | null = null,
  content: string = "" // Added content parameter
): Promise<Document | null> {
  const userId = await getUserId();

  if (!organizationId || !userId) {
    return null;
  }

  try {
    // Determine the path for the new document
    let path = `/${name}`;
    if (parentId) {
      // Get parent node to build path
      const parent = await getNodeById(parentId); // Fetch parent directly
      if (parent && parent.organization_id === organizationId) {
        // Check organization
        path = `${parent.path}/${name}`;
      } else if (!parentId) {
        // If parentId is null, path is just /name (root)
        // This case is handled by the initial value, but added for clarity
      } else {
        console.error(
          "Parent folder not found or doesn't belong to organization."
        );
        return null; // Parent not found or invalid
      }
    }

    // Create the document node
    const doc = await createNode({
      name,
      type: "file",
      parentId,
      organizationId,
      userId,
      path,
    });

    if (!doc) return null;

    // Log creation
    await logFileAccess(doc.id, userId, "create");

    // Revalidate the documents page
    revalidatePath("/documents");

    // Format and return the new document
    return formatDocuments([doc])[0]; // Use formatDocuments helper
  } catch (error) {
    console.error("Error creating document:", error);
    return null;
  }
}

// Delete a document or folder
export async function deleteDocument(
  id: string,
  organizationId: string | null = null
): Promise<boolean> {
  const userId = await getUserId();

  if (!organizationId || !userId || !id) {
    return false;
  }

  try {
    // Delete the node
    const success = await deleteNode(id);

    // Log the deletion
    if (success) {
      await logFileAccess(id, userId, "delete");
      // Revalidate the documents page
      revalidatePath("/documents");
    }

    return success;
  } catch (error) {
    console.error("Error deleting document:", error);
    return false;
  }
}

// Move a document or folder to a new parent
export async function moveDocument(
  id: string,
  newParentId: string | null,
  organizationId: string | null = null
): Promise<Document | null> {
  const userId = await getUserId();

  if (!organizationId || !userId || !id) {
    return null;
  }

  try {
    // Get current node
    const node = await getNodeById(id);
    if (!node) return null;

    // Determine new path
    let newPath = `/${node.name}`;
    if (newParentId) {
      const parent = await getNodeById(newParentId);
      if (parent) {
        newPath = `${parent.path}/${node.name}`;
      }
    }

    // Update the node
    const updatedNode = await updateNode(id, {
      parent_id: newParentId,
      path: newPath,
    });

    // Log the move operation
    await logFileAccess(id, userId, "move");

    // Revalidate the documents page
    revalidatePath("/documents");

    if (!updatedNode) return null;

    return {
      id: updatedNode.id,
      name: updatedNode.name,
      type: updatedNode.type,
      parentId: updatedNode.parent_id,
      path: updatedNode.path,
      updatedAt: updatedNode.updated_at || updatedNode.created_at,
      children: [],
    };
  } catch (error) {
    console.error("Error moving document:", error);
    return null;
  }
}

// Rename a document or folder
export async function renameDocument(
  id: string,
  newName: string,
  organizationId: string | null = null
): Promise<Document | null> {
  const userId = await getUserId();

  if (!organizationId || !userId || !id || !newName) {
    return null;
  }

  try {
    // Get current node
    const node = await getNodeById(id);
    if (!node) return null;

    // Calculate new path based on parent's path
    let newPath = `/${newName}`;
    if (node.parent_id) {
      const parent = await getNodeById(node.parent_id);
      if (parent) {
        newPath = `${parent.path}/${newName}`;
      }
    }

    // Update the node
    const updatedNode = await updateNode(id, {
      name: newName,
      path: newPath,
    });

    // Log the rename operation
    await logFileAccess(id, userId, "rename");

    // Revalidate the documents page
    revalidatePath("/documents");

    if (!updatedNode) return null;

    return {
      id: updatedNode.id,
      name: updatedNode.name,
      type: updatedNode.type,
      parentId: updatedNode.parent_id,
      path: updatedNode.path,
      updatedAt: updatedNode.updated_at || updatedNode.created_at,
      children: [],
    };
  } catch (error) {
    console.error("Error renaming document:", error);
    return null;
  }
}

// Delete a folder recursively
export async function deleteFolder(
  folderId: string,
  organizationId: string | null = null
): Promise<boolean> {
  const userId = await getUserId();

  if (!organizationId || !userId || !folderId) {
    return false;
  }

  try {
    // First, get all children of the folder
    const children = await getNodesByParentId(folderId, organizationId);

    // Recursively delete all children
    for (const child of children) {
      if (child.type === "folder") {
        await deleteFolder(child.id, organizationId);
      } else {
        await deleteDocument(child.id, organizationId);
      }
    }

    // Finally, delete the folder itself
    const success = await deleteNode(folderId);

    // Log the deletion
    if (success) {
      await logFileAccess(folderId, userId, "delete");
      // Revalidate the documents page
      revalidatePath("/documents");
    }

    return success;
  } catch (error) {
    console.error("Error deleting folder:", error);
    return false;
  }
}

// Move a folder to a new parent
export async function moveFolder(
  folderId: string,
  newParentId: string | null,
  organizationId: string | null = null
): Promise<Document | null> {
  const userId = await getUserId();

  if (!organizationId || !userId || !folderId) {
    return null;
  }

  try {
    // Get current folder
    const folder = await getNodeById(folderId);
    if (!folder) return null;

    // Validate that the new parent is not a descendant of the folder (to prevent circular references)
    if (newParentId) {
      let currentParent = newParentId;
      const visited = new Set<string>();

      while (currentParent) {
        // Check for circular references
        if (visited.has(currentParent) || currentParent === folderId) {
          console.error("Circular reference detected when moving folder");
          return null;
        }

        visited.add(currentParent);

        // Get the parent's parent
        const parent = await getNodeById(currentParent);
        if (!parent) break;

        currentParent = parent.parent_id;
      }
    }

    // Determine new path
    let newPath = `/${folder.name}`;
    if (newParentId) {
      const parent = await getNodeById(newParentId);
      if (parent) {
        newPath = `${parent.path}/${folder.name}`;
      }
    }

    // Update the folder's path
    const updatedFolder = await updateNode(folderId, {
      parent_id: newParentId,
      path: newPath,
    });

    // Now update all children's paths recursively
    await updateChildrenPaths(folderId, newPath, organizationId);

    // Log the move operation
    await logFileAccess(folderId, userId, "move");

    // Revalidate the documents page
    revalidatePath("/documents");

    if (!updatedFolder) return null;

    return {
      id: updatedFolder.id,
      name: updatedFolder.name,
      type: updatedFolder.type,
      parentId: updatedFolder.parent_id,
      path: updatedFolder.path,
      updatedAt: updatedFolder.updated_at || updatedFolder.created_at,
      children: [],
    };
  } catch (error) {
    console.error("Error moving folder:", error);
    return null;
  }
}

// Rename a folder and update all child paths
export async function renameFolder(
  folderId: string,
  newName: string,
  organizationId: string | null = null
): Promise<Document | null> {
  const userId = await getUserId();

  if (!organizationId || !userId || !folderId || !newName) {
    return null;
  }

  try {
    // Get current folder
    const folder = await getNodeById(folderId);
    if (!folder) return null;

    // Calculate new path based on parent's path
    let newPath = `/${newName}`;
    if (folder.parent_id) {
      const parent = await getNodeById(folder.parent_id);
      if (parent) {
        newPath = `${parent.path}/${newName}`;
      }
    }

    // Get the old path for replacement in children paths
    const oldPath = folder.path;

    // Update the folder
    const updatedFolder = await updateNode(folderId, {
      name: newName,
      path: newPath,
    });

    // Update all children paths to reflect the new parent path
    await updateChildrenPaths(folderId, newPath, organizationId);

    // Log the rename operation
    await logFileAccess(folderId, userId, "rename");

    // Revalidate the documents page
    revalidatePath("/documents");

    if (!updatedFolder) return null;

    return {
      id: updatedFolder.id,
      name: updatedFolder.name,
      type: updatedFolder.type,
      parentId: updatedFolder.parent_id,
      path: updatedFolder.path,
      updatedAt: updatedFolder.updated_at || updatedFolder.created_at,
      children: [],
    };
  } catch (error) {
    console.error("Error renaming folder:", error);
    return null;
  }
}

// Helper function to update children paths recursively
async function updateChildrenPaths(
  parentId: string,
  newParentPath: string,
  organizationId: string
): Promise<void> {
  // Get all children of this parent
  const children = await getNodesByParentId(parentId, organizationId);

  for (const child of children) {
    // Calculate new path for this child
    const childNewPath = `${newParentPath}/${child.name}`;

    // Update the child's path
    await updateNode(child.id, { path: childNewPath });

    // If this is a folder, recursively update its children
    if (child.type === "folder") {
      await updateChildrenPaths(child.id, childNewPath, organizationId);
    }
  }
}

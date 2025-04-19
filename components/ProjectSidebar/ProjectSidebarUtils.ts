import { ProjectItem } from "./ProjectSidebarTypes";

/**
 * Toggles the expansion state of a folder by its ID.
 */
export function toggleFolder(
  items: ProjectItem[],
  folderId: string
): ProjectItem[] {
  return items.map((item) => {
    if (item.type === "folder") {
      if (item.id === folderId) {
        return { ...item, expanded: !item.expanded };
      } else if (item.children.length > 0) {
        return {
          ...item,
          children: toggleFolder(item.children, folderId),
        };
      }
    }
    return item;
  });
}

/**
 * Finds an item by its ID in the tree.
 */
export function findItemById(
  id: string,
  items: ProjectItem[]
): ProjectItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.type === "folder") {
      const found = findItemById(id, item.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the parent of an item by its ID in the tree.
 */
export function findParentById(
  id: string,
  items: ProjectItem[],
  parent: ProjectItem | null = null
): ProjectItem | null {
  for (const item of items) {
    if (item.id === id) {
      return parent;
    }
    if (item.type === "folder") {
      const found = findParentById(id, item.children, item);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Sorts items by type (folders first) and name (alphabetically, case-insensitive).
 * Also recursively sorts the children of folders.
 */
export function sortItems(items: ProjectItem[]): ProjectItem[] {
  return [...items]
    .sort((a, b) => {
      // First sort by type (folders first)
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      // Then sort by name (alphabetically, case-insensitive)
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    })
    .map((item) => {
      // Recursively sort children of folders
      if (item.type === "folder" && item.children.length > 0) {
        return {
          ...item,
          children: sortItems(item.children),
        };
      }
      return item;
    });
}

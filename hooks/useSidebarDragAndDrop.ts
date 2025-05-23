import {
  FolderItem,
  ProjectItem,
} from "@/components/ProjectSidebar/ProjectSidebarTypes";
import { useState } from "react";

/**
 * Hook for managing drag-and-drop state and logic for the project sidebar.
 *
 * Rules for drag and drop:
 * - Files can be dragged onto folders
 * - Folders can be dragged onto other folders
 * - Folders CANNOT be dragged onto files
 * - Folders cannot be dragged into their own child folders
 */
export function useSidebarDragAndDrop(
  items: ProjectItem[],
  onUpdateItems: (items: ProjectItem[]) => void,
  findParentById: (id: string, items: ProjectItem[]) => ProjectItem | null,
  onUpdateItemParent?: (
    itemId: string,
    parentId: string | null,
    itemType: "file" | "folder"
  ) => void
) {
  // Drag-and-drop state
  const [draggedItem, setDraggedItem] = useState<ProjectItem | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dragOverIsFolder, setDragOverIsFolder] = useState(false);
  const [dragPosition, setDragPosition] = useState<
    "top" | "middle" | "bottom" | null
  >(null);

  /**
   * Handler for drag start event.
   */
  function handleDragStart(e: React.DragEvent, item: ProjectItem) {
    e.stopPropagation();
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
  }

  /**
   * Handler for drag over event.
   */
  function handleDragOver(e: React.DragEvent, item: ProjectItem) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem || draggedItem.id === item.id) {
      setDragOverItemId(null);
      return;
    }

    // Prevent dragging a folder onto a file
    if (draggedItem.type === "folder" && item.type === "file") {
      setDragOverItemId(null);
      return;
    }

    // Prevent dragging a folder into its own child
    if (draggedItem.type === "folder") {
      const isChild = (parent: FolderItem, childId: string): boolean => {
        if (parent.id === childId) return true;
        for (const child of parent.children) {
          if (
            child.type === "folder" &&
            isChild(child as FolderItem, childId)
          ) {
            return true;
          }
        }
        return false;
      };
      if (
        item.type === "folder" &&
        isChild(draggedItem as FolderItem, item.id)
      ) {
        setDragOverItemId(null);
        return;
      }
    }
    setDragOverItemId(item.id);
    setDragOverIsFolder(item.type === "folder");
    // Determine drop position
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    if (item.type === "folder") {
      if (y < rect.height * 0.25) {
        setDragPosition("top");
      } else if (y > rect.height * 0.75) {
        setDragPosition("bottom");
      } else {
        setDragPosition("middle");
      }
    } else {
      setDragPosition(y < rect.height / 2 ? "top" : "bottom");
    }
    e.dataTransfer.dropEffect = "move";
  }

  /**
   * Handler for drag leave event.
   */
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItemId(null);
    setDragPosition(null);
  }

  /**
   * Handler for drop event on an item.
   */
  function handleDrop(e: React.DragEvent, targetItem: ProjectItem) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;
    setDragOverItemId(null);
    setDragPosition(null);
    if (draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    // Prevent dropping folders onto files
    if (draggedItem.type === "folder" && targetItem.type === "file") {
      setDraggedItem(null);
      return;
    }

    // Deep clone dragged item and items
    const draggedItemClone = JSON.parse(JSON.stringify(draggedItem));
    let newItems = JSON.parse(JSON.stringify(items));
    // Remove dragged item from its original position
    const removeItem = (items: ProjectItem[]): ProjectItem[] => {
      return items
        .map((item) => {
          if (item.id === draggedItem.id) {
            return null;
          }
          if (item.type === "folder") {
            const newChildren = removeItem(item.children).filter(Boolean);
            return { ...item, children: newChildren };
          }
          return item;
        })
        .filter((item): item is ProjectItem => item !== null);
    };
    newItems = removeItem(newItems);

    // Find parent of dragged item before moving
    const originalParent = findParentById(draggedItem.id, items);
    const originalParentId = originalParent ? originalParent.id : null;
    let newParentId: string | null = null;

    // Add the dragged item to its new position
    if (dragPosition === "middle" && targetItem.type === "folder") {
      // Item is dropped inside a folder
      newParentId = targetItem.id;

      const addToFolder = (items: ProjectItem[]): ProjectItem[] => {
        return items.map((item) => {
          if (item.id === targetItem.id && item.type === "folder") {
            return {
              ...item,
              expanded: true,
              children: [...item.children, draggedItemClone],
            };
          } else if (item.type === "folder") {
            return { ...item, children: addToFolder(item.children) };
          }
          return item;
        });
      };
      newItems = addToFolder(newItems);

      // Notify backend about parent change if parent has changed
      if (originalParentId !== newParentId && onUpdateItemParent) {
        onUpdateItemParent(draggedItem.id, newParentId, draggedItem.type);
      }
    } else {
      const targetParent = findParentById(targetItem.id, items);
      newParentId = targetParent ? targetParent.id : null;

      const insertAtPosition = (
        items: ProjectItem[],
        parentId: string | null
      ): ProjectItem[] => {
        if (parentId === null) {
          const targetIndex = items.findIndex(
            (item) => item.id === targetItem.id
          );
          if (targetIndex !== -1) {
            const insertIndex =
              dragPosition === "top" ? targetIndex : targetIndex + 1;
            items.splice(insertIndex, 0, draggedItemClone);
          }
          return items;
        }
        return items.map((item) => {
          if (item.id === parentId && item.type === "folder") {
            const targetIndex = item.children.findIndex(
              (child) => child.id === targetItem.id
            );
            if (targetIndex !== -1) {
              const newChildren = [...item.children];
              const insertIndex =
                dragPosition === "top" ? targetIndex : targetIndex + 1;
              newChildren.splice(insertIndex, 0, draggedItemClone);
              return { ...item, children: newChildren };
            }
          } else if (item.type === "folder") {
            return {
              ...item,
              children: insertAtPosition(item.children, parentId),
            };
          }
          return item;
        });
      };

      newItems = insertAtPosition(
        newItems,
        targetParent ? targetParent.id : null
      );

      // Notify backend about parent change if parent has changed
      if (originalParentId !== newParentId && onUpdateItemParent) {
        onUpdateItemParent(draggedItem.id, newParentId, draggedItem.type);
      }
    }
    onUpdateItems(newItems);
    setDraggedItem(null);
  }

  /**
   * Handler for drop event on the empty area or folder.
   */
  function handleDropOnArea(e: React.DragEvent) {
    e.preventDefault();
    if (!draggedItem) return;
    setDragOverItemId(null);
    setDragPosition(null);
    const draggedItemClone = JSON.parse(JSON.stringify(draggedItem));
    let newItems = JSON.parse(JSON.stringify(items));

    // Find parent of dragged item before removing
    const originalParent = findParentById(draggedItem.id, items);
    const originalParentId = originalParent ? originalParent.id : null;

    const removeItem = (items: ProjectItem[]): ProjectItem[] => {
      return items
        .map((item) => {
          if (item.id === draggedItem.id) {
            return null;
          } else if (item.type === "folder") {
            return { ...item, children: removeItem(item.children) };
          }
          return item;
        })
        .filter((item): item is ProjectItem => item !== null);
    };
    newItems = removeItem(newItems);
    newItems.push(draggedItemClone);
    onUpdateItems(newItems);

    // Notify backend about parent change if item had a parent before
    if (originalParentId !== null && onUpdateItemParent) {
      onUpdateItemParent(draggedItem.id, null, draggedItem.type);
    }

    setDraggedItem(null);
  }

  return {
    draggedItem,
    dragOverItemId,
    dragOverIsFolder,
    dragPosition,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropOnArea,
    setDraggedItem,
  };
}

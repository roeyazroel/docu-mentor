import { diffWordsWithSpace } from "diff";
import {
  DOMParser,
  DOMSerializer,
  Mark,
  Node as ProseMirrorNode,
} from "prosemirror-model";
import documentSchema from "./schema";

/**
 * Converts plain text to a ProseMirror document node
 * Handles line breaks and creates proper text nodes
 */
export function textToProseMirror(text: string): ProseMirrorNode {
  const blocks = text.split("\n");
  const content = blocks.map((block) => {
    // Create paragraph node with text node only if block has content
    return documentSchema.node(
      "paragraph",
      {},
      block.length > 0 ? [documentSchema.text(block)] : []
    );
  });

  // Create and return the document node
  return documentSchema.node("doc", {}, content);
}

/**
 * Converts a ProseMirror document node to plain text
 */
export function proseMirrorToText(node: ProseMirrorNode): string {
  let text = "";
  let lastNodeWasParagraph = false;

  node.descendants((node, pos, parent) => {
    if (node.type.name === "paragraph") {
      // Add newline between paragraphs
      if (lastNodeWasParagraph) {
        text += "\n";
      }
      lastNodeWasParagraph = true;
    } else if (node.type.name === "text") {
      text += node.text;
    } else if (node.type.name === "hard_break") {
      text += "\n";
    }
  });

  return text;
}

/**
 * Creates an HTML representation of a ProseMirror document
 */
export function proseMirrorToHtml(doc: ProseMirrorNode): string {
  const serializer = DOMSerializer.fromSchema(documentSchema);
  const fragment = serializer.serializeFragment(doc.content);

  const temporaryDiv = document.createElement("div");
  temporaryDiv.appendChild(fragment);

  return temporaryDiv.innerHTML;
}

/**
 * Creates a ProseMirror document from HTML
 */
export function htmlToProseMirror(html: string): ProseMirrorNode {
  const parser = DOMParser.fromSchema(documentSchema);
  const temporaryDiv = document.createElement("div");
  temporaryDiv.innerHTML = html;

  return parser.parse(temporaryDiv);
}

/**
 * Generates a unique ID for change tracking
 */
function generateChangeId(): string {
  return `change-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Interface for storing change information
 */
export interface DocChanges {
  docWithMarks: ProseMirrorNode;
  changeIds: {
    additions: string[];
    deletions: string[];
  };
}

/**
 * Computes changes between two documents and returns the result with change markers
 */
export function computeDocumentChanges(
  originalDoc: ProseMirrorNode,
  newDoc: ProseMirrorNode
): DocChanges {
  // Convert both documents to text for diff analysis
  const originalText = proseMirrorToText(originalDoc);
  const newText = proseMirrorToText(newDoc);

  console.log("Original text:", originalText);
  console.log("New text:", newText);

  // Use diff to identify word-level changes
  const changes = diffWordsWithSpace(originalText, newText);

  console.log("Diff changes:", changes);

  // Track all change IDs for further operations
  const changeIds = {
    additions: [] as string[],
    deletions: [] as string[],
  };

  // Create a modified HTML version with highlighted changes
  let html = "";
  let hasChanges = false;

  changes.forEach((change) => {
    const changeId = generateChangeId();

    if (change.added) {
      // Add green highlight for additions
      changeIds.additions.push(changeId);
      html += `<span class="addition" data-id="${changeId}">${change.value}</span>`;
      hasChanges = true;
      console.log("Addition:", change.value);
    } else if (change.removed) {
      // Add red highlight and strikethrough for deletions
      changeIds.deletions.push(changeId);
      html += `<span class="deletion" data-id="${changeId}">${change.value}</span>`;
      hasChanges = true;
      console.log("Deletion:", change.value);
    } else {
      // Unchanged text
      html += change.value;
    }
  });

  console.log("Generated HTML:", html);
  console.log("Has changes:", hasChanges);

  // If there are no changes, just return the new doc
  if (!hasChanges) {
    return {
      docWithMarks: newDoc,
      changeIds,
    };
  }

  // Convert the HTML with marked changes back to ProseMirror
  const docWithMarks = htmlToProseMirror(html);

  return {
    docWithMarks,
    changeIds,
  };
}

/**
 * Apply a mark to nodes in a document that contain added content
 */
function markAddedContent(
  doc: ProseMirrorNode,
  changes: any[],
  additionIds: string[]
): ProseMirrorNode {
  // Create a new document to avoid modifying the original
  let newDoc = doc;
  let currentPos = 0;

  // Go through all changes to find additions
  changes.forEach((change) => {
    if (change.added) {
      const changeId = generateChangeId();
      additionIds.push(changeId);

      // Find the exact positions in the document
      let addStart = currentPos;
      let addEnd = currentPos + change.value.length;

      // Create an addition mark with a unique ID
      const additionMark = documentSchema.mark("addition", { id: changeId });

      // Find all text nodes within this range and apply marks
      newDoc = markRange(newDoc, addStart, addEnd, additionMark);
    }

    // Only increment position for retained or added content (since it's in the new doc)
    if (!change.removed) {
      currentPos += change.value.length;
    }
  });

  return newDoc;
}

/**
 * Insert deleted content into the document with deletion marks
 */
function insertDeletedContent(
  originalDoc: ProseMirrorNode,
  newDoc: ProseMirrorNode,
  changes: any[],
  deletionIds: string[]
): ProseMirrorNode {
  // For simplicity, we'll reconstruct the document with deletions marked
  // In a full implementation, you'd want to be smarter about positioning

  // Extract text and collect deleted content with positions
  const deletions: { text: string; pos: number; id: string }[] = [];
  let origPos = 0;
  let newPos = 0;

  changes.forEach((change) => {
    if (change.removed) {
      const changeId = generateChangeId();
      deletionIds.push(changeId);
      deletions.push({
        text: change.value,
        pos: newPos,
        id: changeId,
      });
    } else if (!change.added) {
      // Unchanged text exists in both documents
      origPos += change.value.length;
      newPos += change.value.length;
    } else {
      // Added text only exists in the new document
      newPos += change.value.length;
    }
  });

  // If no deletions, return the doc as is
  if (deletions.length === 0) {
    return newDoc;
  }

  // Insert deletions at appropriate positions
  // Starting from the end to avoid position shifting issues
  deletions.sort((a, b) => b.pos - a.pos);

  let resultDoc = newDoc;
  for (const deletion of deletions) {
    // Create a text node with deletion mark
    const deletionMark = documentSchema.mark("deletion", { id: deletion.id });
    const textWithMark = documentSchema.text(deletion.text, [deletionMark]);

    // Find the appropriate paragraph to insert into
    let insertPos = deletion.pos;
    let targetNode = findNodeAtPos(resultDoc, insertPos);

    if (targetNode) {
      resultDoc = insertTextNodeAt(resultDoc, textWithMark, insertPos);
    }
  }

  return resultDoc;
}

/**
 * Helper function to mark a range of text with a given mark
 */
function markRange(
  doc: ProseMirrorNode,
  start: number,
  end: number,
  mark: Mark
): ProseMirrorNode {
  // This is a simplified implementation
  // In a real implementation, you'd use transform steps to apply marks

  // Clone the document to avoid modifying the original
  const newDoc = doc.copy(doc.content);

  // Find all text nodes in the range and apply the mark
  let result: ProseMirrorNode = newDoc;
  newDoc.nodesBetween(start, end, (node, pos) => {
    if (node.isText) {
      const from = Math.max(start, pos);
      const to = Math.min(end, pos + node.nodeSize);

      if (from < to) {
        // This simplified version doesn't properly handle the transformation
        // A real implementation would use ProseMirror transforms
        // For demonstration purposes only
        const textNode = documentSchema.text(node.text || "", [mark]);
        // In a real implementation, you'd replace the node at this position
      }
    }
  });

  // Note: This function is incomplete and would need proper transforms
  // to correctly modify the document

  return result;
}

/**
 * Helper function to find a node at a given position
 */
function findNodeAtPos(
  doc: ProseMirrorNode,
  pos: number
): { node: ProseMirrorNode; offset: number } | null {
  let result: { node: ProseMirrorNode; offset: number } | null = null;

  doc.nodesBetween(pos, pos, (node, nodePos) => {
    if (result) return false; // Stop if we've found a node

    if (nodePos <= pos && nodePos + node.nodeSize >= pos) {
      result = { node, offset: pos - nodePos };
      return false; // Stop traversal
    }

    return true; // Continue traversal
  });

  return result;
}

/**
 * Helper function to insert a text node at a given position
 */
function insertTextNodeAt(
  doc: ProseMirrorNode,
  textNode: ProseMirrorNode,
  pos: number
): ProseMirrorNode {
  // Note: This is a simplified version
  // In a real implementation, you would use proper ProseMirror transforms

  // Find the node at the position
  const nodeAtPos = findNodeAtPos(doc, pos);

  if (!nodeAtPos) return doc;

  // For demonstration purposes only - not a proper implementation
  // A real implementation would use ProseMirror's transform API
  return doc;
}

/**
 * Gets all change IDs from a document
 */
export function getChangeIds(doc: ProseMirrorNode): {
  additions: string[];
  deletions: string[];
} {
  const additions: string[] = [];
  const deletions: string[] = [];

  doc.descendants((node, pos) => {
    if (node.isText) {
      // Check for addition marks
      const additionMarks = node.marks.filter(
        (mark) => mark.type.name === "addition"
      );
      additionMarks.forEach((mark) => {
        if (mark.attrs.id && !additions.includes(mark.attrs.id)) {
          additions.push(mark.attrs.id);
        }
      });

      // Check for deletion marks
      const deletionMarks = node.marks.filter(
        (mark) => mark.type.name === "deletion"
      );
      deletionMarks.forEach((mark) => {
        if (mark.attrs.id && !deletions.includes(mark.attrs.id)) {
          deletions.push(mark.attrs.id);
        }
      });
    }
  });

  return { additions, deletions };
}

/**
 * Apply a set of changes to a document
 */
export function applyChanges(
  doc: ProseMirrorNode,
  changeIds: string[],
  accept: boolean
): ProseMirrorNode {
  if (!changeIds.length) {
    return doc;
  }

  // Deep clone the document to avoid modifying the original
  let resultDoc = doc;

  // Process each change ID
  changeIds.forEach((changeId) => {
    // Find nodes with this change ID
    resultDoc.descendants((node, pos) => {
      if (node.isText) {
        // Check for the specified changeId in marks
        const changeMarks = node.marks.filter(
          (mark) =>
            (mark.type.name === "addition" || mark.type.name === "deletion") &&
            mark.attrs.id === changeId
        );

        if (changeMarks.length > 0) {
          changeMarks.forEach((mark) => {
            if (mark.type.name === "addition") {
              // For additions: accept = keep content, reject = remove content
              if (!accept) {
                // Remove this node or content
                // This is simplified - would need proper transforms
              }
              // If accepting, remove only the mark but keep content
              // This is simplified - would need proper transforms
            } else if (mark.type.name === "deletion") {
              // For deletions: accept = confirm deletion, reject = keep content
              if (accept) {
                // Remove this node or content
                // This is simplified - would need proper transforms
              }
              // If rejecting, remove only the mark but keep content
              // This is simplified - would need proper transforms
            }
          });
        }
      }
    });
  });

  // Note: This implementation is incomplete and would need proper transforms
  // to correctly modify the document

  return resultDoc;
}

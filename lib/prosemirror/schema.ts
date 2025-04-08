import { Schema } from "prosemirror-model";
import { marks as basicMarks } from "prosemirror-schema-basic";
import { bulletList, listItem, orderedList } from "prosemirror-schema-list";

/**
 * Extended nodes for our document schema
 * Includes basic nodes from prosemirror-schema-basic plus list nodes
 */
const nodes = {
  // Text node - required for content
  text: {
    group: "inline",
  },

  // Hard break node
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM() {
      return ["br"];
    },
  },

  // Paragraph node
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() {
      return ["p", 0];
    },
  },

  // Document node
  doc: {
    content: "block+",
  },

  // List nodes
  bullet_list: {
    ...bulletList,
    content: "list_item+",
    group: "block",
  },
  ordered_list: {
    ...orderedList,
    content: "list_item+",
    group: "block",
  },
  list_item: {
    ...listItem,
    content: "paragraph block*",
  },
};

/**
 * Extended marks for our document schema
 * Includes basic marks (strong, em, link, etc.) plus custom marks for change tracking
 */
const marks = {
  // Basic marks
  ...basicMarks,

  // Custom marks for tracking changes
  addition: {
    attrs: { id: { default: null } },
    inclusive: true,
    parseDOM: [{ tag: "span.addition" }],
    toDOM: () => ["span", { class: "addition" }, 0],
  },
  deletion: {
    attrs: { id: { default: null } },
    inclusive: true,
    parseDOM: [{ tag: "span.deletion" }],
    toDOM: () => ["span", { class: "deletion" }, 0],
  },
  modification: {
    attrs: { id: { default: null } },
    inclusive: true,
    parseDOM: [{ tag: "span.modification" }],
    toDOM: () => ["span", { class: "modification" }, 0],
  },
};

/**
 * Our custom document schema with extended nodes and marks
 */
const documentSchema = new Schema({
  nodes,
  marks,
});

export default documentSchema;

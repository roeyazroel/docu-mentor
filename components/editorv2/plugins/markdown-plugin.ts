import { MarkdownPlugin, type MdMdxJsxTextElement } from '@udecode/plate-markdown'; // Import type if needed
import remarkMdx from 'remark-mdx';
export const markdownPlugin = MarkdownPlugin.configure({
  options: {
    rules: {
      // Key matches:
      // 1. the plugin 'key' or 'type' of the Slate element.
      // 2. the mdast(https://github.com/syntax-tree/mdast) node type.
      // 3. the mdx tag name.
      date: {
        // Rule for Markdown -> Slate
        deserialize(mdastNode: MdMdxJsxTextElement, deco, options) {
          // Extract data from the MDX node attributes or children
          // In this simple case, we assume the date is the first child's value
          const dateValue = (mdastNode.children?.[0] as any)?.value || '';

          return {
            type: 'date',
            date: dateValue,
            children: [{ text: '' }], // Ensure valid Slate structure
          };
        },
        // Rule for Slate -> Markdown (MDX)
        serialize: (slateNode): MdMdxJsxTextElement => {
          // Create an MDX text element node
          return {
            type: 'mdxJsxTextElement',
            name: 'date', // Tag name for the MDX element
            attributes: [], // Add attributes if needed: [{ type: 'mdxJsxAttribute', name: 'date', value: slateNode.date }]
            children: [{ type: 'text', value: slateNode.date || '1999-01-01' }], // Content inside the tag
          };
        },
      },
      // Add rules for other custom elements (mentions, etc.) here
    },
    remarkPlugins: [remarkMdx, /* other plugins like remarkGfm */], // Ensure remarkMdx is included
  },
});

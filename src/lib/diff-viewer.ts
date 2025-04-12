import {
  DIFF_DELETE,
  DIFF_EQUAL,
  DIFF_INSERT,
  diff_match_patch,
} from "diff-match-patch";

/**
 * Generates an HTML representation of the differences between two texts.
 *
 * @param originalText The original text.
 * @param suggestedText The suggested new text.
 * @returns An HTML string visualizing the diffs.
 */
export function generateDiffHtml(
  originalText: string,
  suggestedText: string
): string {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(originalText, suggestedText);

  // Improve the semantic quality of the diff
  dmp.diff_cleanupSemantic(diffs);

  let html = "";
  for (const [op, text] of diffs) {
    // Sanitize text to prevent XSS if rendering directly as HTML
    const sanitizedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/\n/g, "<br>"); // Keep line breaks visible

    switch (op) {
      case DIFF_INSERT:
        html += `<span class="diff-insert">${sanitizedText}</span>`;
        break;
      case DIFF_DELETE:
        html += `<span class="diff-delete">${sanitizedText}</span>`;
        break;
      case DIFF_EQUAL:
        html += `<span class="diff-equal">${sanitizedText}</span>`;
        break;
    }
  }

  return html;
}

// --- Example Usage ---

/*
// Assuming you have the original document content and the AI's suggested content:
const originalContent = `This is the original document text. It has several sentences.`;
const aiSuggestion = `This is the UPDATED document text. It contains several sentences.`;

// Generate the HTML diff
const diffHtml = generateDiffHtml(originalContent, aiSuggestion);

// Inject the HTML into a container element in your UI
const diffContainer = document.getElementById('diff-container'); // Assuming you have an element with this ID
if (diffContainer) {
  diffContainer.innerHTML = diffHtml;
}
*/

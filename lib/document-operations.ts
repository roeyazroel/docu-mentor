/**
 * Utilities for intelligent document operations
 */

type DocumentSection = {
  type: "heading" | "paragraph" | "list" | "code" | "other"
  content: string
  level?: number // For headings
  startLine: number
  endLine: number
}

/**
 * Parses a markdown document into sections
 */
export function parseDocumentSections(markdown: string): DocumentSection[] {
  const lines = markdown.split("\n")
  const sections: DocumentSection[] = []

  let currentSection: DocumentSection | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check for headings
    if (line.startsWith("#")) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.endLine = i - 1
        sections.push(currentSection)
      }

      // Count heading level
      let level = 0
      while (line[level] === "#" && level < line.length) {
        level++
      }

      currentSection = {
        type: "heading",
        content: line,
        level,
        startLine: i,
        endLine: i,
      }

      sections.push(currentSection)
      currentSection = null
    }
    // Check for code blocks
    else if (line.startsWith("```")) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.endLine = i - 1
        sections.push(currentSection)
      }

      // Find the end of the code block
      let endCodeBlock = i
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("```")) {
          endCodeBlock = j
          break
        }
      }

      sections.push({
        type: "code",
        content: lines.slice(i, endCodeBlock + 1).join("\n"),
        startLine: i,
        endLine: endCodeBlock,
      })

      i = endCodeBlock
      currentSection = null
    }
    // Check for list items
    else if (line.match(/^(\s*[-*+]|\s*\d+\.)\s/)) {
      if (currentSection && currentSection.type !== "list") {
        currentSection.endLine = i - 1
        sections.push(currentSection)
        currentSection = null
      }

      if (!currentSection) {
        currentSection = {
          type: "list",
          content: line,
          startLine: i,
          endLine: i,
        }
      } else {
        currentSection.content += "\n" + line
        currentSection.endLine = i
      }
    }
    // Handle paragraphs and other content
    else {
      if (line.trim() === "") {
        if (currentSection) {
          currentSection.endLine = i - 1
          sections.push(currentSection)
          currentSection = null
        }
      } else {
        if (!currentSection) {
          currentSection = {
            type: "paragraph",
            content: line,
            startLine: i,
            endLine: i,
          }
        } else {
          currentSection.content += "\n" + line
          currentSection.endLine = i
        }
      }
    }
  }

  // Add the last section if exists
  if (currentSection) {
    currentSection.endLine = lines.length - 1
    sections.push(currentSection)
  }

  return sections
}

/**
 * Intelligently applies AI changes to a document
 */
export function applyIntelligentChanges(originalDocument: string, aiResponse: string): string {
  // If the document is empty or very short, just use the AI response
  if (!originalDocument || originalDocument.trim().length < 50) {
    return aiResponse
  }

  const originalSections = parseDocumentSections(originalDocument)
  const aiSections = parseDocumentSections(aiResponse)

  // If the AI response is a complete rewrite (very different structure)
  if (Math.abs(originalSections.length - aiSections.length) > originalSections.length * 0.5) {
    return aiResponse
  }

  // Check if the AI response is focused on a specific section
  // This is a heuristic - if the AI response is much shorter than the original
  // and contains similar text to a section, it's likely a targeted edit
  if (aiResponse.length < originalDocument.length * 0.5) {
    // Find the section that best matches the AI response
    let bestMatchIndex = -1
    let bestMatchScore = 0

    for (let i = 0; i < originalSections.length; i++) {
      const section = originalSections[i]
      const score = calculateSimilarity(section.content, aiResponse)

      if (score > bestMatchScore) {
        bestMatchScore = score
        bestMatchIndex = i
      }
    }

    // If we found a good match, replace just that section
    if (bestMatchScore > 0.3 && bestMatchIndex !== -1) {
      const newSections = [...originalSections]
      newSections[bestMatchIndex] = {
        ...newSections[bestMatchIndex],
        content: aiResponse,
      }

      return rebuildDocument(newSections)
    }
  }

  // Check for section-by-section changes
  // This looks for sections with the same headings and replaces their content
  const updatedSections = [...originalSections]
  let madeChanges = false

  for (const aiSection of aiSections) {
    if (aiSection.type === "heading") {
      // Find matching heading in original
      const matchingIndex = originalSections.findIndex(
        (s) =>
          s.type === "heading" &&
          s.level === aiSection.level &&
          s.content.trim().toLowerCase() === aiSection.content.trim().toLowerCase(),
      )

      if (matchingIndex !== -1) {
        // Find all sections under this heading until the next heading of same or higher level
        const nextHeadingIndex = originalSections.findIndex(
          (s, i) =>
            i > matchingIndex &&
            s.type === "heading" &&
            s.level <= (originalSections[matchingIndex] as DocumentSection).level,
        )

        const endIndex = nextHeadingIndex !== -1 ? nextHeadingIndex - 1 : originalSections.length - 1

        // Find corresponding content in AI response
        const aiNextHeadingIndex = aiSections.findIndex(
          (s, i) => i > aiSections.indexOf(aiSection) && s.type === "heading" && s.level <= aiSection.level,
        )

        const aiEndIndex = aiNextHeadingIndex !== -1 ? aiNextHeadingIndex - 1 : aiSections.length - 1

        // Replace content between headings
        const aiContent = aiSections
          .slice(aiSections.indexOf(aiSection) + 1, aiEndIndex + 1)
          .map((s) => s.content)
          .join("\n")

        if (aiContent.trim()) {
          // Replace the content after the heading
          if (matchingIndex < endIndex) {
            // Remove old sections
            updatedSections.splice(matchingIndex + 1, endIndex - matchingIndex)

            // Add new section with AI content
            updatedSections.splice(matchingIndex + 1, 0, {
              type: "paragraph",
              content: aiContent,
              startLine: 0, // These will be recalculated when rebuilding
              endLine: 0,
            })

            madeChanges = true
          }
        }
      }
    }
  }

  if (madeChanges) {
    return rebuildDocument(updatedSections)
  }

  // If we couldn't make targeted changes, fall back to the full replacement
  return aiResponse
}

/**
 * Calculate similarity between two strings (simple implementation)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(Boolean))
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(Boolean))

  let commonWords = 0
  for (const word of words1) {
    if (words2.has(word)) {
      commonWords++
    }
  }

  return commonWords / Math.max(words1.size, words2.size)
}

/**
 * Rebuild document from sections
 */
function rebuildDocument(sections: DocumentSection[]): string {
  return sections.map((s) => s.content).join("\n")
}

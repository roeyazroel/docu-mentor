/**
 * Removes human-like feedback phrases from AI responses
 * @param text The AI response text
 * @returns Cleaned text without human feedback phrases
 */
export function cleanAiResponse(text: string): string {
  // Common patterns in AI responses that should be removed
  const patterns = [
    /^(Sure!|Certainly!|Here's|Here is|I'd be happy to|I would be happy to|I've|I have|Let me|I'll|I will|Here you go|Absolutely|Of course)[^]*?(:\s*|!\s*|\.\.\.?\s*)/i,
    /^(Here's the revised|Here is the revised|Here's an improved|Here is an improved|I've revised|I have revised)[^]*?(:\s*|!\s*|\.\.\.?\s*)/i,
    /^(The revised|The improved|An improved|A revised)[^]*?(:\s*|!\s*|\.\.\.?\s*)/i,
    /^(Below is|Following is|Here's what|Here is what)[^]*?(:\s*|!\s*|\.\.\.?\s*)/i,
    /^(I've created|I have created|I've drafted|I have drafted)[^]*?(:\s*|!\s*|\.\.\.?\s*)/i,
    /^(As requested|Based on your request|As per your request)[^]*?(:\s*|!\s*|\.\.\.?\s*)/i,
  ]

  let cleanedText = text

  // Apply each pattern
  for (const pattern of patterns) {
    cleanedText = cleanedText.replace(pattern, "")
  }

  // Remove trailing explanations
  cleanedText = cleanedText.replace(
    /\n\n(I hope this helps|Let me know if|Is there anything else|Would you like|Hope this is what|Please let me know)[^]*?$/i,
    "",
  )

  return cleanedText.trim()
}

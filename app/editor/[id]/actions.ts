"use server";

import { openaiClient } from "@/lib/openai";
import { cleanAiResponse } from "@/lib/text-processing";
import { generateText } from "ai";

/**
 * Generates an AI response based on the provided prompt and document content using OpenAI.
 * This is a server action and should only be called from the server or client components
 * after verifying the necessary API keys are available.
 * @param prompt The user's input prompt.
 * @param documentContent The current content of the document.
 * @returns The cleaned AI-generated text response.
 * @throws {Error} If the AI generation fails.
 */
export async function generateAiResponse(
  prompt: string,
  documentContent: string
): Promise<string> {
  const systemPrompt = `You are an AI writing assistant helping with document creation and editing.
Provide helpful responses. When suggesting improvements to text, focus on:
1. Clarity and readability
2. Grammar and style
3. Structure and organization
4. Tone consistency

The current document content is:
"""
${documentContent || "[Empty document]"}
"""

IMPORTANT: When providing revised text or suggestions, DO NOT include phrases like "Here's the revised text" or "I hope this helps".
Just provide the actual content without any commentary. The user will see your response in a diff view.`;

  try {
    const { text } = await generateText({
      model: await openaiClient("gpt-4o"),
      prompt: prompt,
      system: systemPrompt,
    });

    // Clean the AI response to remove any human-like feedback phrases
    const cleanedResponse = cleanAiResponse(text);
    return cleanedResponse;
  } catch (error) {
    console.error("Error generating AI response via server action:", error);
    // Re-throw the error to be caught by the calling function
    throw new Error("Failed to generate AI response.");
  }
}

"use server";

import { openaiClient } from "@/lib/openai";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * Response schema for AI-generated content
 */
const AiResponseSchema = z.object({
  content: z
    .string()
    .describe("The full text with all suggested changes applied"),
  summary: z
    .string()
    .describe("A concise summary of what changes were made to the document"),
});

/**
 * Type definition for the AI response
 */
export type AiResponseType = z.infer<typeof AiResponseSchema>;

/**
 * Generates an AI response based on the provided prompt and document content using OpenAI.
 * This is a server action and should only be called from the server or client components
 * after verifying the necessary API keys are available.
 * @param prompt The user's input prompt.
 * @param documentContent The current content of the document.
 * @returns The AI-generated response with content and summary.
 * @throws {Error} If the AI generation fails.
 */
export async function generateAiResponse(
  prompt: string,
  documentContent: string
): Promise<AiResponseType> {
  const systemPrompt = `You are an AI writing assistant helping with document creation and editing.
Provide helpful responses. When suggesting improvements to text, focus on:
1. Clarity and readability
2. Grammar and style
3. Structure and organization
4. Tone consistency
5. Always return the full text (with the suggested changes applied), not just a partial text.
6. Always return the text in markdown style without the "markdown" prefix.

The current document content is:
"""
${documentContent || "[Empty document]"}
"""

IMPORTANT: Return your response in two parts:
1. The 'content' field should contain the complete text with your suggested changes applied.
2. The 'summary' field should contain a brief explanation of what changes you made and why.

Do not include phrases like "Here's the revised text" or "I hope this helps" in either field.`;

  try {
    const { object } = await generateObject({
      model: await openaiClient("gpt-4o"),
      prompt: prompt,
      system: systemPrompt,
      schema: AiResponseSchema,
    });

    // Clean the AI response content to remove any human-like feedback phrases
    // const cleanedContent = cleanAiResponse();

    return {
      content: object.content,
      summary: object.summary,
    };
  } catch (error) {
    console.error("Error generating AI response via server action:", error);
    // Re-throw the error to be caught by the calling function
    throw new Error("Failed to generate AI response.");
  }
}

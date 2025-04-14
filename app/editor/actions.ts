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
    .optional()
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
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[],
  documentContent: string
): Promise<AiResponseType> {
  const systemPrompt = `You are an AI writing assistant helping with document creation and editing.
Provide helpful responses. When suggesting improvements to text, focus on:
1. Clarity and readability
2. Grammar and style
3. Structure and organization
4. Tone consistency

You have two main functions:
- Answering questions about the document or writing in general
- Making changes to the document content

Response guidelines:
1. If the user asks you to make changes to the text, return the full modified content in the 'content' field.
2. If the user asks a question without requesting changes, return an empty string in the 'content' field.
3. Always provide your answer or explanation in the 'summary' field.
4. Return text in markdown style without the "markdown" prefix.

The current document content is:
"""
${documentContent || "[Empty document]"}
"""

IMPORTANT: Return your response in two parts:
1. The 'content' field should contain ONLY the complete text with your suggested changes applied, or an empty string if no changes were requested.
2. The 'summary' field should contain either an explanation of what changes you made or the answer to the user's question.

Do not include phrases like "Here's the revised text" or "I hope this helps" in either field.`;

  try {
    const { object } = await generateObject({
      model: await openaiClient("gpt-4o"),
      messages: messages,
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

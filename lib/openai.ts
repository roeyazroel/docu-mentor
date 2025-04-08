"use server";

// This file handles OpenAI API configuration
import { openai } from "@ai-sdk/openai";

// Create a configured OpenAI client
export const openaiClient = async (model = "gpt-4o") => {
  return openai(model);
};

// Function to check if OpenAI API key is available
export const hasOpenAIKey = async () => {
  return !!process.env.OPENAI_API_KEY;
};

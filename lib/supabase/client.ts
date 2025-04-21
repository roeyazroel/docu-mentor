import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

console.log("Loading environment variables...");
try {
  const envPath = path.resolve(process.cwd(), ".env");
  console.log(".env file exists:", fs.existsSync(envPath));

  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));

    // Manually set environment variables to avoid duplications in .env
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
    }

    console.log("Environment variables successfully loaded from:", envPath);
  } else {
    console.error("ERROR: .env file not found at", envPath);
  }
} catch (error) {
  console.error("Error loading .env file:", error);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

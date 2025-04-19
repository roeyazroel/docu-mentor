// server.ts - Custom Next.js server with WebSocket support
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Make sure the environment variables are loaded before anything else
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

// Now import other modules after environment variables are loaded
import express, { Request, Response } from "express";
import http from "http";
import next from "next";
import { setupWebSocketServer } from "./lib/websocket/server";

// Log for debugging
console.log(
  "Main server - OPENAI_API_KEY exists:",
  !!process.env.OPENAI_API_KEY
);
console.log(
  "Main server - CLERK_SECRET_KEY exists:",
  !!process.env.CLERK_SECRET_KEY
);

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });

  setupWebSocketServer(server);

  // Handle standard HTTP requests through Next.js
  app.all("/{*splat}", (req: Request, res: Response) => handle(req, res));
});

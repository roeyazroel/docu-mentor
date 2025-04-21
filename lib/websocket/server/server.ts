import { createClerkClient } from "@clerk/backend";
import http from "http";
import { WebSocketServer } from "ws";
import { authGuard } from "./auth";
import { handleCommand } from "./commandHandler";
import { Client, clients, fileRooms, fileUsers } from "./types";
import { broadcast, getFilePath, leaveAllOrganizations } from "./utils";

// Timeout constants (in milliseconds)
const PING_INTERVAL = 30000; // Send ping every 30 seconds
const CONNECTION_TIMEOUT = 60000; // Consider connection dead after 60 seconds without pong

/**
 * Sets up the WebSocket server and event handlers
 */
export function setupWebSocketServer(server: http.Server): WebSocketServer {
  console.log("[setupWebSocketServer] Initializing WebSocket server");

  // Log environment variables for debugging
  console.log(
    "WebSocket Server - CLERK_SECRET_KEY exists:",
    !!process.env.CLERK_SECRET_KEY
  );
  console.log(
    "WebSocket Server - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists:",
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  // Initialize Clerk client with values from environment
  const secretKey = process.env.CLERK_SECRET_KEY || "";
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  if (!secretKey || !publishableKey) {
    console.error("ERROR: Clerk API keys are missing or undefined!");
  }

  // Initialize Clerk client
  const clerkClient = createClerkClient({
    secretKey,
    publishableKey,
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (req, socket, head) => {
    const pathname = new URL(req.url || "/", `http://${req.headers.host}`)
      .pathname;
    if (pathname === "/api/ws") {
      console.log(
        `[upgrade] WebSocket upgrade request from ${req.headers.host}`
      );

      // Authenticate the connection
      try {
        console.log("[upgrade] Authenticating connection");
        const auth = await authGuard(req, clerkClient);
        if (!auth) {
          console.warn("[upgrade] Authentication failed, rejecting connection");
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        // Handle the upgrade with the authenticated user
        wss.handleUpgrade(req, socket, head, (ws: Client) => {
          // Attach auth info to the WebSocket client
          ws.userId = auth.userId;
          ws.userName = "user-" + auth.userId; // Use userId as a fallback
          ws.auth = auth;

          console.log(
            `[upgrade] Authenticated user: ${ws.userId} (${ws.userName})`
          );
          wss.emit("connection", ws, req);
        });
      } catch (error) {
        console.error("[upgrade] Error in authentication:", error);
        socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        socket.destroy();
      }
    }
  });

  wss.on("connection", (ws: Client) => {
    console.log(
      `[connection] New WebSocket connection for user ${
        ws.userId
      }, total clients: ${clients.size + 1}`
    );
    clients.add(ws);

    // Initialize lastPingTime on connection
    ws.lastPingTime = Date.now();

    ws.on("message", (msg) => {
      console.log("[server] Raw message received:", msg.toString());
      try {
        const parsed = JSON.parse(msg.toString());

        // Add detailed logging for update_file commands
        if (parsed.type === "update_file") {
          console.log("-------------------------------------------");
          console.log("📝 UPDATE_FILE COMMAND RECEIVED");
          console.log(`File ID: ${parsed.path}`);
          console.log(`Organization: ${parsed.organizationId || "default"}`);
          console.log(`Session ID: ${parsed.sessionId || "unknown"}`);
          console.log(`User ID: ${ws.userId || "unknown"}`);
          console.log(`Has content: ${Boolean(parsed.content)}`);
          console.log(
            `Content length: ${
              parsed.content ? parsed.content.length : 0
            } chars`
          );
          console.log(
            `Content preview: ${
              parsed.content ? parsed.content.substring(0, 50) + "..." : "none"
            }`
          );
          console.log("-------------------------------------------");
        }

        parsed.organizationId = parsed.organizationId || "default";

        // Add user ID from the authenticated connection if not in message
        if (!parsed.userId && ws.userId) {
          parsed.userId = ws.userId;
        }

        handleCommand(ws, parsed);
      } catch (err) {
        console.error("Invalid message:", err);
      }
    });

    ws.on("close", () => {
      console.log(
        `[close] WebSocket connection closed for user ${
          ws.userId
        }, remaining clients: ${clients.size - 1}`
      );
      clients.delete(ws);

      // Remove from organization rooms
      leaveAllOrganizations(ws);

      // Clean up from file rooms and notify other clients
      for (const [fileId, room] of fileRooms.entries()) {
        if (room.has(ws)) {
          const filePath = getFilePath(fileId);
          console.log(
            `[close] Removing client from room for file ID: ${fileId}${
              filePath ? ` (path: ${filePath})` : ""
            }`
          );

          // Send user_left notification if we have user info
          if (ws.userId && ws.sessionId) {
            broadcast(
              fileId,
              {
                type: "user_left",
                path: filePath,
                id: fileId,
                userId: ws.userId,
                sessionId: ws.sessionId,
              },
              null // Send to all clients since this one is already disconnected
            );
          }

          // Remove from room
          room.delete(ws);

          // Check if this was the last instance of this userId
          let userStillActive = false;
          for (const client of room) {
            if (client.userId === ws.userId) {
              userStillActive = true;
              break;
            }
          }

          // If no other clients with this userId, remove from fileUsers
          if (!userStillActive && ws.userId) {
            fileUsers.get(fileId)?.delete(ws.userId);
          }
        }

        // Clean up empty rooms
        if (room.size === 0) {
          const filePath = getFilePath(fileId);
          console.log(
            `[close] No clients left in room for file ID: ${fileId}${
              filePath ? ` (path: ${filePath})` : ""
            }, cleaning up`
          );
          fileRooms.delete(fileId);
          fileUsers.delete(fileId);
        }
      }
    });
  });

  // Set up the ping interval to detect dead connections
  const pingInterval = setInterval(() => {
    const now = Date.now();

    // Check each client for connection health
    clients.forEach((client) => {
      // If client hasn't received a pong in too long, terminate the connection
      if (
        client.lastPingTime &&
        now - client.lastPingTime > CONNECTION_TIMEOUT
      ) {
        console.log("[pingInterval] Client connection timed out, terminating");
        return client.terminate();
      }

      // Send a ping to check connection health
      if (client.readyState === WebSocket.OPEN) {
        const pingTimestamp = now;
        console.log("[pingInterval] Sending ping to client");

        try {
          client.send(
            JSON.stringify({
              type: "ping",
              timestamp: pingTimestamp,
            })
          );
        } catch (error) {
          console.error("[pingInterval] Error sending ping:", error);
          client.terminate();
        }
      }
    });
  }, PING_INTERVAL);

  // Clean up the interval when the server closes
  wss.on("close", () => {
    console.log("[close] WebSocket server closing, clearing ping interval");
    clearInterval(pingInterval);
  });

  return wss;
}

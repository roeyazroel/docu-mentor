import { WebSocket } from "ws";
import {
  Client,
  Message,
  fileRooms,
  fileUsers,
  fsTree,
  idToPath,
  orgClients,
  pathToId,
  userDetails,
} from "./types";

/**
 * Gets or creates a file ID for a given path
 */
export function getFileId(filePath: string): string {
  if (pathToId.has(filePath)) {
    return pathToId.get(filePath)!;
  }

  // If no ID exists yet, create one
  // Using the path itself as the ID for now
  // In a real implementation, you might use UUIDs or another ID generation method
  const fileId = filePath;

  // Store the mapping
  pathToId.set(filePath, fileId);
  idToPath.set(fileId, filePath);

  return fileId;
}

/**
 * Gets a file path from a file ID
 */
export function getFilePath(fileId: string): string | undefined {
  return idToPath.get(fileId);
}

/**
 * Extracts a valid organization ID from the message, defaulting to 'default'
 */
export function getOrgId(msg: Message): string {
  return typeof msg.organizationId === "string" &&
    msg.organizationId.trim() !== ""
    ? msg.organizationId
    : "default";
}

/**
 * Broadcasts a message to all clients in a file room
 */
export function broadcast(
  fileId: string,
  data: any,
  exclude: Client | null = null
): void {
  // Auto-create room if it doesn't exist
  if (!fileRooms.has(fileId)) {
    console.log(`[broadcast] Creating missing room for file ID: ${fileId}`);
    fileRooms.set(fileId, new Set());
    // Also initialize fileUsers if needed
    if (!fileUsers.has(fileId)) {
      fileUsers.set(fileId, new Set());
    }
  }

  const room = fileRooms.get(fileId);
  if (!room) {
    console.log(`[broadcast] Failed to get/create room for file ID: ${fileId}`);
    return;
  }

  console.log(
    `[broadcast] Sending to ${room.size} clients for file ID: ${fileId}`
  );

  // Enhanced logging for file_updated messages
  if (data.type === "file_updated") {
    console.log("--------- FILE ROOM BROADCAST ---------");
    console.log(`File ID: ${data.id || fileId}`);
    const filePath = getFilePath(fileId);
    if (filePath) {
      console.log(`File Path: ${filePath}`);
    }
    console.log(`Room size: ${room.size}`);
    console.log(`Has content: ${Boolean(data.content)}`);
    console.log(
      `Content length: ${data.content ? data.content.length : 0} chars`
    );

    // Log all clients in room with their IDs and session IDs
    let clientCounter = 0;
    for (const client of room) {
      clientCounter++;
      console.log(
        `  Client ${clientCounter}: userId=${
          client.userId || "unknown"
        }, sessionId=${client.sessionId || "unknown"}, excluded=${
          client === exclude
        }`
      );
    }
    console.log("---------------------------------------");
  }

  let sentCount = 0;
  for (const client of room) {
    const shouldSend =
      client !== exclude && client.readyState === WebSocket.OPEN;
    if (shouldSend) {
      try {
        client.send(JSON.stringify(data));
        sentCount++;
      } catch (err) {
        console.error(
          `[broadcast] Error sending to client (userId=${client.userId}, sessionId=${client.sessionId}):`,
          err
        );
      }
    } else {
      console.log(
        `[broadcast] Skipping client: userId=${
          client.userId || "unknown"
        }, sessionId=${client.sessionId || "unknown"}, excluded=${
          client === exclude
        }, state=${client.readyState}`
      );
    }
  }
  console.log(`[broadcast] Actually sent to ${sentCount} clients`);
}

/**
 * Broadcasts a message to all clients in an organization
 * This is used for file tree updates that should reach all connected clients
 */
export function broadcastToOrganization(
  orgId: string,
  data: any,
  exclude: Client | null = null
): void {
  const clients = orgClients.get(orgId);
  if (!clients || clients.size === 0) {
    console.log(`[broadcastToOrganization] No clients found for org: ${orgId}`);
    return;
  }

  console.log(
    `[broadcastToOrganization] Sending to ${clients.size} clients for org: ${orgId}`
  );

  // Enhanced logging for file_updated messages
  if (data.type === "file_updated") {
    console.log("--------- ORGANIZATION BROADCAST ---------");

    // Get file ID and path information
    const fileId = data.id;
    let filePath = data.path;

    // If we only have ID, get the path from it
    if (fileId && !filePath) {
      filePath = getFilePath(fileId);
    }
    // If we only have path, get the ID from it
    else if (!fileId && filePath) {
      data.id = getFileId(filePath);
    }

    console.log(`File ID: ${data.id || "unknown"}`);
    console.log(`File Path: ${filePath || "unknown"}`);
    console.log(`Organization: ${orgId}`);
    console.log(`Has content: ${Boolean(data.content)}`);
    console.log(
      `Content length: ${data.content ? data.content.length : 0} chars`
    );
    console.log(
      `Content preview: ${
        data.content ? data.content.substring(0, 50) + "..." : "none"
      }`
    );
    console.log("------------------------------------------");
  }

  let sentCount = 0;
  for (const client of clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
      sentCount++;
    }
  }
  console.log(
    `[broadcastToOrganization] Actually sent to ${sentCount} clients`
  );
}

/**
 * Adds a client to a file room
 * @param ws The WebSocket client
 * @param filePathOrId The file path or ID
 * @param userId The user ID
 */
export function joinFile(
  ws: Client,
  filePathOrId: string,
  userId: string
): void {
  let fileId: string;
  let filePath: string | undefined;

  // Check if the input is a file ID or path
  if (idToPath.has(filePathOrId)) {
    // It's an ID
    fileId = filePathOrId;
    filePath = idToPath.get(fileId);
  } else {
    // It's a path
    filePath = filePathOrId;
    fileId = getFileId(filePath);
  }

  console.log(
    `[joinFile] User ${userId} joining file: ${
      filePath || "unknown"
    } (ID: ${fileId}, session: ${ws.sessionId || "unknown"})`
  );

  // Store additional user details if provided in the message
  if (ws.userName) {
    userDetails.set(userId, {
      name: ws.userName,
      avatar: ws.avatarUrl || "",
    });
  }

  // Register to file-specific room using fileId
  if (!fileRooms.has(fileId)) fileRooms.set(fileId, new Set());
  if (!fileUsers.has(fileId)) fileUsers.set(fileId, new Set());

  fileRooms.get(fileId)?.add(ws);
  fileUsers.get(fileId)?.add(userId);

  // Send current file content if it exists (for collaborative editing)
  const orgId = ws.organizationId || "default";
  if (
    filePath &&
    orgId &&
    fsTree[orgId] &&
    fsTree[orgId][filePath]?.type === "file"
  ) {
    ws.send(
      JSON.stringify({
        type: "file_info",
        id: fileId,
        path: filePath,
        name: fsTree[orgId][filePath].name,
        content: fsTree[orgId][filePath].content,
        parentId: fsTree[orgId][filePath].parentId,
        organizationId: orgId,
      })
    );
    console.log(`[joinFile] Sent current file content to user ${userId}`);
  }

  // Get user names, avatars, and session IDs for all users in the room
  const users: string[] = [];
  const sessionIds: string[] = [];
  const userNames: string[] = [];
  const avatars: string[] = [];

  // Deduplicate users by sessionId to prevent phantom users
  const seenSessions = new Set<string>();

  // Collect session IDs and user info
  for (const client of fileRooms.get(fileId) || []) {
    // Skip clients without userId or sessionId
    if (!client.userId || !client.sessionId) continue;

    // Skip duplicates
    const sessionKey = client.sessionId;
    if (seenSessions.has(sessionKey)) continue;
    seenSessions.add(sessionKey);

    users.push(client.userId);
    sessionIds.push(client.sessionId);
    userNames.push(
      client.userName ||
        userDetails.get(client.userId)?.name ||
        `User ${client.sessionId.substring(0, 4)}`
    );
    avatars.push(
      client.avatarUrl || userDetails.get(client.userId)?.avatar || ""
    );
  }

  // Send back online users to the new user
  ws.send(
    JSON.stringify({
      type: "online_users",
      path: filePath,
      id: fileId,
      users,
      userNames,
      avatars,
      sessionIds,
    })
  );

  // Get user details for the joined user
  const userName = ws.userName || userDetails.get(userId)?.name;
  const avatar = ws.avatarUrl || userDetails.get(userId)?.avatar || "";
  const sessionId = ws.sessionId;

  // Broadcast user_joined to all other clients
  broadcast(
    fileId,
    {
      type: "user_joined",
      path: filePath,
      id: fileId,
      userId,
      userName,
      avatar,
      sessionId,
    },
    ws
  );
}

/**
 * Adds a client to an organization room for file tree updates
 */
export function joinOrganization(ws: Client, orgId: string): void {
  if (!orgId) {
    console.log(`[joinOrganization] No organization ID provided`);
    return;
  }

  console.log(`[joinOrganization] Client joining org: ${orgId}`);

  // Register client to organization
  if (!orgClients.has(orgId)) {
    orgClients.set(orgId, new Set());
  }

  orgClients.get(orgId)?.add(ws);

  // Store organization ID in the client object for cleanup
  ws.organizationId = orgId;

  console.log(
    `[joinOrganization] Org ${orgId} now has ${
      orgClients.get(orgId)?.size
    } clients`
  );
}

/**
 * Removes a client from a file room
 * @param ws The WebSocket client
 * @param filePathOrId The file path or ID
 * @param userId The user ID
 */
export function leaveFile(
  ws: Client,
  filePathOrId: string,
  userId: string
): void {
  let fileId: string;
  let filePath: string | undefined;

  // Check if the input is a file ID or path
  if (idToPath.has(filePathOrId)) {
    // It's an ID
    fileId = filePathOrId;
    filePath = idToPath.get(fileId);
  } else {
    // It's a path
    filePath = filePathOrId;
    fileId = getFileId(filePath);
  }

  const sessionId = ws.sessionId || "unknown";

  console.log(
    `[leaveFile] User ${userId} (session: ${sessionId}) leaving file: ${
      filePath || "unknown"
    } (ID: ${fileId})`
  );

  // Remove this client from the file room
  fileRooms.get(fileId)?.delete(ws);

  // Broadcast user_left to all other clients with session info
  broadcast(
    fileId,
    {
      type: "user_left",
      path: filePath,
      id: fileId,
      userId,
      sessionId,
    },
    ws
  );

  // Check if this was the last client for this userId in this file
  let userStillActive = false;

  // Check if there are any other clients with the same userId in this room
  for (const client of fileRooms.get(fileId) || []) {
    if (client.userId === userId) {
      userStillActive = true;
      break;
    }
  }

  // If no other clients with this userId, remove from fileUsers
  if (!userStillActive) {
    fileUsers.get(fileId)?.delete(userId);
  }

  // Check if room is now empty and clean up if needed
  if ((fileRooms.get(fileId)?.size || 0) === 0) {
    console.log(
      `[leaveFile] No users left in file: ${
        filePath || "unknown"
      } (ID: ${fileId}), cleaning up`
    );
    fileRooms.delete(fileId);
    fileUsers.delete(fileId);
  }
}

/**
 * Removes a client from all organization rooms
 */
export function leaveAllOrganizations(ws: Client): void {
  if (ws.organizationId) {
    const orgId = ws.organizationId;
    console.log(`[leaveAllOrganizations] Client leaving org: ${orgId}`);

    const org = orgClients.get(orgId);
    if (org) {
      org.delete(ws);

      if (org.size === 0) {
        console.log(
          `[leaveAllOrganizations] No clients left in org: ${orgId}, cleaning up`
        );
        orgClients.delete(orgId);
      } else {
        console.log(
          `[leaveAllOrganizations] Org ${orgId} now has ${org.size} clients`
        );
      }
    }
  }
}

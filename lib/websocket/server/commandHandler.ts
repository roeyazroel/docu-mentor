import {
  handleCreateFile,
  handleDeleteFile,
  handleGetFileInfo,
  handleMoveFile,
  handleRenameFile,
  handleUpdateFile,
} from "./fileOperations";
import {
  handleCreateFolder,
  handleDeleteFolder,
  handleMoveFolder,
  handleRenameFolder,
} from "./folderOperations";
import { handleGetFiles } from "./queryOperations";
import { Client, Message } from "./types";
import { joinFile, joinOrganization, leaveFile } from "./utils";

/**
 * Main command handler for WebSocket messages
 */
export function handleCommand(ws: Client, msg: Message): void {
  console.log(`[handleCommand] Received command: ${msg.type}`, msg);

  switch (msg.type) {
    case "create_file":
      handleCreateFile(ws, msg);
      break;

    case "update_file":
      handleUpdateFile(ws, msg);
      break;

    case "delete_file":
      handleDeleteFile(ws, msg);
      break;

    case "rename_file":
      handleRenameFile(ws, msg);
      break;

    case "move_file":
      handleMoveFile(ws, msg);
      break;

    case "create_folder":
      handleCreateFolder(ws, msg);
      break;

    case "rename_folder":
      handleRenameFolder(ws, msg);
      break;

    case "move_folder":
      handleMoveFolder(ws, msg);
      break;

    case "delete_folder":
      handleDeleteFolder(ws, msg);
      break;

    case "get_file_info":
      handleGetFileInfo(ws, msg);
      break;

    case "join_organization": {
      const { organizationId } = msg;
      if (organizationId) {
        console.log(
          `[join_organization] Client joining org: ${organizationId}`
        );
        joinOrganization(ws, organizationId);
      }
      break;
    }

    case "join_file": {
      const {
        path: filePath,
        id: fileId,
        userId,
        userName,
        avatar,
        sessionId,
      } = msg;
      if (userId) {
        // Store user info in the client object
        ws.userId = userId;
        if (userName) ws.userName = userName;
        if (avatar) ws.avatarUrl = avatar;
        if (sessionId) ws.sessionId = sessionId;

        // Use the fileId if provided, otherwise use the path
        if (fileId) {
          console.log(
            `[join_file] User ${userId} joining file with ID: ${fileId}`
          );
          // Find the path from the ID if available
          joinFile(ws, fileId, userId);
        } else if (filePath) {
          console.log(`[join_file] User ${userId} joining file: ${filePath}`);
          joinFile(ws, filePath, userId);
        }
      }
      break;
    }

    case "leave_file": {
      const { path: filePath, id: fileId, userId } = msg;
      if (userId) {
        if (fileId) {
          console.log(
            `[leave_file] User ${userId} leaving file with ID: ${fileId}`
          );
          leaveFile(ws, fileId, userId);
        } else if (filePath) {
          console.log(`[leave_file] User ${userId} leaving file: ${filePath}`);
          leaveFile(ws, filePath, userId);
        }
      }
      break;
    }

    case "get_files":
      handleGetFiles(ws, msg);
      break;

    case "ping": {
      // Respond to client ping with a pong containing the same timestamp
      const { timestamp } = msg;
      if (timestamp) {
        // For debugging in dev, can be removed in production
        console.log(
          `[ping] Received ping from client, timestamp: ${timestamp}`
        );

        // Send pong response with the same timestamp
        ws.send(
          JSON.stringify({
            type: "pong",
            timestamp,
          })
        );
      }
      break;
    }

    case "pong": {
      // Client responded to our ping, update the client's last activity time
      const { timestamp } = msg;
      if (timestamp) {
        // For debugging in dev, can be removed in production
        console.log(
          `[pong] Received pong from client, timestamp: ${timestamp}`
        );

        // Update the timestamp of last successful ping
        ws.lastPingTime = Date.now();
      }
      break;
    }

    default:
      console.warn("Unknown command type:", msg.type);
  }
}

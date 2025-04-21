import { getUserById } from "./auth";
import {
  addUserToOrganization,
  createOrganizationIfNotExists,
  createUserIfNotExists,
  setupDatabaseProcedures,
} from "./database";
import {
  handleCreateFile,
  handleDeleteFile,
  handleGetFileInfo,
  handleMoveFile,
  handleRenameFile,
  handleRevertFileVersion,
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

// Initialize database procedures
setupDatabaseProcedures().catch((err) => {
  console.error("Failed to set up database procedures:", err);
});

/**
 * Main command handler for WebSocket messages
 */
export async function handleCommand(ws: Client, msg: Message): Promise<void> {
  console.log(`[handleCommand] Received command: ${msg.type}`, msg);

  switch (msg.type) {
    case "create_file":
      await handleCreateFile(ws, msg);
      break;

    case "update_file":
      await handleUpdateFile(ws, msg);
      break;

    case "delete_file":
      await handleDeleteFile(ws, msg);
      break;

    case "rename_file":
      await handleRenameFile(ws, msg);
      break;

    case "move_file":
      await handleMoveFile(ws, msg);
      break;

    case "revert_file_version":
      await handleRevertFileVersion(ws, msg);
      break;

    case "create_folder":
      await handleCreateFolder(ws, msg);
      break;

    case "rename_folder":
      await handleRenameFolder(ws, msg);
      break;

    case "move_folder":
      await handleMoveFolder(ws, msg);
      break;

    case "delete_folder":
      await handleDeleteFolder(ws, msg);
      break;

    case "get_file_info":
      await handleGetFileInfo(ws, msg);
      break;

    case "join_organization": {
      const { organizationId } = msg;
      if (organizationId) {
        console.log(
          `[join_organization] Client joining org: ${organizationId}`
        );

        // Ensure the organization exists in the database
        if (ws.userId) {
          try {
            // Create organization if it doesn't exist
            const orgName =
              msg.name || `Organization ${organizationId.substring(0, 8)}`;
            await createOrganizationIfNotExists(organizationId, orgName);

            // Create the user first if needed
            const userId = ws.userId;
            const userName = ws.userName || `User ${userId.substring(0, 8)}`;
            try {
              // Get user email from Clerk
              const user = await getUserById(userId);
              const userEmail = user.emailAddresses[0].emailAddress;
              const avatar = user.imageUrl;

              // Create user if not exists
              await createUserIfNotExists(userId, userName, userEmail, avatar);

              // Now add user to organization
              await addUserToOrganization(userId, organizationId);
            } catch (error) {
              console.error(
                `[join_organization] Error creating user or getting email:`,
                error
              );
            }
          } catch (error) {
            console.error(`[join_organization] Database error:`, error);
          }
        }

        // Join the organization in memory for real-time updates
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

        // Ensure user exists in database
        try {
          const user = await getUserById(userId);
          const userEmail = user.emailAddresses[0].emailAddress;
          const avatar = user.imageUrl;
          await createUserIfNotExists(
            userId,
            userName || `User ${userId.substring(0, 8)}`,
            userEmail,
            avatar
          );

          // If organization ID is provided, ensure user belongs to it
          if (ws.organizationId) {
            await addUserToOrganization(userId, ws.organizationId);
          }
        } catch (error) {
          console.error(`[join_file] Database error creating user:`, error);
        }

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
      await handleGetFiles(ws, msg);
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

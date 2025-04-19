import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnlineUser } from "@/lib/hooks/useFileSystem";
import React from "react";

interface EditorUsersPanelProps {
  /** Array of active users currently in the editor session */
  activeUsers: OnlineUser[];
  /** ID of the current user/session */
  currentUserId: string | null;
}

/**
 * Renders the panel displaying the list of active users in the editor.
 */
export const EditorUsersPanel: React.FC<EditorUsersPanelProps> = ({
  activeUsers,
  currentUserId,
}) => {
  // Format user display name to hide session IDs
  const formatUserName = (user: OnlineUser): string => {
    // Determine if this user is the current session
    const isCurrentSession = user.sessionId === currentUserId;

    // For the current user, always show "You"
    if (isCurrentSession) {
      console.log("isCurrentSession", isCurrentSession);
      return "You";
    }

    // Use the user name if available, otherwise fallback
    return user.name ?? `User ${user.sessionId?.substring(0, 4) ?? user.id}`;
  };

  // Sort users: current user first, then alphabetically
  const sortedUsers = [...activeUsers].sort((a, b) => {
    const isACurrent = a.sessionId === currentUserId;
    const isBCurrent = b.sessionId === currentUserId;

    if (isACurrent) return -1;
    if (isBCurrent) return 1;

    // Use localeCompare with fallback for potentially undefined names
    return (a.name ?? "").localeCompare(b.name ?? "");
  });

  // Count unique authenticated users by ID
  const uniqueUserCount = new Set(
    sortedUsers
      .filter((user) => user.id && user.id !== "anonymous")
      .map((user) => user.id)
  ).size;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Active Users in This File</h3>

      {sortedUsers.length > 0 ? (
        sortedUsers.map((user) => {
          // Determine if this is the current user's session
          const isCurrentUser = user.sessionId === currentUserId;

          return (
            <div
              key={user.id || user.sessionId || `user-${Math.random()}`}
              className="flex items-center gap-2"
            >
              {/* User Avatar & Status Indicator */}
              <div className="relative mr-3 flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.avatar || ""}
                    alt={user.name || user.id}
                  />
                  <AvatarFallback>
                    {(user.name || user.id).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Always show active status indicator */}
                <span
                  className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500`}
                />
              </div>

              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isCurrentUser ? "text-primary" : ""
                  }`}
                >
                  {formatUserName(user)}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-muted-foreground">
          No active users in this file.
        </p>
      )}

      {sortedUsers.length > 0 && (
        <div className="pt-2 mt-2 border-t text-xs text-muted-foreground">
          {uniqueUserCount === 0
            ? "No users editing this file"
            : uniqueUserCount === 1
            ? "1 user editing this file"
            : `${uniqueUserCount} users editing this file`}
        </div>
      )}
    </div>
  );
};

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

// Define the user type based on its usage in page.tsx
interface ActiveUser {
  id: number;
  name: string;
  avatar: string;
  status: string; // Assuming status is just for display logic, could be more specific if needed
}

interface EditorUsersPanelProps {
  /** Array of active users currently in the editor session */
  activeUsers: ActiveUser[];
}

/**
 * Renders the panel displaying the list of active users in the editor.
 */
export const EditorUsersPanel: React.FC<EditorUsersPanelProps> = ({
  activeUsers,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Active Users</h3>
      {activeUsers.map((user) => (
        <div key={user.id} className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {/* Use AvatarImage for user-provided avatars, fallback otherwise */}
            <AvatarImage
              src={user.avatar || undefined}
              alt={`${user.name}'s avatar`}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{user.name}</p>
          </div>
          {/* Assuming 'active' status means online */}
          {user.status === "active" && (
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          )}
          {/* Add handling for other statuses if necessary */}
        </div>
      ))}
      {activeUsers.length === 0 && (
        <p className="text-sm text-muted-foreground">No other active users.</p>
      )}
    </div>
  );
};

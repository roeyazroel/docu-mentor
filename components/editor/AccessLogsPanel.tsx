import { format, formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import {
  ArrowRightLeft,
  Edit,
  Eye,
  FileText,
  Plus,
  Trash,
  Undo2,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface AccessLog {
  id: string;
  node_id: string;
  user_id: string;
  action: "create" | "read" | "update" | "delete" | "rename" | "move";
  timestamp: string; // This could be either timestamp or created_at from DB
  users: User;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface AccessLogsPanelProps {
  logs: AccessLog[];
}

export function AccessLogsPanel({ logs }: AccessLogsPanelProps) {
  const [fileLogs, setFileLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
    // sort logs by timestamp descending
    const sortedLogs = logs.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    setFileLogs(sortedLogs);
  }, [logs]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "read":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "update":
        return <Edit className="h-4 w-4 text-amber-500" />;
      case "delete":
        return <Trash className="h-4 w-4 text-red-500" />;
      case "rename":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "move":
        return <ArrowRightLeft className="h-4 w-4 text-indigo-500" />;
      case "revert":
        return <Undo2 className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create":
        return "Created";
      case "read":
        return "Viewed";
      case "update":
        return "Updated";
      case "delete":
        return "Deleted";
      case "rename":
        return "Renamed";
      case "move":
        return "Moved";
      default:
        return action;
    }
  };

  // Helper function to robustly parse DB UTC timestamps and convert to browser timezone
  const formatLocalTime = (
    dateString: string
  ): { timeAgo: string; fullDate: string } => {
    try {
      // If the string has no timezone, treat as UTC by appending 'Z'
      let isoString = dateString.includes("T")
        ? dateString
        : dateString.replace(" ", "T");
      if (!isoString.endsWith("Z")) isoString += "Z";
      const utcDate = new Date(isoString);
      if (isNaN(utcDate.getTime())) {
        console.error("Invalid date format:", dateString);
        return { timeAgo: "Unknown time", fullDate: "Invalid date" };
      }
      // Convert to browser timezone
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localDate = toZonedTime(utcDate, userTimeZone);
      const timeAgo = formatDistanceToNow(localDate, {
        addSuffix: true,
        locale: enUS,
      });
      const fullDate = format(localDate, "PPpp", { locale: enUS });
      return { timeAgo, fullDate };
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return { timeAgo: "Unknown time", fullDate: "Invalid date" };
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-4">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="font-medium mb-1">No activity yet</h3>
          <p className="text-sm text-muted-foreground">
            File activity will appear here when actions are performed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 flex flex-col h-full">
        <h3 className="font-medium text-sm text-muted-foreground mb-4">
          File Activity History
        </h3>
        <div className="flex-1 min-h-0">
          <div className="space-y-3 overflow-y-auto max-h-[80vh] pr-2">
            {fileLogs.map((log) => {
              const dateString = log.timestamp;
              const { timeAgo, fullDate } = dateString
                ? formatLocalTime(dateString)
                : { timeAgo: "Unknown time", fullDate: "Invalid date" };

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>{getActionIcon(log.action)}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getActionLabel(log.action)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={log.users.avatar_url}
                          alt={log.users.email}
                        />
                        <AvatarFallback>
                          <UserCircle className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {log.users.email}
                      </span>
                    </div>

                    <p className="text-sm mt-1">
                      {getActionLabel(log.action)} this file
                    </p>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-muted-foreground mt-1 cursor-help">
                            {timeAgo}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{fullDate}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

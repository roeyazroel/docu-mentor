import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import { Undo2, UserCircle } from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface FileVersion {
  id: string;
  file_id: string;
  content: string;
  version: number;
  created_by: string;
  created_at: string;
  users: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
  };
}

interface FileHistoryPanelProps {
  fileId: string;
  versions: FileVersion[];
  onRevert: (version: number) => void;
  currentVersion?: number;
}

export const FileHistoryPanel: React.FC<FileHistoryPanelProps> = ({
  fileId,
  versions,
  onRevert,
  currentVersion,
}) => {
  const [isReverting, setIsReverting] = useState<number | null>(null);
  const [versionToRevert, setVersionToRevert] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Sort versions descending (newest first)
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  const handleRevert = async (version: number) => {
    try {
      setIsReverting(version);
      await onRevert(version);
    } finally {
      setIsReverting(null);
      setConfirmDialogOpen(false);
    }
  };

  const openConfirmDialog = (version: number) => {
    setVersionToRevert(version);
    setConfirmDialogOpen(true);
  };

  if (versions.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No version history available for this file.
      </div>
    );
  }
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

  const convertToLocalTime = (dateString: string) => {
    const { timeAgo, fullDate } = dateString
      ? formatLocalTime(dateString)
      : { timeAgo: "Unknown time", fullDate: "Invalid date" };
    return { timeAgo, fullDate };
  };

  return (
    <div className="w-full overflow-auto">
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Revert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert to version {versionToRevert}? This
              will replace the current content of the file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => versionToRevert && handleRevert(versionToRevert)}
            >
              Revert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">File History</h3>
        <p className="text-sm text-muted-foreground mb-4">
          View and restore previous versions of this file.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedVersions.map((version) => (
            <TableRow key={version.id}>
              <TableCell className="font-medium">
                {version.version}
                {currentVersion === version.version && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </TableCell>
              <TableCell>
                {convertToLocalTime(version.created_at).timeAgo}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={version.users.avatar_url}
                      alt={version.users.email}
                    />
                    <AvatarFallback>
                      <UserCircle className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {version.users.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {currentVersion !== version.version && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openConfirmDialog(version.version)}
                    disabled={isReverting !== null}
                    className="space-x-1"
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    {isReverting === version.version
                      ? "Reverting..."
                      : "Revert"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FileHistoryPanel;

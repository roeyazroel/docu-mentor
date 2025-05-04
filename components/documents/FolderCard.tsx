"use client";

import { Document } from "@/app/(app)/documents/types";
import { formatDistanceToNow } from "date-fns";
import { Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import FolderActionMenu from "./FolderActionMenu";

interface FolderCardProps {
  folder: Document;
  onDelete: (id: string) => void;
  onRename?: (id: string) => void;
  onMove?: (id: string) => void;
}

export function FolderCard({
  folder,
  onDelete,
  onRename,
  onMove,
}: FolderCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/documents?folder=${folder.id}`);
  };

  const formattedDate = folder.updatedAt
    ? formatDistanceToNow(new Date(folder.updatedAt), { addSuffix: true })
    : "Unknown date";

  return (
    <div
      className="group bg-card border border-border rounded-lg p-5 transition-all hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Folder className="h-10 w-10 text-yellow-500" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate">{folder.name}</h3>
            <p className="text-xs text-muted-foreground">Folder</p>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <FolderActionMenu
            onDelete={() => onDelete(folder.id)}
            onRename={onRename ? () => onRename(folder.id) : undefined}
            onMove={onMove ? () => onMove(folder.id) : undefined}
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Updated {formattedDate}
      </div>
    </div>
  );
}

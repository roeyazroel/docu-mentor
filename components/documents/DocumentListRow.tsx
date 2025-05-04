"use client";

import { Document } from "@/app/(app)/documents/types";
import { formatDistanceToNow } from "date-fns";
import { File, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "../ui/table";
import DocumentActionMenu from "./DocumentActionMenu";
import FolderActionMenu from "./FolderActionMenu";

interface DocumentListRowProps {
  document: Document;
  onCopy?: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string) => void;
  onMove?: (id: string) => void;
}

export default function DocumentListRow({
  document,
  onCopy,
  onDelete,
  onRename,
  onMove,
}: DocumentListRowProps) {
  const router = useRouter();

  const handleClick = () => {
    if (document.type === "folder") {
      router.push(`/documents?folder=${document.id}`);
    } else {
      router.push(`/editor?document=${document.id}`);
    }
  };

  const formattedDate = document.updatedAt
    ? formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })
    : "Unknown date";

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleClick}
    >
      <TableCell>
        <div className="flex items-center space-x-3">
          {document.type === "folder" ? (
            <Folder className="h-5 w-5 text-yellow-500" />
          ) : (
            <File className="h-5 w-5 text-blue-500" />
          )}
          <span className="font-medium">{document.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {document.type === "folder" ? "Folder" : "Document"}
      </TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="text-right">
        <div onClick={(e) => e.stopPropagation()}>
          {document.type === "folder" ? (
            <FolderActionMenu
              onDelete={() => onDelete(document.id)}
              onRename={onRename ? () => onRename(document.id) : undefined}
              onMove={onMove ? () => onMove(document.id) : undefined}
            />
          ) : (
            <DocumentActionMenu
              onCopy={onCopy ? () => onCopy(document.id) : undefined}
              onDelete={() => onDelete(document.id)}
              onRename={onRename ? () => onRename(document.id) : undefined}
              onMove={onMove ? () => onMove(document.id) : undefined}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

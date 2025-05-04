import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, FileDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import React from "react";

interface DocumentActionMenuProps {
  onCopy?: () => void;
  onDelete: () => void;
  onRename?: () => void;
  onMove?: () => void;
}

const DocumentActionMenu: React.FC<DocumentActionMenuProps> = ({
  onCopy,
  onDelete,
  onRename,
  onMove,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onCopy && (
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Make a copy</span>
          </DropdownMenuItem>
        )}
        {onRename && (
          <DropdownMenuItem onClick={onRename}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </DropdownMenuItem>
        )}
        {onMove && (
          <DropdownMenuItem onClick={onMove}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>Move</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DocumentActionMenu;

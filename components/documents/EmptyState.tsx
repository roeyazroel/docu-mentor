"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, FilePlus, FolderPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface EmptyStateProps {
  onNewDocumentClick: (name?: string) => void;
  onNewFolderClick?: (name: string) => void;
}

export default function EmptyState({
  onNewDocumentClick,
  onNewFolderClick,
}: EmptyStateProps) {
  const searchParams = useSearchParams();
  const folderParam = searchParams.get("folder");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const isInFolder = !!folderParam;

  const handleCreateFolder = () => {
    if (folderName.trim() && onNewFolderClick) {
      onNewFolderClick(folderName);
      setFolderName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <File className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-xl font-medium mb-2">
        {isInFolder ? "This folder is empty" : "No documents yet"}
      </h3>

      <p className="text-muted-foreground max-w-md mb-8">
        {isInFolder
          ? "Create your first document or folder in this location."
          : "Create your first document to get started with your project."}
      </p>

      <div className="flex gap-4">
        <Button onClick={() => onNewDocumentClick()}>
          <FilePlus className="mr-2 h-4 w-4" />
          New Document
        </Button>

        {onNewFolderClick && (
          <>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new folder.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="empty-folder-name">Folder name</Label>
                  <Input
                    id="empty-folder-name"
                    placeholder="My Folder"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}

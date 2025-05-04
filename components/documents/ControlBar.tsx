"use client";

import type { ViewMode } from "@/app/(app)/documents/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderPlus, Plus } from "lucide-react";
import { useState } from "react";
import ViewToggle from "./ViewToggle";

interface ControlBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  currentView: ViewMode;
  onViewChange: (value: ViewMode) => void;
  onNewDocumentClick: (name?: string) => void;
  onNewFolderClick: (name: string) => void;
  parentId: string | null;
}

export default function ControlBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  currentView,
  onViewChange,
  onNewDocumentClick,
  onNewFolderClick,
  parentId,
}: ControlBarProps) {
  // Folder dialog state
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  // Document dialog state
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      onNewFolderClick(folderName);
      setFolderName("");
      setIsFolderDialogOpen(false);
    }
  };

  const handleCreateDocument = () => {
    if (documentName.trim()) {
      const name = documentName.trim();
      setDocumentName("");
      setIsDocDialogOpen(false);
      // Call the handler with the document name
      onNewDocumentClick(name);
    }
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 mb-8">
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:w-2/3">
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="md:w-1/2"
        />
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="file">Documents</SelectItem>
            <SelectItem value="folder">Folders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <ViewToggle current={currentView} onChange={onViewChange} />

        {/* New Folder Dialog */}
        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFolderDialogOpen(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Enter a name for your new folder.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="name">Folder name</Label>
              <Input
                id="name"
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
                onClick={() => setIsFolderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Document Dialog */}
        <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
          <Button onClick={() => setIsDocDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
              <DialogDescription>
                Enter a name for your new document.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="doc-name">Document name</Label>
              <Input
                id="doc-name"
                placeholder="My Document"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDocDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDocument}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

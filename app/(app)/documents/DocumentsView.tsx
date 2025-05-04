"use client";

import ControlBar from "@/components/documents/ControlBar";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentListRow from "@/components/documents/DocumentListRow";
import EmptyState from "@/components/documents/EmptyState";
import { FolderBreadcrumb } from "@/components/documents/FolderBreadcrumb";
import { FolderCard } from "@/components/documents/FolderCard";
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
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useEditorContext } from "@/context/EditorContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  createDocument,
  createFolder,
  deleteDocument,
  getDocuments,
  moveDocument,
  renameDocument,
} from "./actions";
import { Document, ViewMode } from "./types";

export default function DocumentsView({
  initialDocumentsData,
}: {
  initialDocumentsData: {
    currentFolder: {
      id: string;
      name: string;
      path: string;
      parentId: string | null;
    } | null;
    documents: Document[];
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const folderParam = searchParams.get("folder");

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [documents, setDocuments] = useState<Document[]>(
    initialDocumentsData.documents
  );
  const [currentPath, setCurrentPath] = useState(
    initialDocumentsData.currentFolder?.path || "/"
  );
  const [currentParentId, setCurrentParentId] = useState<string | null>(
    initialDocumentsData.currentFolder?.parentId || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { activeOrganization } = useEditorContext();

  // Dialog states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [allFolders, setAllFolders] = useState<Document[]>([]);

  // on loading the page, add the active organization to the search params
  useEffect(() => {
    if (activeOrganization) {
      // Preserve the folder parameter when adding organization parameter
      const folder = searchParams.get("folder");
      const url = folder
        ? `/documents?organization=${activeOrganization}&folder=${folder}`
        : `/documents?organization=${activeOrganization}`;

      router.push(url);
    }
  }, [activeOrganization, router, searchParams]);

  // Fetch documents based on current folder
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const parentId = folderParam || null;
      const result = await getDocuments(parentId, activeOrganization);

      setDocuments(result.documents);

      // Set path and parentId directly from the result
      if (result.currentFolder) {
        setCurrentPath(result.currentFolder.path);
        setCurrentParentId(result.currentFolder.parentId);
      } else {
        // If viewing root (parentId is null), set path to "/"
        setCurrentPath("/");
        setCurrentParentId(null);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [folderParam, toast, activeOrganization]);

  // Fetch all folders for move operation
  const fetchAllFolders = useCallback(async () => {
    try {
      // Fetch all documents from the root, ignoring the current folder info
      const result = await getDocuments(null, activeOrganization);
      const allDocs = result.documents; // Access the documents array
      const folders = allDocs.filter((doc) => doc.type === "folder");
      setAllFolders(folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, [activeOrganization]);

  // Effect to fetch documents when folder or organization changes
  useEffect(() => {
    // Don't fetch if organization isn't loaded yet, or if it's the initial load (handled by props)
    if (activeOrganization) {
      // We fetch here *after* the initial load, relying on folderParam changes
      console.log(
        "Effect: Fetching documents for folder:",
        folderParam,
        "Org:",
        activeOrganization
      );
      fetchDocuments();
    }
  }, [folderParam, activeOrganization, fetchDocuments]); // Dependencies: folderParam, activeOrganization, and the fetch function itself

  // Effect to fetch all folders needed for the 'Move' dialog
  useEffect(() => {
    // Fetch folders initially or when organization changes
    if (activeOrganization) {
      fetchAllFolders();
    }
  }, [activeOrganization, fetchAllFolders]); // Depend on org and the fetch function

  // Filter documents based on search query and category
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Separate folders and files for rendering
  const folders = filteredDocuments.filter((doc) => doc.type === "folder");
  const files = filteredDocuments.filter((doc) => doc.type === "file");

  // Handlers
  const handleNewDocumentClick = (name?: string) => {
    if (!name) {
      router.push(`/editor?folder=${folderParam || ""}`);
      return;
    }

    // Create document with name
    handleCreateDocument(name);
  };

  const handleCreateDocument = async (name: string) => {
    try {
      const newDoc = await createDocument(
        name,
        folderParam || null,
        activeOrganization
      );
      if (newDoc) {
        toast({
          title: "Success",
          description: `Document '${name}' created successfully.`,
        });
        fetchDocuments();
        // Optionally navigate to editor
        // router.push(`/editor?documentId=${newDoc.id}`);
      } else {
        throw new Error("Failed to create document");
      }
    } catch (error) {
      console.error("Error creating document:", error);
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewFolderClick = async (name: string) => {
    try {
      const newFolder = await createFolder(
        name,
        folderParam || null,
        activeOrganization
      );
      if (newFolder) {
        toast({
          title: "Success",
          description: `Folder '${name}' created successfully.`,
        });
        fetchDocuments();
      } else {
        throw new Error("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyDocument = (id: string) => {
    console.log(`Copying document with id: ${id}`);
    // TODO: Implement actual copy logic
    toast({
      title: "Not implemented",
      description: "Document copying is not yet implemented.",
    });
  };

  const handleDeleteDocument = async (id: string) => {
    setSelectedItemId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItemId) return;

    try {
      const success = await deleteDocument(selectedItemId, activeOrganization);
      if (success) {
        toast({
          title: "Success",
          description: "Item deleted successfully.",
        });
        fetchDocuments();
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedItemId(null);
    }
  };

  const handleRenameDocument = (id: string, currentName: string) => {
    setSelectedItemId(id);
    setNewName(currentName);
    setRenameDialogOpen(true);
  };

  const confirmRename = async () => {
    if (!selectedItemId || !newName.trim()) return;

    try {
      const updatedDoc = await renameDocument(
        selectedItemId,
        newName,
        activeOrganization
      );
      if (updatedDoc) {
        toast({
          title: "Success",
          description: `Item renamed to '${newName}' successfully.`,
        });
        fetchDocuments();
      } else {
        throw new Error("Failed to rename item");
      }
    } catch (error) {
      console.error("Error renaming item:", error);
      toast({
        title: "Error",
        description: "Failed to rename item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRenameDialogOpen(false);
      setSelectedItemId(null);
      setNewName("");
    }
  };

  const handleMoveDocument = (id: string) => {
    setSelectedItemId(id);
    fetchAllFolders();
    setMoveDialogOpen(true);
  };

  const confirmMove = async () => {
    if (!selectedItemId) return;

    try {
      const updatedDoc = await moveDocument(
        selectedItemId,
        targetFolderId,
        activeOrganization
      );
      if (updatedDoc) {
        toast({
          title: "Success",
          description: "Item moved successfully.",
        });
        fetchDocuments();
      } else {
        throw new Error("Failed to move item");
      }
    } catch (error) {
      console.error("Error moving item:", error);
      toast({
        title: "Error",
        description: "Failed to move item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMoveDialogOpen(false);
      setSelectedItemId(null);
      setTargetFolderId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Header Section */}
        <div className="pt-24 pb-6 mb-6 border-b border-border">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            My Documents
          </h1>

          {/* Breadcrumb navigation */}
          <FolderBreadcrumb
            currentPath={currentPath}
            parentId={currentParentId}
          />
        </div>

        {/* Control Bar */}
        <ControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          currentView={viewMode}
          onViewChange={setViewMode}
          onNewDocumentClick={handleNewDocumentClick}
          onNewFolderClick={handleNewFolderClick}
          parentId={folderParam}
        />

        {/* Document Display Area */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <p>Loading...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <EmptyState
              onNewDocumentClick={handleNewDocumentClick}
              onNewFolderClick={handleNewFolderClick}
            />
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Folders first */}
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onDelete={handleDeleteDocument}
                  onRename={(id) => handleRenameDocument(id, folder.name)}
                  onMove={handleMoveDocument}
                />
              ))}

              {/* Then files */}
              {files.map((file) => (
                <DocumentCard
                  key={file.id}
                  document={file}
                  onCopy={handleCopyDocument}
                  onDelete={handleDeleteDocument}
                  onRename={(id) => handleRenameDocument(id, file.name)}
                  onMove={handleMoveDocument}
                />
              ))}
            </div>
          ) : (
            // List View
            <Table className="bg-card rounded-lg shadow-sm border border-border">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Folders first */}
                {folders.map((folder) => (
                  <DocumentListRow
                    key={folder.id}
                    document={folder}
                    onDelete={handleDeleteDocument}
                    onRename={(id) => handleRenameDocument(id, folder.name)}
                    onMove={handleMoveDocument}
                  />
                ))}

                {/* Then files */}
                {files.map((file) => (
                  <DocumentListRow
                    key={file.id}
                    document={file}
                    onCopy={handleCopyDocument}
                    onDelete={handleDeleteDocument}
                    onRename={(id) => handleRenameDocument(id, file.name)}
                    onMove={handleMoveDocument}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Bottom padding */}
        <div className="pb-16"></div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Item</DialogTitle>
            <DialogDescription>
              Enter a new name for this item.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-input">New name</Label>
            <Input
              id="rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Item</DialogTitle>
            <DialogDescription>
              Select a destination folder for this item.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-select">Destination folder</Label>
            <Select
              value={targetFolderId || ""}
              onValueChange={setTargetFolderId}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Root</SelectItem>
                {allFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmMove}>Move</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";

/**
 * Props for ProjectSidebarDialogs component.
 */
export interface ProjectSidebarDialogsProps {
  newItemDialogOpen: boolean;
  setNewItemDialogOpen: (open: boolean) => void;
  newItemType: "file" | "folder";
  newItemName: string;
  setNewItemName: (name: string) => void;
  createNewItem: () => void;
  connectDialogOpen: boolean;
  setConnectDialogOpen: (open: boolean) => void;
  connectingProvider: string | null;
  completeConnection: () => void;
}

/**
 * Renders dialogs for creating a new file/folder and connecting to a provider.
 */
export function ProjectSidebarDialogs({
  newItemDialogOpen,
  setNewItemDialogOpen,
  newItemType,
  newItemName,
  setNewItemName,
  createNewItem,
  connectDialogOpen,
  setConnectDialogOpen,
  connectingProvider,
  completeConnection,
}: ProjectSidebarDialogsProps) {
  return (
    <>
      {/* Dialog for creating a new file or folder */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {newItemType === "file" ? "Create New File" : "Create New Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={newItemType === "file" ? "File name" : "Folder name"}
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createNewItem();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={createNewItem}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for connecting to a provider */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Connect to{" "}
              {connectingProvider === "google-drive"
                ? "Google Drive"
                : connectingProvider === "dropbox"
                ? "Dropbox"
                : "Box"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You'll be redirected to authenticate with your account. This is a
              demo, so no actual authentication will occur.
            </p>
            <Button className="w-full" onClick={completeConnection}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Authenticate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { ChevronRight, Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface FolderBreadcrumbProps {
  currentPath: string;
  parentId: string | null;
  pathIds?: Record<string, string>; // Map of paths to folder IDs
}

export function FolderBreadcrumb({
  currentPath,
  parentId,
  pathIds = {},
}: FolderBreadcrumbProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Generate breadcrumb segments from path
  const segments = currentPath
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => {
      // Calculate the path for this segment
      const path = array.slice(0, index + 1).join("/");
      const isLastSegment = index === array.length - 1;

      return {
        name: segment,
        isLast: isLastSegment,
        path,
      };
    });

  const handleNavigateHome = () => {
    router.push("/documents");
  };

  // When a breadcrumb is clicked
  const handleClickBreadcrumb = (index: number) => {
    // If clicking the last segment (current folder), do nothing
    if (index === segments.length - 1) return;

    // If we're clicking one level up from current, use parentId
    if (index === segments.length - 2 && parentId) {
      router.push(`/documents?folder=${parentId}`);
      return;
    }

    // For other segments, we don't have the folder IDs so go to home
    router.push("/documents");
  };

  return (
    <div className="flex items-center space-x-1 mb-4 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={handleNavigateHome}
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </Button>

      {segments.map((segment, i) => (
        <div key={i} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          {segment.isLast ? (
            <span className="font-medium">{segment.name}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 p-0 px-1 hover:underline"
              onClick={() => handleClickBreadcrumb(i)}
            >
              {segment.name}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

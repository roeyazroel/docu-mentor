import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ActionsMenu from './ActionsMenu'; // Import the menu
import type { Document } from '@/app/documents/page'; // Import the type

interface DocumentCardProps {
  document: Document;
  // Placeholder handlers - replace with real logic
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
}

// Updated categoryColors for neutral gray badges
const categoryColors: { [key: string]: string } = {
  Work: 'bg-gray-100 text-gray-800 border-gray-300',
  Design: 'bg-gray-100 text-gray-800 border-gray-300',
  Personal: 'bg-gray-100 text-gray-800 border-gray-300',
  Marketing: 'bg-gray-100 text-gray-800 border-gray-300',
  Default: 'bg-gray-100 text-gray-800 border-gray-300',
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onCopy, onDelete }) => {
  // No need for badgeClass lookup if all are the same, but keep for potential future variation
  const badgeClass = categoryColors[document.category] || categoryColors.Default;

  const handleCopy = () => {
    onCopy(document.id);
    // TODO: Add feedback (e.g., toast notification)
    console.log('Copying document:', document.id);
  };

  const handleDelete = () => {
    onDelete(document.id);
    // TODO: Add confirmation dialog + feedback
    console.log('Deleting document:', document.id);
  };

  return (
    <Card className="relative group overflow-hidden transition-all duration-300 hover:shadow-lg bg-white rounded-lg border border-gray-200 flex flex-col">
      {/* Gradient Top Bar */}
      <div
        className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#6E59A5] via-[#8B5CF6] to-[#F97316] opacity-75 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <CardHeader className="pt-6 pb-2 px-4">
        {/* TODO: Make title clickable to open document */}
        <CardTitle className="text-xl font-medium text-[#1A1F2C] truncate">
          {document.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow px-4 pb-4">
        <Badge variant="outline" className={`text-xs font-medium ${badgeClass}`}>
          {document.category}
        </Badge>
      </CardContent>

      <CardFooter className="px-4 pb-4 flex justify-between items-center text-sm text-[#4A4A68] border-t border-gray-100 pt-3">
        <span>{document.updatedAt}</span>
        <div className="-mr-2"> {/* Negative margin to align visually */}
          <ActionsMenu onCopy={handleCopy} onDelete={handleDelete} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard; 
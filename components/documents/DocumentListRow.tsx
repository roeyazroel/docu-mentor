import React from 'react';
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ActionsMenu from './ActionsMenu';
import type { Document } from '@/app/documents/page';

interface DocumentListRowProps {
  document: Document;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
}

// Updated category colors for neutral gray badges
const categoryColors: { [key: string]: string } = {
  Work: 'bg-gray-100 text-gray-800 border-gray-300',
  Design: 'bg-gray-100 text-gray-800 border-gray-300',
  Personal: 'bg-gray-100 text-gray-800 border-gray-300',
  Marketing: 'bg-gray-100 text-gray-800 border-gray-300',
  Default: 'bg-gray-100 text-gray-800 border-gray-300',
};

const DocumentListRow: React.FC<DocumentListRowProps> = ({ document, onCopy, onDelete }) => {
  const badgeClass = categoryColors[document.category] || categoryColors.Default;

  const handleCopy = () => {
    onCopy(document.id);
    console.log('Copying document (list):', document.id);
  };

  const handleDelete = () => {
    onDelete(document.id);
    console.log('Deleting document (list):', document.id);
  };

  return (
    <TableRow className="hover:bg-gray-50 transition-colors duration-150">
      <TableCell className="font-semibold text-[#1A1F2C]">
        {/* TODO: Make clickable */} {document.name}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-xs font-medium ${badgeClass}`}>
          {document.category}
        </Badge>
      </TableCell>
      <TableCell className="text-[#4A4A68]">{document.updatedAt}</TableCell>
      <TableCell className="text-right">
        <ActionsMenu onCopy={handleCopy} onDelete={handleDelete} />
      </TableCell>
    </TableRow>
  );
};

export default DocumentListRow; 
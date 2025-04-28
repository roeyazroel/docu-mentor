'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DocumentCard from '@/components/documents/DocumentCard';
import ControlBar from '@/components/documents/ControlBar';
import type { ViewMode } from '@/components/documents/ViewToggle';
import DocumentListRow from '@/components/documents/DocumentListRow';
import EmptyState from '@/components/documents/EmptyState';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data - replace with API call later
const mockDocuments = [
  { id: '1', name: 'Project Proposal Q3', category: 'Work', updatedAt: '2 hours ago' },
  { id: '2', name: 'Creative Brief - Website Redesign', category: 'Design', updatedAt: 'Yesterday' },
  { id: '3', name: 'Personal Journal Entry', category: 'Personal', updatedAt: '3 days ago' },
  { id: '4', name: 'Meeting Notes - 2024-07-15', category: 'Work', updatedAt: 'July 15, 2024' },
  { id: '5', name: 'Marketing Campaign Ideas', category: 'Marketing', updatedAt: 'July 10, 2024' },
  { id: '6', name: 'Recipe Book Draft', category: 'Personal', updatedAt: 'July 1, 2024' },
];

export type Document = typeof mockDocuments[0];

const MyDocumentsPage = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // TODO: Fetch real data based on filters/search
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewDocumentClick = () => {
    router.push('/editor');
  };

  // Placeholder Action Handlers
  const handleCopyDocument = (id: string) => {
    console.log(`Copying document with id: ${id}`);
    alert(`Copy document ${id} (Placeholder)`);
    // TODO: Implement actual copy logic + feedback
  };

  const handleDeleteDocument = (id: string) => {
    console.log(`Deleting document with id: ${id}`);
    alert(`Delete document ${id} (Placeholder)`);
    // TODO: Implement actual delete logic + confirmation + feedback
    // For mock, could filter the state: setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Header Section - pt-24 should clear h-20 navbar */}
        <div className="pt-24 pb-10 mb-10 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1F2C]">My Documents</h1>
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
        />

        {/* Document Display Area */}
        <div className="min-h-[400px]">
          {filteredDocuments.length === 0 ? (
            <EmptyState onNewDocumentClick={handleNewDocumentClick} />
          ) : (
            viewMode === 'grid' ? (
              // Responsive Grid
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onCopy={handleCopyDocument}
                    onDelete={handleDeleteDocument}
                  />
                ))}
              </div>
            ) : (
              // List View
              <Table className="bg-white rounded-lg shadow-sm border border-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <DocumentListRow
                      key={doc.id}
                      document={doc}
                      onCopy={handleCopyDocument}
                      onDelete={handleDeleteDocument}
                    />
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </div>

        {/* Padding at the bottom */}
        <div className="pb-16"></div>
      </div>
    </div>
  );
};

export default MyDocumentsPage; 
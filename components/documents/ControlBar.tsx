import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ViewToggle, { type ViewMode } from './ViewToggle';
import { FilePlus, Search } from 'lucide-react';

interface ControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string; // Or appropriate type
  onCategoryChange: (category: string) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewDocumentClick: () => void;
}

// Mock categories for the dropdown
const mockCategories = ['All', 'Work', 'Design', 'Personal', 'Marketing'];

const ControlBar: React.FC<ControlBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  currentView,
  onViewChange,
  onNewDocumentClick,
}) => {
  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Left Section: New Doc + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-grow">
        <Button onClick={onNewDocumentClick} className="bg-[#F97316] hover:bg-orange-500 text-white">
          <FilePlus className="mr-2 h-4 w-4" />
          New Document
        </Button>
        <div className="relative flex-grow sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search documents"
          />
        </div>
      </div>

      {/* Right Section: Filter + View Toggle */}
      <div className="flex items-center gap-4 justify-end">
        {/* Category Filter Dropdown - Placeholder styling/functionality */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {mockCategories.map(category => (
              <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ViewToggle currentView={currentView} onViewChange={onViewChange} />
      </div>
    </div>
  );
};

export default ControlBar; 
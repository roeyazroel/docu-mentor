import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 p-0.5 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('grid')}
        className={cn(
          'px-3 py-1 h-8 rounded-md',
          currentView === 'grid'
            ? 'bg-white text-[#6E59A5] shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
        )}
        aria-label="Grid View"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          'px-3 py-1 h-8 rounded-md',
          currentView === 'list'
            ? 'bg-white text-[#6E59A5] shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
        )}
        aria-label="List View"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewToggle; 
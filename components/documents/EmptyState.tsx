import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onNewDocumentClick: () => void;
  title?: string;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onNewDocumentClick,
  title = "No Documents Found",
  message = "It looks like you haven't created any documents yet, or none match your current search/filter."
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 rounded-full bg-[#E5DEFF] mb-4">
        <FileText className="h-10 w-10 text-[#6E59A5]" />
      </div>
      <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">{title}</h3>
      <p className="text-base text-[#4A4A68] max-w-md mb-6">{message}</p>
      <Button onClick={onNewDocumentClick} className="bg-gradient-to-r from-[#6E59A5] via-[#8B5CF6] to-[#F97316] hover:opacity-90 text-white">
        Create Your First Document
      </Button>
    </div>
  );
};

export default EmptyState; 
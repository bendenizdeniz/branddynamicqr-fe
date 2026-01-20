import React from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  onAddClick: () => void;
  addButtonText: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, onAddClick, addButtonText }) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {description && <p className="text-gray-500 text-sm">{description}</p>}
    </div>
    <button 
      onClick={onAddClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md transition-all"
    >
      <Plus size={20} /> {addButtonText}
    </button>
  </div>
);
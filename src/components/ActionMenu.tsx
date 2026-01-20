import { Eye, Edit2, Trash2, Power } from 'lucide-react';

const ActionMenu: React.FC<{
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isActive: boolean;
}> = ({ onView, onEdit, onDelete, onToggle, isActive }) => {
  return (
    <div className="absolute right-full top-0 mr-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-right-2 duration-200">
      <button onClick={onView} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        <Eye size={16} /> Görüntüle
      </button>
      <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        <Edit2 size={16} /> Düzenle
      </button>
      <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={16} /> Sil
      </button>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors border-t mt-1">
        <Power size={16} /> {isActive ? 'Pasifleştir' : 'Aktifleştir'}
      </button>
    </div>
  );
};
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Bağımsızlaştırma için
import { AxiosError } from 'axios';
import { 
  Save, 
  Loader2, 
  Search, 
  AlertCircle,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Layers
} from 'lucide-react';

import api from '../api/axios';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import type { Category, Brand } from '../types/DTO';

interface CategoryRequestModel {
  languageId: number;
  searchKeyword?: string | null;
  brandId?: number | null;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI & Menü State'leri
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isSaving, setIsSaving] = useState(false);

  // Filtre State'leri
  const [selectedLanguage, setSelectedLanguage] = useState<number>(1);
  const [selectedBrand, setSelectedBrand] = useState<number | string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [formData, setFormData] = useState({
    ext_id: '',
    type: '',
    names: { tr: '', en: '', de: '' }
  });

  // Markaları çek
  useEffect(() => {
    api.post('/brands').then(res => setBrands(res.data || [])).catch(console.error);
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    const requestModel: CategoryRequestModel = {
      languageId: selectedLanguage,
      searchKeyword: searchQuery.trim() !== "" ? searchQuery : null,
      brandId: selectedBrand !== '' ? Number(selectedBrand) : null,
    };

    try {
      const response = await api.post('/categories', requestModel);
      setCategories(response.data.data || []);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Kategoriler yüklenirken bir hata oluştu.');
    } finally { setLoading(false); }
  }, [selectedLanguage, searchQuery, selectedBrand]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Menü Konumlandırma
  const handleMenuToggle = (e: React.MouseEvent, catId: number) => {
    e.stopPropagation();
    if (activeMenuId === catId) {
      setActiveMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX - 160
      });
      setActiveMenuId(catId);
    }
  };

  useEffect(() => {
    const close = () => setActiveMenuId(null);
    window.addEventListener('scroll', close);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/post-category', formData);
      setIsModalOpen(false);
      setFormData({ ext_id: '', type: '', names: { tr: '', en: '', de: '' } });
      await fetchCategories();
    } catch (err) { alert(err); } 
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen" onClick={() => setActiveMenuId(null)}>
      <PageHeader 
        title="Kategori Yönetimi" 
        onAddClick={() => { setModalMode('create'); setIsModalOpen(true); }} 
        addButtonText="Yeni Kategori" 
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Filtreleme Paneli */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Kategori adı veya Kod ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
          <Filter size={16} className="text-gray-400" />
          <select 
            className="bg-transparent outline-none text-sm font-bold text-gray-700 min-w-[140px]"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">Tüm Markalar</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <select 
          className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl outline-none min-w-[130px] font-bold text-indigo-700 text-sm"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(Number(e.target.value))}
        >
          <option value={1}>Türkçe (TR)</option>
          <option value={2}>English (EN)</option>
          <option value={3}>Deutsch (DE)</option>
        </select>

        <button onClick={() => fetchCategories()} className="bg-gray-900 text-white px-8 py-2.5 rounded-xl hover:bg-black transition-all font-bold shadow-lg shadow-gray-200 active:scale-95">
          Filtrele
        </button>
      </div>

      <DataTable headers={['Kategori Bilgisi', 'Tür / Tip', 'External ID', 'İşlemler']} loading={loading}>
        {categories.map((cat) => (
          <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Layers size={18} />
                </div>
                <span className="font-bold text-gray-700">{cat.categoryName}</span>
              </div>
            </td> 
            <td className="px-6 py-4">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase border border-blue-100">
                {cat.type || "PRODUCT"}
              </span>
            </td>
            <td className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">{cat.ext_id}</td>
            <td className="px-6 py-4 text-right">
              <button 
                onClick={(e) => handleMenuToggle(e, cat.id)}
                className={`p-2 rounded-full transition-all ${activeMenuId === cat.id ? 'bg-gray-900 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <MoreVertical size={20}/>
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* PORTAL DROPDOWN */}
      {activeMenuId && createPortal(
        <div 
          className="fixed w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 py-2 z-[9999] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => { setModalMode('view'); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors text-left">
            <Eye size={16} className="text-indigo-500" /> Detayları Gör
          </button>
          <button onClick={() => { setModalMode('edit'); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium border-t border-gray-50 transition-colors text-left">
            <Edit2 size={16} className="text-blue-500" /> Düzenle
          </button>
          <button onClick={() => { if(confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-gray-50 transition-colors text-left">
            <Trash2 size={16} className="text-red-500" /> Kategoriyi Sil
          </button>
        </div>,
        document.body
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Yeni Kategori Ekle' : 'Kategori Bilgileri'}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori Kodu (ext_id)</label>
              <input required disabled={modalMode === 'view'} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm" value={formData.ext_id} onChange={e => setFormData({...formData, ext_id: e.target.value})} />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tür (Type)</label>
              <input placeholder="product" disabled={modalMode === 'view'} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block text-left">Çoklu Dil İsimlendirmesi</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 text-xs font-bold text-gray-400">TR</span>
                <input placeholder="Türkçe Adı" disabled={modalMode === 'view'} className="flex-1 border border-gray-200 bg-gray-50 rounded-xl p-2.5 outline-none" value={formData.names.tr} onChange={e => setFormData({...formData, names: {...formData.names, tr: e.target.value}})} />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 text-xs font-bold text-gray-400">EN</span>
                <input placeholder="English Name" disabled={modalMode === 'view'} className="flex-1 border border-gray-200 bg-gray-50 rounded-xl p-2.5 outline-none" value={formData.names.en} onChange={e => setFormData({...formData, names: {...formData.names, en: e.target.value}})} />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 text-xs font-bold text-gray-400">DE</span>
                <input placeholder="Deutsch Name" disabled={modalMode === 'view'} className="flex-1 border border-gray-200 bg-gray-50 rounded-xl p-2.5 outline-none" value={formData.names.de} onChange={e => setFormData({...formData, names: {...formData.names, de: e.target.value}})} />
              </div>
            </div>
          </div>

          {modalMode !== 'view' && (
            <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98]">
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Kategori Bilgilerini Kaydet
            </button>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
import React, { useEffect, useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { 
  Save, 
  Loader2, 
  Search, 
  AlertCircle,
  Filter 
} from 'lucide-react';

import api from '../api/axios';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import type { Category, Brand } from '../types/DTO';

interface CategoryRequestModel {
  languageId: number;
  searchKeyword?: string | null;
  brandId?: number | null; // Yeni eklenen alan
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]); // Marka listesi için
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedLanguage, setSelectedLanguage] = useState<number>(1);
  const [selectedBrand, setSelectedBrand] = useState<number | string>(''); // Marka filtresi state'i
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    ext_id: '',
    type: '',
    names: { tr: '', en: '', de: '' }
  });

  // Başlangıçta markaları çek
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await api.get('/brands');
        setBrands(response.data || []);
      } catch (err) {
        console.error("Markalar yüklenemedi:", err);
      }
    };
    fetchBrands();
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');

    const requestModel: CategoryRequestModel = {
      languageId: selectedLanguage,
      searchKeyword: searchQuery.trim() !== "" ? searchQuery : null,
      brandId: selectedBrand !== '' ? Number(selectedBrand) : null, // Servise iletilen brandId
    };

    try {
      const response = await api.post('/categories', requestModel);
      setCategories(response.data.data || []);
      
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [selectedLanguage, searchQuery, selectedBrand]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Backend'deki endpoint ismine uygun (postCategory metodu /post-category rotasına bağlıydı)
      await api.post('/post-category', formData);
      setIsModalOpen(false);
      setFormData({ ext_id: '', type: '', names: { tr: '', en: '', de: '' } });
      await fetchCategories();
    } catch (err: unknown) {
      console.error('Save error:', err);
      alert('Kategori kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <PageHeader title="Kategori Yönetimi" onAddClick={() => setIsModalOpen(true)} addButtonText="Yeni Kategori" />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Filtreleme Paneli */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Kategori adı veya Kod ara..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Marka Filtresi */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
          <Filter size={16} className="text-gray-400" />
          <select 
            className="bg-transparent outline-none text-sm font-semibold text-gray-700 min-w-[150px]"
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
          className="bg-blue-50 border border-blue-100 p-2 rounded-xl outline-none min-w-[120px] font-semibold text-blue-700"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(Number(e.target.value))}
        >
          <option value={1}>Türkçe (TR)</option>
          <option value={2}>English (EN)</option>
          <option value={3}>Deutsch (DE)</option>
        </select>

        <button onClick={() => fetchCategories()} className="bg-gray-800 text-white px-6 py-2 rounded-xl hover:bg-black transition-all font-semibold">
          Filtrele
        </button>
      </div>

      <DataTable headers={['Kategori', 'Tür', 'External ID']} loading={loading}>
  {categories.map((cat) => (
    <tr key={cat.id}>
      <td className="px-6 py-4 font-semibold">{cat.categoryName}</td> 
      <td className="px-6 py-4">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {cat.type || "Belirtilmemiş"} {/* Backend'den gelen yeni key */}
        </span>
      </td>
      <td className="px-6 py-4 font-mono text-xs">{cat.ext_id}</td>
    </tr>
  ))}
</DataTable>

      {/* Yeni Kategori Ekleme Modalı */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Kategori Ekle">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Form alanları aynı kalabilir... */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Kategori Kodu (ext_id)</label>
              <input 
                required 
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.ext_id} 
                onChange={e => setFormData({...formData, ext_id: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Tür (Type)</label>
              <input 
                placeholder="örn: product, category, description"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm font-bold text-gray-700 border-b pb-1 block">Dil İsimleri</label>
            <input placeholder="Türkçe Kategori Adı" className="w-full border border-gray-300 rounded-lg p-2.5" value={formData.names.tr} onChange={e => setFormData({...formData, names: {...formData.names, tr: e.target.value}})} />
            <input placeholder="English Category Name" className="w-full border border-gray-300 rounded-lg p-2.5" value={formData.names.en} onChange={e => setFormData({...formData, names: {...formData.names, en: e.target.value}})} />
            <input placeholder="Deutsch Kategoriename" className="w-full border border-gray-300 rounded-lg p-2.5" value={formData.names.de} onChange={e => setFormData({...formData, names: {...formData.names, de: e.target.value}})} />
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors hover:bg-blue-700">
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Kaydet
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
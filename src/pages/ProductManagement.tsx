import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Bağımsız dropdown için
import { AxiosError } from 'axios';
import { 
  Save, 
  Loader2, 
  Search, 
  AlertCircle,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Tag,
  Filter
} from 'lucide-react';

import api from '../api/axios';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import type { Product, Category, Brand } from '../types/DTO';
import type { ProductRequestModel } from '../types/RequestTypes';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Portal & UI State'leri
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isSaving, setIsSaving] = useState(false);

  // Filtre State'leri
  const [selectedLanguage, setSelectedLanguage] = useState<number>(1);
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [formData, setFormData] = useState({
    ext_id: '',
    names: { tr: '', en: '', de: '' },
    descriptions: { tr: '', en: '', de: '' },
    imageUrl: '',
    brandId: '',
    categoryId: '',
    price: ''
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    const requestModel: ProductRequestModel = {
      brandId: filterBrand ? Number(filterBrand) : null,
      categoryId: filterCategory ? Number(filterCategory) : null,
      searchKeyword: searchQuery.trim() !== "" ? searchQuery : null,
      languageId: selectedLanguage
    };

    try {
      const response = await api.post('/brand-based-products', requestModel);
      setProducts(response.data.data || []);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Ürünler yüklenirken bir hata oluştu.');
    } finally { setLoading(false); }
  }, [filterBrand, filterCategory, searchQuery, selectedLanguage]);

  useEffect(() => {
    const initialFetch = async () => {
      try {
        const [brandRes, catRes] = await Promise.all([
          api.post('/brands'),
          api.post('/categories', { languageId: selectedLanguage, searchKeyword: null })
        ]);
        setBrands(brandRes.data || []);
        setCategories(catRes.data.data || catRes.data || []); 
        await fetchProducts();
      } catch (err: unknown) { 
        const message = err instanceof Error ? err.message : 'Veriler yüklenemedi.';
        setError(message); 
      }
    };
    initialFetch();
  }, [fetchProducts, selectedLanguage]);

  // Dropdown Tetikleyici
  const handleMenuToggle = (e: React.MouseEvent, productId: number | string) => {
    e.stopPropagation();
    if (activeMenuId === productId) {
      setActiveMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX - 160
      });
      setActiveMenuId(productId);
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
      await api.post('/products/save', {
        ...formData,
        categoryId: Number(formData.categoryId),
        brandId: Number(formData.brandId),
        price: parseFloat(formData.price)
      });
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) { alert(err); } 
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen" onClick={() => setActiveMenuId(null)}>
      <PageHeader title="Ürün Yönetimi" onAddClick={() => { setModalMode('create'); setIsModalOpen(true); }} addButtonText="Yeni Ürün" />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Filtreleme Paneli */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Ürün adı veya Barkod ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl outline-none min-w-[120px] font-bold text-indigo-700 text-sm"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(Number(e.target.value))}
        >
          <option value={1}>TR</option>
          <option value={2}>EN</option>
          <option value={3}>DE</option>
        </select>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl">
          <Filter size={14} className="text-gray-400" />
          <select 
            className="bg-transparent outline-none text-sm font-semibold text-gray-700 min-w-[130px]"
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="">Tüm Markalar</option>
            {brands.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
          </select>
        </div>

        <select 
          className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none min-w-[150px] text-sm font-medium"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.categoryName || c.ext_id}</option>)}
        </select>

        <button onClick={() => fetchProducts()} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all font-bold shadow-lg shadow-gray-100">
          Filtrele
        </button>
      </div>

      <DataTable headers={['Ürün Bilgisi', 'Kategori', 'Fiyat', 'Barkod / ID', 'İşlemler']} loading={loading}>
        {products.map((p) => (
          <tr key={p.categoryProductId} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                  {/* {p.imageUrl ? <img src={p.} className="w-full h-full object-cover" alt=""/> : <Package size={20} />} */}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700 text-sm">{p.productName}</span>
                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">ID: {p.categoryProductId}</span>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Tag size={14} className="text-gray-300" />
                <span className="text-sm">{p.categoryName}</span>
              </div>
            </td>
            <td className="px-6 py-4">
               <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-bold text-sm">
                {p.price} ₺
               </span>
            </td>
            <td className="px-6 py-4 font-mono text-[11px] text-gray-400">{p.ext_id}</td>
            <td className="px-6 py-4 text-right">
              <button 
                onClick={(e) => handleMenuToggle(e, p.categoryProductId)}
                className={`p-2 rounded-full transition-all ${activeMenuId === p.categoryProductId ? 'bg-gray-900 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-400'}`}
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
            <Eye size={16} className="text-indigo-500" /> Ürün Detayı
          </button>
          <button onClick={() => { setModalMode('edit'); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium border-t border-gray-50 transition-colors text-left">
            <Edit2 size={16} className="text-blue-500" /> Düzenle
          </button>
          <button onClick={() => { if(confirm('Emin misiniz?')) setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-gray-50 transition-colors text-left">
            <Trash2 size={16} className="text-red-500" /> Ürünü Sil
          </button>
        </div>,
        document.body
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Yeni Ürün Ekle' : 'Ürün Düzenle'}>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marka Seçimi</label>
              <select required disabled={modalMode === 'view'} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                <option value="">Seçiniz...</option>
                {brands.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</label>
              <select required disabled={modalMode === 'view'} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                <option value="">Seçiniz...</option>
                {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.categoryName || c.ext_id}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Barkod / External ID</label>
              <input required disabled={modalMode === 'view'} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none font-mono text-sm" value={formData.ext_id} onChange={e => setFormData({...formData, ext_id: e.target.value})} />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fiyat (₺)</label>
              <input type="number" step="0.01" required disabled={modalMode === 'view'} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none font-bold text-green-600" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block text-left mb-3">Dil Bazlı İsimler</label>
             <div className="grid grid-cols-1 gap-3">
                <input placeholder="Türkçe Ürün Adı" className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3" value={formData.names.tr} onChange={e => setFormData({...formData, names: {...formData.names, tr: e.target.value}})} />
                <input placeholder="English Product Name" className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3" value={formData.names.en} onChange={e => setFormData({...formData, names: {...formData.names, en: e.target.value}})} />
             </div>
          </div>

          {modalMode !== 'view' && (
            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98]">
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Ürünü Sisteme Kaydet
            </button>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
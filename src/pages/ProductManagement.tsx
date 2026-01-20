import React, { useEffect, useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { 
  Save, 
  Loader2, 
  Search, 
  AlertCircle 
} from 'lucide-react';

// Klasör yapına uygun importlar
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

  const [selectedLanguage, setSelectedLanguage] = useState<number>(1);
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    ext_id: '',
    names: { tr: '', en: '', de: '' },
    descriptions: { tr: '', en: '', de: '' },
    imageUrl: '',
    brandId: '',
    categoryId: '',
    price: ''
  });

  // GET isteğini Body ile zorlayan fonksiyon
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
      // Axios'ta GET isteğine DATA eklemek için request nesnesi kullanılır.
      // Tarayıcının bu body'yi silmemesi için Content-Type zorunludur.
      const response = await api.request({
        method: 'POST',
        url: '/brand-based-products',
        data: requestModel, 
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setProducts(response.data.data || []);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Ürünler yüklenirken bir hata oluştu.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filterBrand, filterCategory, searchQuery, selectedLanguage]);

  useEffect(() => {
  const initialFetch = async () => {
    try {
      // Markalar hala standart GET olabilir ancak kategoriler artık POST/Body istiyor
      const [brandRes, catRes] = await Promise.all([
        api.get('/brands'),
        // Kategori listesini dile göre çekiyoruz
        api.post('/categories', { 
          languageId: selectedLanguage,
          searchKeyword: null 
        })
      ]);

      setBrands(brandRes.data || []);
      // catRes.data.data şeklinde geliyorsa (controller'daki res.json yapına göre)
      setCategories(catRes.data.data || catRes.data || []); 
      
      await fetchProducts();
    } catch (err: unknown) {
      console.error('Initial error:', err);
      setError('Sayfa verileri yüklenemedi.');
    }
  };

  initialFetch();
  // selectedLanguage değiştiğinde kategorilerin de yeniden çekilmesi gerekebilir 
  // ancak genellikle ilk yüklemede halledilir.
}, [fetchProducts, selectedLanguage]);

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
      setFormData({ ext_id: '', names: { tr: '', en: '', de: '' }, descriptions: { tr: '', en: '', de: '' }, imageUrl: '', brandId: '', categoryId: '', price: '' });
      await fetchProducts();
    } catch (err: unknown) {
      console.error('Save error:', err);
      alert('Ürün kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <PageHeader title="Ürün Yönetimi" onAddClick={() => setIsModalOpen(true)} addButtonText="Yeni Ürün" />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Ürün veya Barkod ara..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

        <select 
          className="bg-gray-50 border border-gray-200 p-2 rounded-xl outline-none min-w-[150px]"
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
        >
          <option value="">Tüm Markalar</option>
          {brands.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
        </select>

        <select 
          className="bg-gray-50 border border-gray-200 p-2 rounded-xl outline-none min-w-[150px]"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.ext_id}</option>)}
        </select>

        <button onClick={() => fetchProducts()} className="bg-gray-800 text-white px-6 py-2 rounded-xl hover:bg-black transition-all font-semibold">
          Filtrele
        </button>
      </div>

      <DataTable headers={['Ürün Adı', 'Kategori', 'Fiyat', 'Barkod']} loading={loading}>
        {products.map((p) => (
          <tr key={p.categoryProductId} className="hover:bg-blue-50/50 transition-colors border-b last:border-0 border-gray-50">
            <td className="px-6 py-4 font-semibold text-gray-700">{p.productName}</td>
            <td className="px-6 py-4 text-gray-600">{p.categoryName}</td>
            <td className="px-6 py-4 text-center font-bold text-gray-800">{p.price} ₺</td>
            <td className="px-6 py-4 italic text-gray-400 font-mono text-xs">{p.ext_id}</td>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Ürün Ekle">
        {/* Form içeriği aynen korunmuştur */}
        <form onSubmit={handleSave} className="space-y-5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Marka</label>
              <select required className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                <option value="">Marka Seçin</option>
                {brands.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Barkod</label>
              <input required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" value={formData.ext_id} onChange={e => setFormData({...formData, ext_id: e.target.value})} />
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2">
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Kaydet
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
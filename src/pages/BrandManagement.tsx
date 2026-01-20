import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Tablodan bağımsızlaştırmak için anahtar
import { Search, Plus, MoreVertical, Star, Eye, Edit2, Trash2, Power, Save } from 'lucide-react';
import api from '../api/axios';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import type { Brand } from '../types/DTO';

const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // UI & Menü State'leri
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post('/brands', { search });
      setBrands(res.data);
    } catch (err) {
      console.error("Markalar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Menü konumunu hesaplayan fonksiyon (Bağımsızlaştırma için kritik)
  const handleMenuToggle = (e: React.MouseEvent, brandId: number) => {
    e.stopPropagation();
    if (activeMenuId === brandId) {
      setActiveMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5, // Butonun hemen altı
        left: rect.left + window.scrollX - 160 // Menü genişliği kadar sola yasla
      });
      setActiveMenuId(brandId);
    }
  };

  // Sayfa kaydırıldığında veya tıklandığında menüyü kapat
  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('scroll', closeMenu);
    window.addEventListener('resize', closeMenu);
    return () => {
      window.removeEventListener('scroll', closeMenu);
      window.removeEventListener('resize', closeMenu);
    };
  }, []);

  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/brands/${id}`, { is_active: !currentStatus });
      fetchBrands();
      setActiveMenuId(null);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand) return;
    try {
      if (modalMode === 'create') {
        await api.post('/brands/create', selectedBrand);
      } else {
        await api.patch(`/brands/${selectedBrand.id}`, selectedBrand);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err) { alert(err); }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen" onClick={() => setActiveMenuId(null)}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Marka Yönetimi</h1>
        <button 
          onClick={() => { setSelectedBrand({} as Brand); setModalMode('create'); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={20} /> Yeni Marka Ekle
        </button>
      </div>

      {/* Arama Paneli */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Marka adına veya VKN'ye göre ara..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable headers={['Marka Bilgisi', 'Toplam Şube', 'Puan', 'Durum', 'Oluşturma Tarihi', 'İşlemler']} loading={loading}>
        {brands.map((brand) => (
          <tr key={brand.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase overflow-hidden border border-white shadow-sm">
                  {brand.icon ? <img src={brand.icon} alt="" className="w-full h-full object-cover" /> : brand.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm">{brand.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{brand.ext_id}</span>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
               <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-tight">
                {brand._count?.subvendors || 0} ŞUBE
               </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="text-gray-300 fill-gray-300" />)}
              </div>
            </td>
            <td className="px-6 py-4">
               <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${brand.isActive !== false ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${brand.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold">{brand.isActive !== false ? 'Aktif' : 'Pasif'}</span>
               </div>
            </td>
            <td className="px-6 py-4 text-gray-500 text-sm font-medium">
              {new Date(brand.created_at).toLocaleDateString('tr-TR')}
            </td>
            <td className="px-6 py-4 text-right">
                <button 
                  onClick={(e) => handleMenuToggle(e, brand.id)}
                  className={`p-2 rounded-full transition-all ${activeMenuId === brand.id ? 'bg-gray-900 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                  <MoreVertical size={20}/>
                </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* PORTAL DROPDOWN (Tablodan Tamamen Bağımsız) */}
      {activeMenuId && createPortal(
        <div 
          className="fixed w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 py-2 z-[9999] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => { const b = brands.find(x => x.id === activeMenuId); if(b){ setSelectedBrand(b); setModalMode('view'); setIsModalOpen(true); setActiveMenuId(null); }}} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">
            <Eye size={16} className="text-indigo-500" /> Görüntüle
          </button>
          <button onClick={() => { const b = brands.find(x => x.id === activeMenuId); if(b){ setSelectedBrand(b); setModalMode('edit'); setIsModalOpen(true); setActiveMenuId(null); }}} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium border-t border-gray-50 transition-colors">
            <Edit2 size={16} className="text-blue-500" /> Düzenle
          </button>
          <button onClick={() => { const b = brands.find(x => x.id === activeMenuId); if(b) handleStatusToggle(b.id, b.isActive !== false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 border-t border-gray-50 transition-colors">
            <Power size={16} /> Durumu Değiştir
          </button>
          <button onClick={() => { if(confirm('Emin misiniz?')) api.delete(`/brands/${activeMenuId}`).then(fetchBrands); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-gray-50 transition-colors">
            <Trash2 size={16} className="text-red-500" /> Sil
          </button>
        </div>,
        document.body
      )}

      {/* Modal - Şube yönetimindeki kaliteli grid yapısıyla */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Yeni Marka Ekle' : (modalMode === 'edit' ? 'Markayı Düzenle' : 'Marka Detayları')}
      >
        {selectedBrand && (
          <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marka Adı</label>
                <input required disabled={modalMode === 'view'} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70" value={selectedBrand.name || ''} onChange={(e) => setSelectedBrand({...selectedBrand, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marka Telefonu</label>
                <input disabled={modalMode === 'view'} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70" value={selectedBrand.phone || ''} onChange={(e) => setSelectedBrand({...selectedBrand, phone: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resmi Ticari Ünvan</label>
                <input disabled={modalMode === 'view'} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none disabled:opacity-70" value={selectedBrand.official_name || ''} placeholder="Holding A.Ş." onChange={(e) => setSelectedBrand({...selectedBrand, official_name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">VKN</label>
                <input disabled={modalMode === 'view'} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl font-mono disabled:opacity-70" value={selectedBrand.vkn || ''} onChange={(e) => setSelectedBrand({...selectedBrand, vkn: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Durum</label>
                <div className={`p-3 rounded-2xl border font-bold text-center text-sm ${selectedBrand.isActive !== false ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {selectedBrand.isActive !== false ? 'AKTİF' : 'PASİF'}
                </div>
              </div>

              {/* İstatistik Paneli */}
              <div className="col-span-2 grid grid-cols-3 gap-4 pt-2">
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Şube</p>
                  <p className="text-lg font-bold text-blue-800">{selectedBrand._count?.subvendors || 0}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-center">
                  <p className="text-[10px] text-purple-600 font-bold uppercase">Ürün</p>
                  <p className="text-lg font-bold text-purple-800">{selectedBrand._count?.category_products || 0}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 text-center">
                  <p className="text-[10px] text-orange-600 font-bold uppercase">Kimlik</p>
                  <p className="text-lg font-bold text-orange-800">{selectedBrand._count?.identities || 0}</p>
                </div>
              </div>
            </div>
            
            {modalMode !== 'view' && (
              <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-400 font-bold">Vazgeç</button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"><Save size={18}/> Kaydet</button>
              </div>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};

export default BrandManagement;
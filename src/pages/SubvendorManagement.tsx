import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Plus, MoreVertical, Star, Eye, Edit2, Trash2, Power, Save } from 'lucide-react';
import api from '../api/axios';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import type { Subvendor, Brand } from '../types/DTO';

const SubvendorManagement: React.FC = () => {
  const [subvendors, setSubvendors] = useState<Subvendor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre State'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // UI State'leri
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedSubvendor, setSelectedSubvendor] = useState<Subvendor | null>(null);

  const fetchSubvendors = useCallback(async () => {
    setLoading(true);
    try {
    const response = await api.get('/subvendors', {
  params: {
    search: searchQuery, // Backend'de req.query.search olarak karşılanmalı
    brandId: selectedBrand ? Number(selectedBrand) : undefined,
    status: selectedStatus === 'active' ? true : selectedStatus === 'passive' ? false : undefined
  }
});
      setSubvendors(response.data.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Hata oluştu";
      console.error("Şubeler yüklenemedi:", msg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedBrand, selectedStatus]);

  useEffect(() => {
    fetchSubvendors();
    api.post('/brands').then(res => setBrands(res.data));
  }, [fetchSubvendors]);

  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/subvendors/${id}/status`, { status: !currentStatus });
      fetchSubvendors();
      setActiveMenuId(null);
    } catch (err) {
      console.error(err);
    }
  };

const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedSubvendor) return;
  try {
    // Tüm objeyi gönderiyoruz, backend sadece değişenleri/gelenleri işleyecek
    await api.patch(`/subvendors/${selectedSubvendor.id}`, selectedSubvendor);
    setIsModalOpen(false);
    fetchSubvendors();
    alert("İşlem başarılı");
  } catch (err) {
    console.error(err);
    alert("Hata oluştu");
  }
};

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen" onClick={() => setActiveMenuId(null)}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Şube Yönetimi</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-sm transition-all">
          <Plus size={18} /> Şube Ekle
        </button>
      </div>

      {/* Filtreleme Paneli */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Şube Ara"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl outline-none text-gray-600 font-medium cursor-pointer"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Tümü (Durum)</option>
          <option value="active">Aktif</option>
          <option value="passive">Pasif</option>
        </select>
        <select 
          className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl outline-none text-gray-600 font-medium cursor-pointer"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">Tüm Markalar</option>
          {brands.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
        </select>
        <button onClick={fetchSubvendors} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-100 transition-all">
          <Filter size={18} /> Filtrele
        </button>
      </div>

      <DataTable headers={['Şube', 'Marka', 'Çalışan Sayısı', 'Puan', 'Durum', 'Oluşturulma Tarihi', '']} loading={loading}>
        {subvendors.map((sub) => (
          <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                  {sub.name.charAt(0)}
                </div>
                <span className="font-bold text-gray-700">{sub.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-gray-600 font-medium">{sub.brand?.name || '-'}</td>
            <td className="px-6 py-4 text-gray-600">{sub.employee_volume}</td>
            <td className="px-6 py-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="text-gray-300 fill-gray-300" />)}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit ${sub.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${sub.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs font-bold">{sub.is_active ? 'Aktif' : 'Pasif'}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-gray-500 text-sm">
              {new Date(sub.created_at).toLocaleDateString('tr-TR')}
            </td>
            <td className="px-6 py-4 text-right relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === sub.id ? null : sub.id); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <MoreVertical size={20} />
              </button>

              {activeMenuId === sub.id && (
                <div className="absolute right-12 top-4 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-2 animate-in fade-in slide-in-from-right-2">
                  <button onClick={() => { setSelectedSubvendor(sub); setModalMode('view'); setIsModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 font-medium">
                    <Eye size={16} /> Görüntüle
                  </button>
                  <button onClick={() => { setSelectedSubvendor(sub); setModalMode('edit'); setIsModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 font-medium">
                    <Edit2 size={16} /> Düzenle
                  </button>
                  <button onClick={() => handleStatusToggle(sub.id, sub.is_active)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium">
                    <Power size={16} /> {sub.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-50 mt-1">
                    <Trash2 size={16} /> Sil
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </DataTable>

     <Modal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
  title={modalMode === 'view' ? 'Şube Bilgileri' : 'Şubeyi Düzenle'}
>
  {selectedSubvendor && (
    <form onSubmit={handleUpdate} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {/* Şube Adı */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Şube Adı</label>
          <input 
            disabled={modalMode === 'view'}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
            value={selectedSubvendor.name || ''}
            onChange={(e) => setSelectedSubvendor({...selectedSubvendor, name: e.target.value})}
          />
        </div>

        {/* Telefon */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Telefon</label>
          <input 
            disabled={modalMode === 'view'}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
            value={selectedSubvendor.phone || ''}
            onChange={(e) => setSelectedSubvendor({...selectedSubvendor, phone: e.target.value})}
          />
        </div>

        {/* Resmi Ad (Official Name) */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Yönetici</label>
          <input 
            disabled={modalMode === 'view'}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
            value={selectedSubvendor.official_name || ''}
            onChange={(e) => setSelectedSubvendor({...selectedSubvendor, official_name: e.target.value})}
          />
        </div>

        {/* Marka (Backend: brand.name) */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Marka</label>
          <input 
            disabled={true} 
            className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl opacity-70 font-medium"
            value={selectedSubvendor.brand?.name || ''} 
          />
        </div>

        {/* Şehir */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Şehir</label>
          <input 
            disabled={modalMode === 'view'}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
            value={selectedSubvendor.city || ''}
            onChange={(e) => setSelectedSubvendor({...selectedSubvendor, city: e.target.value})}
          />
        </div>

        {/* Ülke */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Ülke</label>
          <input 
            disabled={modalMode === 'view'}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
            value={selectedSubvendor.country || ''}
            onChange={(e) => setSelectedSubvendor({...selectedSubvendor, country: e.target.value})}
          />
        </div>

        {/* VKN */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">VKN</label>
          <input 
            disabled={modalMode === 'view'}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
            value={selectedSubvendor.vkn || ''}
            onChange={(e) => setSelectedSubvendor({...selectedSubvendor, vkn: e.target.value})}
          />
        </div>

        {/* Çalışan Hacmi */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Çalışan Hacmi</label>
          <input 
            type="number"
            disabled={modalMode === 'view'}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
            value={selectedSubvendor.employee_volume ?? 0}
            onChange={(e) => setSelectedSubvendor({...selectedSubvendor, employee_volume: Number(e.target.value)})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">External ID</label>
          <input 
            disabled={true}
            className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl opacity-70"
            value={selectedSubvendor.ext_id || ''}
          />
        </div>

{/* Düzenleme modunda seçilebilir, Görüntüleme modunda kilitli */}
<div className="space-y-1">
  <label className="text-sm font-semibold text-gray-600">Sistem Dili</label>
  <select
    disabled={modalMode === 'view'}
    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
    value={selectedSubvendor.languageId}
    onChange={(e) => setSelectedSubvendor({...selectedSubvendor, languageId: Number(e.target.value)})}
  >
    {/* Dilleri listelediğin bir state olmalı */}
    <option value={1}>Türkçe</option>
    <option value={2}>English</option>
  </select>
</div>

        {/* Şube Tipi */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Şube Tipi</label>
          <input 
            disabled={true}
            className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl opacity-70"
            value={selectedSubvendor.is_franchise ? 'Franchise' : 'Öz Mal'}
          />
        </div>

        {/* Durum */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Durum</label>
          <div className={`p-2.5 rounded-xl border font-bold text-center ${selectedSubvendor.is_active ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {selectedSubvendor.is_active ? 'AKTİF' : 'PASİF'}
          </div>
        </div>
      </div>

      {/* Adres Detay (Full Width) */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-600">Adres Detayı</label>
        <textarea 
          disabled={modalMode === 'view'}
          rows={2}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 resize-none"
          value={selectedSubvendor.address_detail || ''}
          onChange={(e) => setSelectedSubvendor({...selectedSubvendor, address_detail: e.target.value})}
        />
      </div>
      
      {modalMode === 'edit' && (
        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">
            İptal
          </button>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-sm transition-all">
            <Save size={18} /> Değişiklikleri Kaydet
          </button>
        </div>
      )}
    </form>
  )}
</Modal>
    </div>
  );
};

export default SubvendorManagement;
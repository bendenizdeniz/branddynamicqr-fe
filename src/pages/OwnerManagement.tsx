import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Tablodan bağımsızlaştırmak için anahtar bu
import { Search, Plus, MoreVertical,  Eye, Edit2, Trash2, Power, Save } from 'lucide-react';
import api from '../api/axios';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import type { Owner } from '../types/DTO';

const OwnerManagement: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Menü State'leri
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Modal State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post('/owners', { search });
      setOwners(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchOwners(); }, [fetchOwners]);

  // Menü butonuna tıklandığında konum hesaplama
  const handleMenuClick = (e: React.MouseEvent, ownerId: number) => {
    e.stopPropagation();
    if (activeMenuId === ownerId) {
      setActiveMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      // Menüyü butonun sol altına, body üzerinde konumlandırıyoruz
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX - 160 // Menü genişliği kadar sola kaydır
      });
      setActiveMenuId(ownerId);
    }
  };

  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('scroll', closeMenu);
    window.addEventListener('resize', closeMenu);
    return () => {
      window.removeEventListener('scroll', closeMenu);
      window.removeEventListener('resize', closeMenu);
    };
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen" onClick={() => setActiveMenuId(null)}>
      {/* Header & Search Bölümleri Aynen Kalıyor... */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Şirket (Owner) Yönetimi</h1>
        <button onClick={() => { setSelectedOwner({ name: '', vkn: '', official_name: '', address: '', ext_id: `OWN_${Date.now()}`, is_deleted: false } as Owner); setModalMode('create'); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95">
          <Plus size={20} /> Şirket Ekle
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Arama yapın..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tablo */}
      <DataTable headers={['Şirket Bilgisi', 'VKN', 'Marka / Kimlik', 'Durum', 'Kayıt Tarihi', 'İşlemler']} loading={loading}>
        {owners.map((owner) => (
          <tr key={owner.id} className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg ${owner.is_deleted ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  {owner.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-gray-700 text-sm">{owner.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase">{owner.ext_id}</span>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 font-mono text-sm">{owner.vkn}</td>
            <td className="px-6 py-4 text-left">
               <div className="flex gap-2 font-bold text-[10px]">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100">{owner._count?.brands || 0} MARKA</span>
                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg border border-purple-100">{owner._count?.identities || 0} KİMLİK</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${!owner.is_deleted ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${!owner.is_deleted ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs font-bold">{!owner.is_deleted ? 'Aktif' : 'Pasif'}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(owner.created_at).toLocaleDateString('tr-TR')}</td>
            <td className="px-6 py-4 text-right">
              <button 
                onClick={(e) => handleMenuClick(e, owner.id)} 
                className={`p-2 rounded-full transition-all ${activeMenuId === owner.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <MoreVertical size={20}/>
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* PORTAL: Menüyü tablodan bağımsızlaştırıyoruz */}
      {activeMenuId && createPortal(
        <div 
          className="fixed w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 py-2 z-[9999] animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            top: menuPosition.top, 
            left: menuPosition.left 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dropdown içeriği aynı kalıyor, sadece yeri bağımsızlaştı */}
          <button onClick={() => { const owner = owners.find(o => o.id === activeMenuId); if(owner){ setSelectedOwner(owner); setModalMode('view'); setIsModalOpen(true); setActiveMenuId(null); } }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium text-left">
            <Eye size={16} className="text-indigo-500"/> Görüntüle
          </button>
          <button onClick={() => { const owner = owners.find(o => o.id === activeMenuId); if(owner){ setSelectedOwner(owner); setModalMode('edit'); setIsModalOpen(true); setActiveMenuId(null); } }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium text-left border-t border-gray-50">
            <Edit2 size={16} className="text-blue-500"/> Güncelle
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 text-left border-t border-gray-50">
            <Power size={16}/> Durumu Değiştir
          </button>
          <button onClick={() => { if(confirm('Silinsin mi?')) api.delete(`/owners/${activeMenuId}`).then(fetchOwners); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold text-left border-t border-gray-50">
            <Trash2 size={16}/> Sil
          </button>
        </div>,
        document.body
      )}

      {/* Modal - Şirket Detayları (Official Name ve Address alanları eklendi) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Yeni Şirket' : 'Şirket Bilgileri'}>
        {selectedOwner && (
          <form onSubmit={e => { e.preventDefault(); api.post(modalMode === 'create' ? '/owners/create' : `/owners/${selectedOwner.id}`, selectedOwner).then(() => { setIsModalOpen(false); fetchOwners(); }); }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-sm font-semibold text-gray-600">Şirket Adı</label>
                <input required disabled={modalMode === 'view'} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={selectedOwner.name || ''} onChange={e => setSelectedOwner({...selectedOwner, name: e.target.value})} />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-sm font-semibold text-gray-600">VKN</label>
                <input required disabled={modalMode === 'view'} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono" value={selectedOwner.vkn || ''} onChange={e => setSelectedOwner({...selectedOwner, vkn: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1 text-left">
                <label className="text-sm font-semibold text-gray-600">Resmi Ünvan (Official Name)</label>
                <input disabled={modalMode === 'view'} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={selectedOwner.official_name || ''} placeholder="Ticari sicil ünvanı..." onChange={e => setSelectedOwner({...selectedOwner, official_name: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1 text-left">
                <label className="text-sm font-semibold text-gray-600">Adres Bilgisi</label>
                <textarea disabled={modalMode === 'view'} rows={3} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" value={selectedOwner.address || ''} placeholder="Resmi adres..." onChange={e => setSelectedOwner({...selectedOwner, address: e.target.value})} />
              </div>
            </div>
            {modalMode !== 'view' && (
              <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 font-bold">İptal</button>
                <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Save size={18}/> Kaydet</button>
              </div>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};

export default OwnerManagement;
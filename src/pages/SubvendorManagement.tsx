import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Plus, MoreVertical, Star } from 'lucide-react';
import api from '../api/axios';
import { DataTable } from '../components/DataTable';
import type { Subvendor, Brand } from '../types/DTO';

const SubvendorManagement: React.FC = () => {
  const [subvendors, setSubvendors] = useState<Subvendor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre State'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const fetchSubvendors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.post('/subvendors', {
        searchKeyword: searchQuery,
        brandId: selectedBrand ? Number(selectedBrand) : null,
        status: selectedStatus === 'active' ? true : selectedStatus === 'passive' ? false : null
      });
      setSubvendors(response.data.data || []);
    } catch (err) {
      console.error("Şubeler yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedBrand, selectedStatus]);

  useEffect(() => {
    fetchSubvendors();
    // Markaları çek (Filtre için)
    api.post('/brands').then(res => setBrands(res.data));
  }, [fetchSubvendors]);

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Şube Yönetimi</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-sm">
          <Plus size={18} /> Şube Ekle
        </button>
      </div>

      {/* Görseldeki Filtreleme Paneli */}
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
          className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl outline-none text-gray-600 font-medium"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Tümü</option>
          <option value="active">Aktif</option>
          <option value="passive">Pasif</option>
        </select>

        <select 
          className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl outline-none text-gray-600 font-medium"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">Tüm Markalar</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <button onClick={fetchSubvendors} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-100 transition-all">
          <Filter size={18} /> Filtrele
        </button>
      </div>

      {/* Veri Tablosu */}
      <DataTable 
        headers={['Şube', 'Marka', 'Toplam Çalışan', 'Puan', 'Durum', 'Oluşturma Tarihi', '']} 
        loading={loading}
      >
        {subvendors.map((sub) => (
          <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold uppercase">
                  {sub.name.charAt(0)}
                </div>
                <span className="font-bold text-gray-700">{sub.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-gray-600">{sub.brandName}</td>
            <td className="px-6 py-4 text-gray-600">{sub.employeeCount || 0}</td>
            <td className="px-6 py-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className="text-gray-300 fill-gray-300" />
                ))}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-full w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-bold">Aktif</span>
              </div>
            </td>
            <td className="px-6 py-4 text-gray-500 text-sm">
              {new Date(sub.createdAt).toLocaleDateString('tr-TR')}
            </td>
            <td className="px-6 py-4 text-right">
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
};

export default SubvendorManagement;
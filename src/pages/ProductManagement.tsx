import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, Layers, Tag, Loader2, AlertCircle } from 'lucide-react';

interface Product {
  categoryProductId: number;
  productName: string;
  categoryName: string;
  price: number;
  ext_id: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/my-brand-data?lang=tr');
        // Backend'den gelen veri yapısına göre response.data.data kullanıyoruz
        setProducts(response.data.data || []);
      } catch (err) {
        setError('Ürünler yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-500 font-medium">Veriler çekiliyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ürün Yönetimi</h1>
          <p className="text-gray-500 text-sm">EspressoLab markasına ait güncel ürün listesi</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <Tag size={16} />
          {products.length} Ürün Listelendi
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Ürün Bilgisi</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4 text-center">Fiyat</th>
              <th className="px-6 py-4">Barkod / ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.categoryProductId} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Package size={18} />
                    </div>
                    <span className="font-semibold text-gray-700">{product.productName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Layers size={14} className="text-gray-400" />
                    {product.categoryName}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                    {product.price} ₺
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-400 italic">
                  {product.ext_id || 'ID Yok'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
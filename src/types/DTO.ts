export interface Product {
  categoryProductId: number;
  productName: string; // StringValue'dan gelen dile özgü isim
  categoryName: string; // StringValue'dan gelen dile özgü isim
  price: number;
  ext_id: string; // Product tablosundaki barkod/kod
}

export interface Category {
  id: number;
  ext_id: string;        // Veritabanındaki benzersiz kod (atistirmalik, sicak-icecekler vb.)
  categoryName: string;  // StringValue tablosundan çekilen (Örn: "Atıştırmalıklar", "Snacks")
  type: string | null;   // Category tablosundaki iş mantığı (Örn: "food", "drink")
}

export interface Brand {
  id: number;
  name: string;
  ext_id: string;
}

// types/DTO.ts dosyasına ekle
export interface Subvendor {
  id: number;
  ext_id: string;
  name: string;
  brandName: string;   // Brand tablosundan join ile gelecek
  brandId: number;
  employeeCount: number; // employee_volume alanı
  status: boolean;       // is_active alanı
  createdAt: string;
  rating?: number;       // Opsiyonel puan alanı
}
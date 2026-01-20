export interface Owner {
  id: number;
  ext_id: string;
  name: string;
  official_name?: string | null;
  vkn: string;
  address?: string | null;
  
  // İlişkili veriler (Prisma'dan include edildiğinde gelir)
  brands?: Brand[];
  identities?: string[]; // İhtiyaca göre Identity interface'i ile değiştirilebilir

  created_at: string;
  updated_at: string;
  is_deleted: boolean;

  // Prisma relation count verileri
  _count?: {
    brands: number;
    identities: number;
  };
}

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

export interface Subvendor {
  id: number;
  ext_id: string; // Prisma: ext_id
  name: string;
  official_name: string | null; // Prisma: official_name
  vkn: string | null; // Prisma: vkn
  
  // İlişkiler
  brandId: number;
  brand?: {
    name: string;
  };
  languageId: number;
  defaultLanguage?: {
    name: string;
    code: string;
  };
  
  // İletişim & Lokasyon
  phone: string | null;
  country: string | null; // Prisma default: "Türkiye"
  city: string | null;
  district: string | null;
  address_detail: string | null; // Prisma: @db.Text
  latitude: number | null;
  longitude: number | null;
  
  // Operasyonel Veriler
  payment_methods: string; // Prisma: Json? (Burayı istersen özel bir type yapabilirsin)
  employee_volume: number; // Prisma: employee_volume (employeeCount yerine entity ismiyle tutmak daha güvenli)
  
  // Durumlar
  is_active: boolean; // Prisma: is_active (UI'da isActive kullanıyorsan buna dikkat!)
  is_franchise: boolean; // Prisma: is_franchise
  is_deleted: boolean;
  
  // Zaman Damgaları
  created_at: string; // Prisma: created_at (Date -> string conversion)
  updated_at: string;
  
  // UI Helpers
  rating?: number; // Sadece frontend tarafında yıldızlar için kullanılıyor
}

// Yeni şube eklerken veya güncellerken kullanılacak tip
export interface SubvendorInput {
  name: string;
  brandId: number;
  phone?: string;
  city?: string;
  district?: string;
  isActive: boolean;
  ext_id?: string;
  official_name?: string;
}
export interface Brand {
  id: number;
  ext_id: string;
  name: string;
  official_name?: string | null; // Prisma'dan null gelebilir
  vkn: string;
  phone?: string | null;
  address?: string | null;
  icon?: string | null;
  coordX?: string | null;
  coordY?: string | null;
  thumbnail?: string | null;
  ownerId: number;
  owner?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  isActive?: boolean; // Eğer backendden dönüyorsa
  _count?: {
    subvendors: number;
    category_products: number;
    identities: number;
  };
}
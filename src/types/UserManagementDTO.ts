import type { Identity } from "./DTO";

export interface BaseEntity { 
  id: number; 
  name: string; 
  ownerId?: number; // Markalar için
  brandId?: number; // Şubeler için
}

export interface Permission {
  type: 'OWNER' | 'BRAND' | 'SUBVENDOR';
  id: number;
  name: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  role: Identity['role'];
}
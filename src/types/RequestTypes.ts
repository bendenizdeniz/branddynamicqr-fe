export interface ProductRequestModel {
  brandId: number | null;
  categoryId: number | null;
  searchKeyword: string | null;
  languageId: number;
}

export interface SubvendorRequestModel {
  brandId?: number | null;
  searchKeyword?: string | null;
  status?: boolean | null;
}


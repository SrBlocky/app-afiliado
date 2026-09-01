export type ProductCategory =
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'outerwear'
  | 'accessory'
  | 'bag'
  | 'jewelry';

export type StoreName =
  | 'Shein'
  | 'MOTF (Shein)'
  | 'DAZY (Shein)'
  | 'GLOWMODE (Shein)'
  | 'SHEIN Privé'
  | 'SHEIN MOD'
  | 'SHEIN ICON'
  | 'SHEIN EZwear'
  | 'ROMWE'
  | 'SHEIN Man'
  | 'Otro';

export interface ClothingItem {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  store: StoreName;
  price: number; // in MXN (Pesos Mexicanos)
  originalPrice?: number; // in MXN
  currency: string;
  color: string;
  imageUrl: string;
  buyUrl: string;
  affiliateParam?: string;
  rating?: number;
  reviewsCount?: number;
  inStock?: boolean;
  promoCode?: string;
  commissionRatePct: number; // e.g. 10% - 15%
}

export interface OutfitSet {
  id: string;
  title: string;
  description: string;
  occasion: string; // e.g. 'Casual', 'Oficina / Trabajo', 'Cena Elegante', 'Boda / Evento', 'Streetwear', 'Viajes / Vacaciones', 'Gimnasio / Deportivo'
  aesthetic: string; // e.g. 'Old Money', 'Minimalista', 'Casual Chic', 'Boho / Festival', 'Y2K', 'Clásico', 'Streetwear'
  season: 'Primavera' | 'Verano' | 'Otoño' | 'Invierno' | 'Todo el Año';
  gender: 'Mujer' | 'Hombre' | 'Unisex';
  items: ClothingItem[];
  totalPrice: number;
  colorPalette: {
    hex: string;
    name: string;
  }[];
  stylingTips: string[];
  tags: string[];
  coverImage?: string;
  likesCount?: number;
  createdAt: string;
  isAIGenerated?: boolean;
  matchScore?: number;
}

export interface AffiliateConfig {
  sheinId: string;
  sheinPromoCode: string;
  sheinReferralLink: string;
  customUtmSource: string;
  customUtmCampaign: string;
  defaultCommissionRate: number;
  payoutCurrency: string;
}

export interface AffiliateClickLog {
  id: string;
  timestamp: string;
  outfitId: string;
  outfitTitle: string;
  itemId: string;
  itemName: string;
  store: StoreName;
  price: number;
  estimatedCommission: number;
  finalAffiliateUrl: string;
}

export interface FilterOptions {
  searchQuery: string;
  gender: string;
  occasion: string;
  aesthetic: string;
  season: string;
  maxPrice: number;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'commission' | 'newest';
}

import { AdminCategory } from '../components/CategoryManagementModal';

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  baseUnit: string;
  conversionSummary: string;
  retailerPrice: number;
  subWholesalerPrice: number;
  availableStock: number;
  reservedStock: number;
  isActive: boolean;
  imageUrl?: string;
  badgeText?: string;
  shelfLifeMonths?: number;
  expiryDate?: string;
  batchNumber?: string;
}

export const INITIAL_CATEGORIES: AdminCategory[] = [
  { id: 'cat-choc', name: 'Chocolates & Bars', icon: '🍫', isActive: true, displayOrder: 1 },
  { id: 'cat-wfr', name: 'Biscuits & Wafers', icon: '🧇', isActive: true, displayOrder: 2 },
  { id: 'cat-cnd', name: 'Candies & Gummies', icon: '🍭', isActive: true, displayOrder: 3 },
  { id: 'cat-tof', name: 'Toffees & Hard Candies', icon: '🍯', isActive: true, displayOrder: 4 },
  { id: 'cat-bev', name: 'Dairy & Beverages', icon: '🥛', isActive: true, displayOrder: 5 },
  { id: 'cat-mint', name: 'Gums & Mints', icon: '🌿', isActive: true, displayOrder: 6 },
];

export const INITIAL_PRODUCTS_DATA: ProductItem[] = [
  {
    id: 'p-01',
    sku: 'CND-CHOC-01',
    name: 'Choco Dream Truffle Bites (24x50g)',
    category: 'Chocolates & Bars',
    brand: 'Candi Delights',
    baseUnit: 'carton',
    conversionSummary: '1 Carton = 24 Display Boxes = 288 Pcs',
    retailerPrice: 3100,
    subWholesalerPrice: 2900,
    availableStock: 425,
    reservedStock: 25,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    badgeText: 'BESTSELLER',
  },
  {
    id: 'p-02',
    sku: 'CND-CHOC-02',
    name: 'Velvet Caramel Bar Bulk Pack (48 pcs)',
    category: 'Chocolates & Bars',
    brand: 'Candi Delights',
    baseUnit: 'box',
    conversionSummary: '1 Carton = 8 Boxes = 384 Bars',
    retailerPrice: 1600,
    subWholesalerPrice: 1500,
    availableStock: 750,
    reservedStock: 50,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    badgeText: 'HIGH MARGIN',
  },
  {
    id: 'p-03',
    sku: 'CND-WAF-01',
    name: 'Crispy Hazelnut Wafers (36 packets)',
    category: 'Biscuits & Wafers',
    brand: 'Golden Crunch',
    baseUnit: 'carton',
    conversionSummary: '1 Carton = 6 Inner Boxes = 36 Packets',
    retailerPrice: 2200,
    subWholesalerPrice: 2050,
    availableStock: 590,
    reservedStock: 30,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
    badgeText: 'FAST MOVER',
  },
  {
    id: 'p-04',
    sku: 'CND-GUM-01',
    name: 'Fruity Blast Chewy Candies (100 packets)',
    category: 'Candies & Gummies',
    brand: 'Jolly Pops',
    baseUnit: 'carton',
    conversionSummary: '1 Carton = 10 Master Pouches = 100 Packets',
    retailerPrice: 1400,
    subWholesalerPrice: 1280,
    availableStock: 1100,
    reservedStock: 100,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=600&q=80',
    badgeText: 'POPULAR',
  },
  {
    id: 'p-05',
    sku: 'CND-JELL-01',
    name: 'Sour Berry Gummy Bears Dispenser (12 tubs)',
    category: 'Candies & Gummies',
    brand: 'Jolly Pops',
    baseUnit: 'carton',
    conversionSummary: '1 Carton = 12 Counter Tubs = 1200 Gummies',
    retailerPrice: 3850,
    subWholesalerPrice: 3550,
    availableStock: 24, // low stock for demonstration
    reservedStock: 15,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=600&q=80',
    badgeText: 'HOT DEMAND',
  },
  {
    id: 'p-06',
    sku: 'CND-FMCG-01',
    name: 'Dairy Rich Powdered Milk Sachets (50x25g)',
    category: 'Dairy & Beverages',
    brand: 'Pure Dairy',
    baseUnit: 'box',
    conversionSummary: '1 Master Carton = 12 Boxes = 600 Sachets',
    retailerPrice: 1120,
    subWholesalerPrice: 1040,
    availableStock: 910,
    reservedStock: 40,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  },
];

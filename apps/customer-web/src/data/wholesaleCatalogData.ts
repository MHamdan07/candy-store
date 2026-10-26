import { PackagingUnitType } from '@candi/types';

export interface WholesaleProductItem {
  id: string;
  sku: string;
  name: string;
  imageUrl?: string;
  brand: string;
  category: string;
  subCategory: string;
  description: string;
  baseUnit: PackagingUnitType; // 'carton' | 'box' | 'packet'
  availableUnits: PackagingUnitType[];
  conversionSummary: string; // e.g. "1 Carton = 10 Boxes = 120 Pieces"
  piecesPerUnit: number;
  weightKg: number;
  standardWholesalePrice: number; // PKR
  recommendedRetailPrice: number; // PKR (total RRP of all pieces)
  retailPricePerPiece: number; // PKR
  wholesaleCostPerPiece: number; // PKR
  marginPercentage: number; // % profit margin for Kiryana/retailer
  tierPrices: {
    standard_retail: number;
    tier_3_silver: number;
    tier_2_gold: number;
    tier_1_platinum: number;
  };
  minOrderQuantity: number;
  unitsInStock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isFeatured?: boolean;
  isHighMargin?: boolean;
  isBulkOfferEligible?: boolean;
  bulkOfferText?: string;
  badgeText?: string;
  accentColor: string;
  flavorNotes: string[];
  shelfLifeMonths: number;
  batchNumber: string;
  expiryDate: string;
  storageCondition: string;
}

export interface WholesaleOrderRecord {
  id: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  deliverySlot: string;
  deliveryAddress: {
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    area: string;
    city: string;
  };
  items: {
    productId: string;
    sku: string;
    name: string;
    unit: PackagingUnitType;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    piecesCount: number;
  }[];
  totalCartons: number;
  subtotal: number;
  bulkDiscount: number;
  taxAmount: number; // 0.5% advance WHT for tax filer
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: 'cash_on_delivery' | 'credit_khata' | 'bank_transfer_ibft';
  paymentStatus: 'pending' | 'paid' | 'on_credit';
  orderStatus: 'confirmed' | 'picking' | 'dispatched' | 'delivered';
  driverName?: string;
  driverPhone?: string;
  deliveryVanPlate?: string;
  riderNote?: string;
}

export interface WholesaleCategoryItem {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export const WHOLESALE_CATEGORIES: WholesaleCategoryItem[] = [
  { id: 'all', name: 'All Products', icon: '📌', count: 12 },
  { id: 'Chocolates', name: 'Chocolates & Truffles', icon: '🍫', count: 3 },
  { id: 'Candies & Chews', name: 'Candies & Chews', icon: '🍭', count: 2 },
  { id: 'Biscuits & Wafers', name: 'Wafers & Biscuits', icon: '🧇', count: 2 },
  { id: 'Gummies & Chews', name: 'Gummies & Marshmallows', icon: '🐻', count: 2 },
  { id: 'Hard Candies & Toffees', name: 'Toffees & Hard Candies', icon: '🍯', count: 2 },
  { id: 'Gums & Mints', name: 'Gums & Mints', icon: '🌿', count: 1 },
];

/**
 * Normalizes and matches product category against selected category ID/name/slug
 */
export function matchProductCategory(productCategory: string, targetCategory: string): boolean {
  if (!targetCategory || targetCategory.toLowerCase() === 'all') return true;
  if (!productCategory) return false;

  const normProd = productCategory.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normTarget = targetCategory.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (normProd === normTarget) return true;

  // Cross-reference with category definitions
  const catDef = WHOLESALE_CATEGORIES.find(
    (c) =>
      c.id.toLowerCase() === targetCategory.toLowerCase() ||
      c.name.toLowerCase() === targetCategory.toLowerCase()
  );
  if (catDef) {
    const normId = catDef.id.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const normName = catDef.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (normProd === normId || normProd === normName) return true;
  }

  return false;
}

/**
 * Dynamically computes product counts for all categories from any active products list
 */
export function getCategoryCounts(products: WholesaleProductItem[]): Record<string, number> {
  const counts: Record<string, number> = { all: products.length };

  WHOLESALE_CATEGORIES.forEach((cat) => {
    if (cat.id === 'all') {
      counts.all = products.length;
    } else {
      counts[cat.id] = products.filter((p) => matchProductCategory(p.category, cat.id)).length;
    }
  });

  return counts;
}

export const WHOLESALE_PRODUCTS: WholesaleProductItem[] = [
  {
    id: 'prod-01',
    sku: 'SKU-CND-001',
    name: 'Choco Dream Truffle Bites',
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    brand: 'Candi Confections',
    category: 'Chocolates',
    subCategory: 'Truffles & Pralines',
    description: 'Decadent smooth milk chocolate truffles filled with creamy hazelnut ganache. Best-selling premium counter display item in Karachi supermarts.',
    baseUnit: 'carton',
    availableUnits: ['carton', 'box'],
    conversionSummary: '1 Carton = 10 Display Boxes = 120 Truffle Packs',
    piecesPerUnit: 120,
    weightKg: 6.5,
    standardWholesalePrice: 3200,
    recommendedRetailPrice: 4200,
    retailPricePerPiece: 35,
    wholesaleCostPerPiece: 26.67,
    marginPercentage: 23.8,
    tierPrices: {
      standard_retail: 3200,
      tier_3_silver: 3080,
      tier_2_gold: 2980,
      tier_1_platinum: 2880,
    },
    minOrderQuantity: 1,
    unitsInStock: 145,
    stockStatus: 'in_stock',
    isFeatured: true,
    isBulkOfferEligible: true,
    bulkOfferText: 'Buy 10 Cartons Get 1 Free',
    badgeText: 'BESTSELLER',
    accentColor: '#D92338',
    flavorNotes: ['Milk Chocolate', 'Hazelnut', 'Ganache'],
    shelfLifeMonths: 12,
    batchNumber: 'LOT-2026-CH09',
    expiryDate: '2027-08-30',
    storageCondition: 'Cool & dry place (18°C - 22°C), away from direct sunlight',
  },
  {
    id: 'prod-02',
    sku: 'SKU-CND-002',
    name: 'Crispy Hazelnut Wafers',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
    brand: 'Crispo Delights',
    category: 'Biscuits & Wafers',
    subCategory: 'Layered Wafers',
    description: 'Triple layered golden crispy wafer bars with roasted hazelnut cream filling. High rotation impulse purchase SKU for kiryana retail counters.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Carton = 12 Boxes = 288 Wafer Bars',
    piecesPerUnit: 288,
    weightKg: 8.2,
    standardWholesalePrice: 2400,
    recommendedRetailPrice: 3168,
    retailPricePerPiece: 11,
    wholesaleCostPerPiece: 8.33,
    marginPercentage: 24.2,
    tierPrices: {
      standard_retail: 2400,
      tier_3_silver: 2300,
      tier_2_gold: 2220,
      tier_1_platinum: 2150,
    },
    minOrderQuantity: 1,
    unitsInStock: 92,
    stockStatus: 'in_stock',
    isFeatured: true,
    isHighMargin: true,
    badgeText: 'FAST MOVER',
    accentColor: '#D9822B',
    flavorNotes: ['Hazelnut Cream', 'Crisp Wafer'],
    shelfLifeMonths: 9,
    batchNumber: 'LOT-2026-WF14',
    expiryDate: '2027-05-15',
    storageCondition: 'Dry room temperature, do not expose to humidity',
  },
  {
    id: 'prod-03',
    sku: 'SKU-CND-003',
    name: 'Velvet Caramel Bar Bulk Pack',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    brand: 'Cocoville Artisans',
    category: 'Chocolates',
    subCategory: 'Caramel Bars',
    description: 'Gourmet rich caramel center drenched in thick dark chocolate coating. Packaged in elegant retail counter ready display dispenser.',
    baseUnit: 'box',
    availableUnits: ['box'],
    conversionSummary: '1 Counter Dispenser Box = 24 King-size Bars',
    piecesPerUnit: 24,
    weightKg: 1.4,
    standardWholesalePrice: 1650,
    recommendedRetailPrice: 2400,
    retailPricePerPiece: 100,
    wholesaleCostPerPiece: 68.75,
    marginPercentage: 31.2,
    tierPrices: {
      standard_retail: 1650,
      tier_3_silver: 1590,
      tier_2_gold: 1540,
      tier_1_platinum: 1480,
    },
    minOrderQuantity: 1,
    unitsInStock: 210,
    stockStatus: 'in_stock',
    isHighMargin: true,
    isBulkOfferEligible: true,
    bulkOfferText: '6% Extra Cash Rebate on 15+ Boxes',
    badgeText: 'HIGH MARGIN',
    accentColor: '#43281C',
    flavorNotes: ['Gooey Caramel', 'Dark Cocoa'],
    shelfLifeMonths: 14,
    batchNumber: 'LOT-2026-VC03',
    expiryDate: '2027-10-20',
    storageCondition: 'Store below 24°C in air-conditioned storage',
  },
  {
    id: 'prod-04',
    sku: 'SKU-CND-004',
    name: 'Fruity Blast Chewy Candies',
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=600&q=80',
    brand: 'SweetNest Confections',
    category: 'Candies & Chews',
    subCategory: 'Fruit Chews',
    description: 'Juicy assorted fruit chews in Orange, Strawberry, Mango, and Green Apple flavors. Enriched with real fruit juice extract. Beloved by children.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Master Carton = 20 Pouch Packs = 400 Candies',
    piecesPerUnit: 400,
    weightKg: 5.0,
    standardWholesalePrice: 1450,
    recommendedRetailPrice: 2000,
    retailPricePerPiece: 5,
    wholesaleCostPerPiece: 3.63,
    marginPercentage: 27.5,
    tierPrices: {
      standard_retail: 1450,
      tier_3_silver: 1390,
      tier_2_gold: 1330,
      tier_1_platinum: 1280,
    },
    minOrderQuantity: 1,
    unitsInStock: 180,
    stockStatus: 'in_stock',
    badgeText: 'POPULAR',
    accentColor: '#E65100',
    flavorNotes: ['Mango', 'Strawberry', 'Orange', 'Green Apple'],
    shelfLifeMonths: 18,
    batchNumber: 'LOT-2026-FB22',
    expiryDate: '2028-02-28',
    storageCondition: 'Store in dry airtight cartons',
  },
  {
    id: 'prod-05',
    sku: 'SKU-CND-005',
    name: 'Sour Berry Gummy Bears Dispenser',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80',
    brand: 'SweetNest Confections',
    category: 'Gummies & Chews',
    subCategory: 'Gummies',
    description: 'Tangy sour dusted gelatin gummy bears in reusable clear counter dispenser tubs. Eye-catching checkout counter centerpiece.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Master Carton = 8 Counter Tubs = 160 Packets',
    piecesPerUnit: 160,
    weightKg: 7.2,
    standardWholesalePrice: 3800,
    recommendedRetailPrice: 4800,
    retailPricePerPiece: 30,
    wholesaleCostPerPiece: 23.75,
    marginPercentage: 20.8,
    tierPrices: {
      standard_retail: 3800,
      tier_3_silver: 3680,
      tier_2_gold: 3550,
      tier_1_platinum: 3450,
    },
    minOrderQuantity: 1,
    unitsInStock: 24,
    stockStatus: 'low_stock',
    badgeText: 'HOT DEMAND',
    accentColor: '#C2185B',
    flavorNotes: ['Sour Raspberry', 'Blueberry', 'Cranberry'],
    shelfLifeMonths: 12,
    batchNumber: 'LOT-2026-SB08',
    expiryDate: '2027-08-10',
    storageCondition: 'Cool dry room, avoid humidity above 65%',
  },
  {
    id: 'prod-06',
    sku: 'SKU-CND-006',
    name: 'Milky Moo Vanilla Toffee Tub',
    imageUrl: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ce?auto=format&fit=crop&w=600&q=80',
    brand: 'DairyCrest Sweets',
    category: 'Hard Candies & Toffees',
    subCategory: 'Caramel Toffees',
    description: 'Rich buffalo milk cream toffee with real Madagascar vanilla essence. Soft chew texture that does not stick to teeth.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Master Carton = 6 Jumbo Tubs = 360 Toffees',
    piecesPerUnit: 360,
    weightKg: 6.0,
    standardWholesalePrice: 1950,
    recommendedRetailPrice: 2520,
    retailPricePerPiece: 7,
    wholesaleCostPerPiece: 5.42,
    marginPercentage: 22.6,
    tierPrices: {
      standard_retail: 1950,
      tier_3_silver: 1890,
      tier_2_gold: 1820,
      tier_1_platinum: 1750,
    },
    minOrderQuantity: 1,
    unitsInStock: 85,
    stockStatus: 'in_stock',
    badgeText: 'TRADITIONAL FAV',
    accentColor: '#8D6E63',
    flavorNotes: ['Fresh Cream', 'Pure Vanilla', 'Brown Butter'],
    shelfLifeMonths: 15,
    batchNumber: 'LOT-2026-MM11',
    expiryDate: '2027-11-30',
    storageCondition: 'Protect from heat and sunlight',
  },
  {
    id: 'prod-07',
    sku: 'SKU-CND-007',
    name: 'Butter Crunch Toffee Bars',
    imageUrl: 'https://images.unsplash.com/photo-1565071559227-20ab25b7685e?auto=format&fit=crop&w=600&q=80',
    brand: 'DairyCrest Sweets',
    category: 'Hard Candies & Toffees',
    subCategory: 'Crunch Bars',
    description: 'Salted butter crunch brittle slabs with crushed almond dusting. High-end confectionery item with superior retailer profit margins.',
    baseUnit: 'box',
    availableUnits: ['box'],
    conversionSummary: '1 Display Tray Box = 36 Wrapped Crunch Slabs',
    piecesPerUnit: 36,
    weightKg: 1.8,
    standardWholesalePrice: 1200,
    recommendedRetailPrice: 1800,
    retailPricePerPiece: 50,
    wholesaleCostPerPiece: 33.33,
    marginPercentage: 33.3,
    tierPrices: {
      standard_retail: 1200,
      tier_3_silver: 1150,
      tier_2_gold: 1100,
      tier_1_platinum: 1050,
    },
    minOrderQuantity: 1,
    unitsInStock: 110,
    stockStatus: 'in_stock',
    isHighMargin: true,
    badgeText: '+33% PROFIT',
    accentColor: '#B78103',
    flavorNotes: ['Salted Butter', 'Roasted Almonds', 'Honey Brittle'],
    shelfLifeMonths: 10,
    batchNumber: 'LOT-2026-BC05',
    expiryDate: '2027-06-30',
    storageCondition: 'Cool dry shelf',
  },
  {
    id: 'prod-08',
    sku: 'SKU-CND-008',
    name: 'Candi Pop Jumbo Fruit Lollipops',
    imageUrl: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=600&q=80',
    brand: 'Candi Confections',
    category: 'Candies & Chews',
    subCategory: 'Lollipops',
    description: 'Dual-flavor swirl jumbo ball lollipops with bubble gum center. Packaged in heavy clear acrylic counter-top display jars.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Master Carton = 12 Counter Jars = 600 Pops',
    piecesPerUnit: 600,
    weightKg: 11.5,
    standardWholesalePrice: 2750,
    recommendedRetailPrice: 3600,
    retailPricePerPiece: 6,
    wholesaleCostPerPiece: 4.58,
    marginPercentage: 23.6,
    tierPrices: {
      standard_retail: 2750,
      tier_3_silver: 2650,
      tier_2_gold: 2550,
      tier_1_platinum: 2450,
    },
    minOrderQuantity: 1,
    unitsInStock: 130,
    stockStatus: 'in_stock',
    badgeText: 'KIDS FAVORITE',
    accentColor: '#E91E63',
    flavorNotes: ['Strawberry Bubblegum', 'Blue Raspberry', 'Mango Tango'],
    shelfLifeMonths: 24,
    batchNumber: 'LOT-2026-CP19',
    expiryDate: '2028-09-15',
    storageCondition: 'Store in dry cartons away from damp floors',
  },
  {
    id: 'prod-09',
    sku: 'SKU-CND-009',
    name: 'Mint Fresh Spearmint Chewing Gum',
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80',
    brand: 'FreshBreeze Labs',
    category: 'Gums & Mints',
    subCategory: 'Sugarfree Gum',
    description: 'Long-lasting cooling burst spearmint pellet chewing gum with breath-freshening micro-crystals. Fast-moving checkout register item.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Carton = 24 Display Trays = 480 Blister Packs',
    piecesPerUnit: 480,
    weightKg: 5.8,
    standardWholesalePrice: 2100,
    recommendedRetailPrice: 2880,
    retailPricePerPiece: 6,
    wholesaleCostPerPiece: 4.38,
    marginPercentage: 27.1,
    tierPrices: {
      standard_retail: 2100,
      tier_3_silver: 2020,
      tier_2_gold: 1950,
      tier_1_platinum: 1880,
    },
    minOrderQuantity: 1,
    unitsInStock: 75,
    stockStatus: 'in_stock',
    badgeText: 'IMPULSE BUY',
    accentColor: '#00897B',
    flavorNotes: ['Spearmint', 'Eucalyptus Cool', 'Micro-mint'],
    shelfLifeMonths: 18,
    batchNumber: 'LOT-2026-MF04',
    expiryDate: '2028-03-31',
    storageCondition: 'Standard dry retail environment',
  },
  {
    id: 'prod-10',
    sku: 'SKU-CND-010',
    name: 'Marshmallow Clouds Pastel Bag',
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    brand: 'SweetNest Confections',
    category: 'Gummies & Chews',
    subCategory: 'Marshmallows',
    description: 'Ultra fluffy vanilla scented pastel marshmallows (Pink, White, Peach). Halal bovine gelatin certified. High turnover for school canteens & bakeries.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Master Carton = 16 Family Pack Bags (250g each)',
    piecesPerUnit: 16,
    weightKg: 4.2,
    standardWholesalePrice: 1850,
    recommendedRetailPrice: 2400,
    retailPricePerPiece: 150,
    wholesaleCostPerPiece: 115.63,
    marginPercentage: 22.9,
    tierPrices: {
      standard_retail: 1850,
      tier_3_silver: 1780,
      tier_2_gold: 1720,
      tier_1_platinum: 1650,
    },
    minOrderQuantity: 1,
    unitsInStock: 50,
    stockStatus: 'in_stock',
    badgeText: 'HALAL CERTIFIED',
    accentColor: '#AB47BC',
    flavorNotes: ['Vanilla Cloud', 'Soft Strawberry'],
    shelfLifeMonths: 12,
    batchNumber: 'LOT-2026-MC07',
    expiryDate: '2027-09-01',
    storageCondition: 'Store below 25°C in clean conditions',
  },
  {
    id: 'prod-11',
    sku: 'SKU-CND-011',
    name: 'Royal Eclairs Cocoa Center Fill',
    imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
    brand: 'Cocoville Artisans',
    category: 'Chocolates',
    subCategory: 'Eclairs',
    description: 'Traditional chewy caramel toffee casing filled with liquid chocolate fudge center. Pakistani consumer perennial household favorite.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Master Carton = 10 Retail Pouches = 500 Eclairs',
    piecesPerUnit: 500,
    weightKg: 6.8,
    standardWholesalePrice: 2250,
    recommendedRetailPrice: 3000,
    retailPricePerPiece: 6,
    wholesaleCostPerPiece: 4.5,
    marginPercentage: 25.0,
    tierPrices: {
      standard_retail: 2250,
      tier_3_silver: 2180,
      tier_2_gold: 2100,
      tier_1_platinum: 2020,
    },
    minOrderQuantity: 1,
    unitsInStock: 120,
    stockStatus: 'in_stock',
    badgeText: 'CLASSIC',
    accentColor: '#5D4037',
    flavorNotes: ['Liquid Chocolate', 'Golden Caramel'],
    shelfLifeMonths: 15,
    batchNumber: 'LOT-2026-RE16',
    expiryDate: '2027-12-15',
    storageCondition: 'Normal room temperature',
  },
  {
    id: 'prod-12',
    sku: 'SKU-CND-012',
    name: 'Kiryana Starter Mixed Confectionery Hamper',
    imageUrl: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=600&q=80',
    brand: 'Candi Super Store Wholesale',
    category: 'Biscuits & Wafers',
    subCategory: 'Assorted Hamper',
    description: 'Pre-curated wholesale starter bundle containing 8 top-selling SKUs: Choco Truffles (2 boxes), Hazelnut Wafers (2 boxes), Fruit Chews (2 pouches), Lollipops (1 jar), and Spearmint Gums (1 tray). Perfect for newly stocked kiryana shops.',
    baseUnit: 'carton',
    availableUnits: ['carton'],
    conversionSummary: '1 Master Hamper Carton = 8 Assorted Display Units',
    piecesPerUnit: 8,
    weightKg: 14.5,
    standardWholesalePrice: 9500,
    recommendedRetailPrice: 12500,
    retailPricePerPiece: 1562.5,
    wholesaleCostPerPiece: 1187.5,
    marginPercentage: 24.0,
    tierPrices: {
      standard_retail: 9500,
      tier_3_silver: 9200,
      tier_2_gold: 8900,
      tier_1_platinum: 8550,
    },
    minOrderQuantity: 1,
    unitsInStock: 35,
    stockStatus: 'in_stock',
    isFeatured: true,
    badgeText: 'STARTER PACK',
    accentColor: '#1B5E20',
    flavorNotes: ['Curated Best-Sellers', 'Multi-Category'],
    shelfLifeMonths: 10,
    batchNumber: 'LOT-2026-HMP01',
    expiryDate: '2027-07-20',
    storageCondition: 'Store in dry place',
  },
];

export const KARACHI_DELIVERY_SLOTS = [
  { id: 'morning', label: 'Morning Slot (09:00 AM – 01:00 PM)', description: 'Early morning van delivery before peak bazaar crowd', fee: 0 },
  { id: 'afternoon', label: 'Afternoon Slot (02:00 PM – 06:00 PM)', description: 'Standard wholesale route dispatch', fee: 0 },
  { id: 'next_day_express', label: 'Priority Express Delivery (Guaranteed 10:00 AM)', description: 'Priority warehouse picking with dedicated dispatch van', fee: 150 },
];

export const INITIAL_MOCK_ORDERS: WholesaleOrderRecord[] = [
  {
    id: 'ord-khi-901',
    orderNumber: 'ORD-KHI-20261006-7731',
    orderDate: '2026-10-06 11:20 AM',
    deliveryDate: 'Today (2026-10-07)',
    deliverySlot: 'Morning Slot (09:00 AM – 01:00 PM)',
    deliveryAddress: {
      label: 'Main Shop Counter',
      recipientName: 'Muhammad Bilal Khan',
      phone: '+92 300 1111111',
      addressLine: 'Shop 4, Block H, Main Commercial Road',
      area: 'North Nazimabad',
      city: 'Karachi',
    },
    items: [
      {
        productId: 'prod-01',
        sku: 'SKU-CND-001',
        name: 'Choco Dream Truffle Bites',
        unit: 'carton',
        quantity: 3,
        unitPrice: 3200,
        subtotal: 9600,
        piecesCount: 360,
      },
      {
        productId: 'prod-02',
        sku: 'SKU-CND-002',
        name: 'Crispy Hazelnut Wafers',
        unit: 'carton',
        quantity: 2,
        unitPrice: 2400,
        subtotal: 4800,
        piecesCount: 576,
      },
    ],
    totalCartons: 5,
    subtotal: 14400,
    bulkDiscount: 720, // 5% bulk promo
    taxAmount: 68.4, // 0.5% advance tax
    deliveryFee: 0, // Free above 5000
    grandTotal: 13748.4,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    orderStatus: 'dispatched',
    driverName: 'Muhammad Tariq (Van #4)',
    driverPhone: '+92 301 5552391',
    deliveryVanPlate: 'KHI-VAN-7821',
    riderNote: 'Deliver to main counter, collect cash from Bilal Sahib',
  },
  {
    id: 'ord-khi-850',
    orderNumber: 'ORD-KHI-20260928-3190',
    orderDate: '2026-09-28 03:45 PM',
    deliveryDate: '2026-09-29',
    deliverySlot: 'Afternoon Slot (02:00 PM – 06:00 PM)',
    deliveryAddress: {
      label: 'Main Shop Counter',
      recipientName: 'Muhammad Bilal Khan',
      phone: '+92 300 1111111',
      addressLine: 'Shop 4, Block H, Main Commercial Road',
      area: 'North Nazimabad',
      city: 'Karachi',
    },
    items: [
      {
        productId: 'prod-04',
        sku: 'SKU-CND-004',
        name: 'Fruity Blast Chewy Candies',
        unit: 'carton',
        quantity: 4,
        unitPrice: 1450,
        subtotal: 5800,
        piecesCount: 1600,
      },
      {
        productId: 'prod-08',
        sku: 'SKU-CND-008',
        name: 'Candi Pop Jumbo Fruit Lollipops',
        unit: 'carton',
        quantity: 2,
        unitPrice: 2750,
        subtotal: 5500,
        piecesCount: 1200,
      },
    ],
    totalCartons: 6,
    subtotal: 11300,
    bulkDiscount: 565,
    taxAmount: 53.68,
    deliveryFee: 0,
    grandTotal: 10788.68,
    paymentMethod: 'credit_khata',
    paymentStatus: 'on_credit',
    orderStatus: 'delivered',
    driverName: 'Kashif Alam',
    driverPhone: '+92 302 9993321',
    deliveryVanPlate: 'KHI-VAN-6014',
    riderNote: 'Signed delivery challan retained at shop',
  },
];

import { supabase, isLiveSupabase } from '@candi/auth';
import { WholesaleProductItem, WholesaleOrderRecord, WHOLESALE_PRODUCTS } from '../data/wholesaleCatalogData';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Map a Supabase products row to WholesaleProductItem format
export function mapSupabaseProductToWholesale(row: any, index: number = 0): WholesaleProductItem {
  // Check if we have an existing mock with matching SKU to preserve rich photography and metadata
  const existingMock = WHOLESALE_PRODUCTS.find((p) => p.sku === row.sku);
  
  const basePrice = Number(row.retailer_price ?? row.base_price ?? 1000);
  const subWholesalerPrice = Number(row.sub_wholesaler_price ?? basePrice * 0.95);
  const rrp = Number(row.recommended_retail_price ?? Math.round(basePrice * 1.25));
  const pieces = Number(row.pieces_per_unit ?? existingMock?.piecesPerUnit ?? 24);

  return {
    id: row.id || existingMock?.id || `prod-db-${index + 1}`,
    sku: row.sku || `CND-SKU-${index + 1}`,
    name: row.name || existingMock?.name || 'Wholesale Confectionery Item',
    imageUrl: row.image_url || existingMock?.imageUrl || 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    brand: row.brand || existingMock?.brand || 'Candi Wholesale',
    category: row.category || existingMock?.category || 'Chocolates & Bars',
    subCategory: row.sub_category || existingMock?.subCategory || row.category || 'Confectionery',
    description: row.description || existingMock?.description || 'Commercial bulk carton packaged for retail Kiryana & wholesale distribution.',
    baseUnit: (row.base_unit as any) || existingMock?.baseUnit || 'carton',
    availableUnits: existingMock?.availableUnits || [(row.base_unit as any) || 'carton'],
    conversionSummary: existingMock?.conversionSummary || `1 ${row.base_unit || 'Carton'} = ${pieces} Pieces`,
    piecesPerUnit: pieces,
    weightKg: Number(row.weight_kg ?? existingMock?.weightKg ?? 1.2),
    standardWholesalePrice: basePrice,
    recommendedRetailPrice: rrp,
    retailPricePerPiece: Math.round(rrp / pieces),
    wholesaleCostPerPiece: Math.round(basePrice / pieces),
    marginPercentage: Math.max(10, Math.round(((rrp - basePrice) / rrp) * 100)),
    tierPrices: {
      standard_retail: basePrice,
      tier_3_silver: Math.round(basePrice * 0.98),
      tier_2_gold: Math.round(basePrice * 0.95),
      tier_1_platinum: subWholesalerPrice,
    },
    minOrderQuantity: Number(row.min_order_qty ?? existingMock?.minOrderQuantity ?? 1),
    unitsInStock: Number(row.units_available ?? 100),
    stockStatus: Number(row.units_available ?? 100) <= 0 ? 'out_of_stock' : Number(row.units_available ?? 100) < 30 ? 'low_stock' : 'in_stock',
    isFeatured: row.is_featured ?? existingMock?.isFeatured ?? false,
    isHighMargin: existingMock?.isHighMargin ?? true,
    isBulkOfferEligible: existingMock?.isBulkOfferEligible ?? true,
    bulkOfferText: existingMock?.bulkOfferText || 'Bulk Wholesale Savings',
    badgeText: existingMock?.badgeText,
    accentColor: existingMock?.accentColor || '#6366f1',
    flavorNotes: existingMock?.flavorNotes || ['Wholesale Confectionery'],
    shelfLifeMonths: existingMock?.shelfLifeMonths || 12,
    batchNumber: row.batch_number || existingMock?.batchNumber || `BATCH-${row.sku || 'KHI-01'}`,
    expiryDate: row.expiry_date || existingMock?.expiryDate || '2027-12-31',
    storageCondition: row.storage_condition || existingMock?.storageCondition || 'Store in cool, dry conditions (18-22°C)',
  };
}

/**
 * 1. Fetch live products from Supabase database
 * Returns live products if available, falls back to WHOLESALE_PRODUCTS on error or empty table.
 */
export async function fetchLiveProducts(): Promise<WholesaleProductItem[]> {
  if (!isLiveSupabase || !supabase) {
    console.info('[Supabase] Offline/Mock mode active. Using WHOLESALE_PRODUCTS catalog.');
    return WHOLESALE_PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching products, falling back to mock catalog:', error.message);
      return WHOLESALE_PRODUCTS;
    }

    if (data && data.length > 0) {
      console.info(`[Supabase] Successfully loaded ${data.length} live products from database.`);
      return data.map((row: any, idx: number) => mapSupabaseProductToWholesale(row, idx));
    }

    console.info('[Supabase] Products table is currently empty, using default catalog.');
    return WHOLESALE_PRODUCTS;
  } catch (err) {
    console.error('[Supabase] Network or connection error while fetching products:', err);
    return WHOLESALE_PRODUCTS;
  }
}

/**
 * 2. Submit customer wholesale order to Supabase
 * Persists to public.orders table if Supabase is connected and valid foreign keys exist.
 */
export async function submitCustomerOrder(
  order: WholesaleOrderRecord,
  accountInfo?: {
    customerAccountId?: string;
    deliveryAddressId?: string;
    deliveryZoneId?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isLiveSupabase || !supabase) {
    console.info('[Supabase] Running offline: Order saved locally in browser storage:', order.orderNumber);
    return { success: true, data: order };
  }

  try {
    // Check if we have valid UUIDs for foreign key constraints in Supabase schema
    const accountId = accountInfo?.customerAccountId;
    const addressId = accountInfo?.deliveryAddressId;
    const zoneId = accountInfo?.deliveryZoneId;

    const hasValidUUIDs =
      accountId && UUID_REGEX.test(accountId) &&
      addressId && UUID_REGEX.test(addressId) &&
      zoneId && UUID_REGEX.test(zoneId);

    if (!hasValidUUIDs) {
      console.info(
        '[Supabase] Order placed with local/demo account credentials. Saved to local state and localStorage.',
        { orderNumber: order.orderNumber }
      );
      return { success: true, data: order };
    }

    const orderPayload = {
      order_number: order.orderNumber,
      customer_account_id: accountId,
      delivery_address_id: addressId,
      delivery_zone_id: zoneId,
      status: 'confirmed',
      subtotal: order.subtotal,
      discount: order.bulkDiscount,
      tax: order.taxAmount,
      total: order.grandTotal,
      payment_method: order.paymentMethod === 'credit_khata' ? 'credit_khata' : 'cash_on_delivery',
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase] Notice on order insert (saved locally as fallback):', error.message);
      return { success: false, error: error.message };
    }

    console.info('[Supabase] Successfully persisted order to database:', data);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Supabase] Error submitting order to database:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

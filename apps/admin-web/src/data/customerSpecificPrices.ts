import { CustomerSpecificPrice } from '@candi/types';

export const INITIAL_CUSTOMER_SPECIFIC_PRICES: CustomerSpecificPrice[] = [
  {
    id: 'csp-01',
    customerId: 'cust-01', // Tariq Mehmood / Mehmood Traders Wholesale
    customerName: 'Mehmood Traders Wholesale',
    productId: 'prod-01',  // Choco Dream Truffle Bites
    sku: 'SKU-CND-001',
    specialPrice: 2800,    // Contract price lower than Tier 1 price (2880)
    contractRef: 'CTR-MTW-2026-Q3',
    reason: 'Exclusive regional distributor agreement for Saddar wholesale hub.',
    approvedBy: 'Kashif Razzaq (Commercial Director)',
    effectiveDate: '2026-07-01',
    expiryDate: '2026-12-31',
    status: 'active',
  },
  {
    id: 'csp-02',
    customerId: 'cust-02', // Rashid Ali / Ali & Sons Candy Mart
    customerName: 'Ali & Sons Candy Mart',
    productId: 'prod-03',  // Velvet Caramel Bar Bulk Pack
    sku: 'SKU-CND-003',
    specialPrice: 1420,    // Special negotiated rate (standard 1650, tier 2 is 1540)
    contractRef: 'CTR-ALI-2026-V1',
    reason: 'Annual master volume commitment agreement.',
    approvedBy: 'Kashif Razzaq (Commercial Director)',
    effectiveDate: '2026-08-01',
    expiryDate: '2026-11-30',
    status: 'active',
  },
  {
    id: 'csp-03',
    customerId: 'cust-03', // Kamran Siddiqui / Al-Madina Mini Mart
    customerName: 'Al-Madina Mini Mart',
    productId: 'prod-02',  // Crispy Hazelnut Wafers
    sku: 'SKU-CND-002',
    specialPrice: 2000,
    contractRef: 'CTR-MADINA-EXP',
    reason: 'Grand opening sponsorship pricing.',
    approvedBy: 'Kashif Razzaq (Commercial Director)',
    effectiveDate: '2026-06-01',
    expiryDate: '2026-07-31', // Expired!
    status: 'expired',
  },
];

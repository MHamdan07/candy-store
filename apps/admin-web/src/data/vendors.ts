export interface VendorOption {
  id: string;
  name: string;
  city: string;
  category: string;
}

export const VENDOR_REGISTRY: VendorOption[] = [
  { id: 'ven-01', name: 'National Confectionery Industries Ltd.', city: 'Karachi', category: 'Confectionery Manufacturer' },
  { id: 'ven-02', name: 'Golden Wheat Milling & Bakery Supplies', city: 'Karachi', category: 'Bakery & Wafers Supplier' },
  { id: 'ven-03', name: 'Continental Biscuits Ltd. (LU)', city: 'Sukkur', category: 'Biscuit Manufacturer' },
  { id: 'ven-04', name: 'English Biscuit Manufacturers (Pvt) Ltd.', city: 'Karachi', category: 'Biscuit & Confectionery' },
  { id: 'ven-05', name: 'Hilal Foods (Pvt) Ltd.', city: 'Karachi', category: 'Confectionery & Jelly Manufacturer' },
  { id: 'ven-06', name: 'Ismail Industries Ltd. (Candyland / Bisconni)', city: 'Hub', category: 'Confectionery & Snacks' },
];

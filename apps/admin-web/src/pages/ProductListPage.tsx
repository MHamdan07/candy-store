import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Dropdown } from '@candi/ui';

interface ProductItem {
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
}

const PRODUCTS_DATA: ProductItem[] = [
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
    availableStock: 285,
    reservedStock: 15,
    isActive: true,
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
  },
];

export const ProductListPage: React.FC = () => {
  const [products] = useState<ProductItem[]>(PRODUCTS_DATA);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    { header: 'SKU', accessor: 'sku' as const, width: '120px' },
    {
      header: 'Product Name',
      render: (row: ProductItem) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-smoky-black)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            {row.brand} • <span style={{ color: 'var(--color-warning)' }}>{row.category}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Packaging Hierarchy',
      render: (row: ProductItem) => (
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: 'var(--color-surface-muted)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-bone)',
            }}
          >
            Base: {row.baseUnit.toUpperCase()}
          </span>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '3px' }}>
            {row.conversionSummary}
          </div>
        </div>
      ),
    },
    {
      header: 'Wholesale Tiers',
      render: (row: ProductItem) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-smoky-black)' }}>
            Retailer: PKR {row.retailerPrice.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
            Sub-Wholesale: PKR {row.subWholesalerPrice.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Available Units',
      render: (row: ProductItem) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            {row.availableStock} {row.baseUnit}s
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            Reserved: {row.reservedStock}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row: ProductItem) => (
        <Badge status={row.isActive ? 'approved' : 'suspended'} label={row.isActive ? 'Active' : 'Inactive'} />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Category Filters */}
      <Card padding="md">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              label="Search Product Master"
              placeholder="Search by SKU, product name, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '220px' }}>
            <Dropdown
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'Chocolates & Bars', label: 'Chocolates & Bars' },
                { value: 'Biscuits & Wafers', label: 'Biscuits & Wafers' },
                { value: 'Candies & Gummies', label: 'Candies & Gummies' },
                { value: 'Dairy & Beverages', label: 'Dairy & Beverages' },
              ]}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setCategoryFilter('ALL');
            }}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* Catalog Table */}
      <Card padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
              Wholesale SKU Catalog ({filteredProducts.length})
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
              Fixed base-unit inventory invariant ensures zero stock variance on broken-carton sales.
            </p>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredProducts}
          keyExtractor={(row) => row.id}
          emptyMessage="No wholesale products found"
        />
      </Card>
    </div>
  );
};

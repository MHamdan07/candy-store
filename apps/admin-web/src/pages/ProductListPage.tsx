import React, { useState, useMemo } from 'react';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import {
  CategoryManagementModal,
  AdminCategory,
} from '../components/CategoryManagementModal';
import { ProductFormModal, AdminProductFormValues } from '../components/ProductFormModal';
import { StockAdjustModal } from '../components/StockAdjustModal';

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

const INITIAL_CATEGORIES: AdminCategory[] = [
  { id: 'cat-choc', name: 'Chocolates & Bars', icon: '🍫', isActive: true, displayOrder: 1 },
  { id: 'cat-wfr', name: 'Biscuits & Wafers', icon: '🧇', isActive: true, displayOrder: 2 },
  { id: 'cat-cnd', name: 'Candies & Gummies', icon: '🍭', isActive: true, displayOrder: 3 },
  { id: 'cat-tof', name: 'Toffees & Hard Candies', icon: '🍯', isActive: true, displayOrder: 4 },
  { id: 'cat-bev', name: 'Dairy & Beverages', icon: '🥛', isActive: true, displayOrder: 5 },
  { id: 'cat-mint', name: 'Gums & Mints', icon: '🌿', isActive: true, displayOrder: 6 },
];

const INITIAL_PRODUCTS_DATA: ProductItem[] = [
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

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS_DATA);
  const [categories, setCategories] = useState<AdminCategory[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Product Form Modal State (Add & Edit)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductItem | null>(null);

  // Stock Adjustment Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [productToRestock, setProductToRestock] = useState<ProductItem | null>(null);

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  // Quick inline category reassignment dialog
  const [quickCategoryProduct, setQuickCategoryProduct] = useState<ProductItem | null>(null);
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  // Product counts per category
  const productCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.name] = products.filter((p) => p.category === cat.name).length;
    });
    return counts;
  }, [products, categories]);

  // Handle Save (Add or Edit Product)
  const handleSaveProduct = (formValues: AdminProductFormValues) => {
    if (productToEdit) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productToEdit.id
            ? {
                ...p,
                ...formValues,
                id: productToEdit.id,
              }
            : p
        )
      );
      showToast(`Updated product "${formValues.name}" (${formValues.sku}) successfully`);
    } else {
      // Add brand new product
      const newProduct: ProductItem = {
        id: formValues.id || `prod-${Date.now()}`,
        sku: formValues.sku,
        name: formValues.name,
        category: formValues.category,
        brand: formValues.brand,
        baseUnit: formValues.baseUnit,
        conversionSummary: formValues.conversionSummary,
        retailerPrice: formValues.retailerPrice,
        subWholesalerPrice: formValues.subWholesalerPrice,
        availableStock: formValues.availableStock,
        reservedStock: formValues.reservedStock,
        isActive: formValues.isActive,
        imageUrl: formValues.imageUrl,
        badgeText: formValues.badgeText,
        shelfLifeMonths: formValues.shelfLifeMonths,
        expiryDate: formValues.expiryDate,
        batchNumber: formValues.batchNumber,
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast(`Created & published new product "${newProduct.name}" (${newProduct.sku})`);
    }

    setProductToEdit(null);
    setIsProductFormOpen(false);
  };

  // Handle Delete Product
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    showToast(`Deleted SKU "${productToDelete.sku}" (${productToDelete.name}) from wholesale catalog`, 'warning');
    setProductToDelete(null);
  };

  // Handle Stock Restock Update
  const handleStockUpdated = (productId: string, newAvailableStock: number, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, availableStock: newAvailableStock } : p))
    );
    const prod = products.find((p) => p.id === productId);
    showToast(
      `Stock updated for ${prod?.sku || 'SKU'}: Now ${newAvailableStock} ${prod?.baseUnit}s available. (${reason})`
    );
    setIsStockModalOpen(false);
    setProductToRestock(null);
  };

  // Handle Category Switch
  const handleUpdateProductCategory = (productId: string, newCategory: string) => {
    const targetCat = categories.find((c) => c.name === newCategory);
    if (!targetCat?.isActive) {
      showToast(`Category "${newCategory}" is inactive. Enable it in Category Management.`, 'error');
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, category: newCategory } : p))
    );
    const prod = products.find((p) => p.id === productId);
    showToast(`Reassigned "${prod?.name || 'Product'}" to category "${newCategory}"`);
    setQuickCategoryProduct(null);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const categoryOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'All Categories' },
      ...categories.map((c) => ({
        value: c.name,
        label: `${c.icon} ${c.name} (${productCountsByCategory[c.name] || 0})${!c.isActive ? ' [Inactive]' : ''}`,
      })),
    ];
  }, [categories, productCountsByCategory]);

  const columns = [
    {
      header: 'Product & SKU',
      width: '280px',
      render: (row: ProductItem) => {
        const catDef = categories.find((c) => c.name === row.category);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 1:1 Thumbnail or Confectionery Fallback */}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                backgroundColor: '#0F172A',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0,
                border: '1px solid #E2E8F0',
              }}
            >
              {row.imageUrl ? (
                <img
                  src={row.imageUrl}
                  alt={row.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              ) : (
                <span style={{ fontSize: '20px' }}>{catDef?.icon || '🍫'}</span>
              )}
              {row.badgeText && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    color: '#FCD34D',
                    fontSize: '7.5px',
                    fontWeight: 900,
                    textAlign: 'center',
                    padding: '1px 0',
                    letterSpacing: '0.02em',
                  }}
                >
                  {row.badgeText}
                </span>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-smoky-black)' }}>{row.name}</div>
              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{row.sku}</span>
                <span>•</span>
                <span>{row.brand}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Category',
      render: (row: ProductItem) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={row.category}
              onChange={(e) => handleUpdateProductCategory(row.id, e.target.value)}
              style={{
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
              title="Quick-switch category"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name} disabled={!c.isActive}>
                  {c.icon} {c.name} {!c.isActive ? '(Inactive)' : ''}
                </option>
              ))}
            </select>
          </div>
        );
      },
    },
    {
      header: 'Packaging Hierarchy',
      render: (row: ProductItem) => (
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
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
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-smoky-black)' }}>
            Retailer: PKR {row.retailerPrice.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, marginTop: '1px' }}>
            Sub-Wholesale: PKR {row.subWholesalerPrice.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Live Stock & Restock',
      render: (row: ProductItem) => {
        const isLowStock = row.availableStock < 50;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  color: isLowStock ? '#DC2626' : '#059669',
                  backgroundColor: isLowStock ? '#FEF2F2' : '#ECFDF5',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: `1px solid ${isLowStock ? '#FECACA' : '#A7F3D0'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{isLowStock ? '⚠️' : '✓'}</span>
                <span>{row.availableStock} {row.baseUnit}s</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setProductToRestock(row);
                  setIsStockModalOpen(true);
                }}
                style={{
                  padding: '2px 6px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                title="Add incoming stock consignment"
              >
                + Restock
              </button>
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--color-olive-drab)', marginTop: '3px' }}>
              Reserved: {row.reservedStock}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      width: '190px',
      render: (row: ProductItem) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setProductToEdit(row);
              setIsProductFormOpen(true);
            }}
          >
            ✏️ Edit
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setProductToDelete(row)}
            style={{ color: '#DC2626' }}
          >
            🗑️ Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toast && (
        <Alert type={toast.type} onClose={() => setToast(null)}>
          {toast.message}
        </Alert>
      )}

      {/* Search, Filter & Action Toolbar */}
      <Card padding="md">
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', flex: 1 }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                label="Search Wholesale Master"
                placeholder="Search by SKU, product name, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ width: '260px' }}>
              <Dropdown
                label="Category Filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categoryOptions}
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

          {/* Action Buttons: Add Product & Manage Categories */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Button
              variant="primary"
              onClick={() => {
                setProductToEdit(null);
                setIsProductFormOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#E11D48', color: '#FFFFFF', fontWeight: 800 }}
            >
              <span>➕</span>
              <span>Add New Product</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🏷️</span>
              <span>Manage Categories ({categories.length})</span>
            </Button>
          </div>
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
              Full master CRUD: Add new products, update wholesale tiers, inspect inventory health, restock incoming cartons, and reassign categories.
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

      {/* MODAL 1: ADD / EDIT PRODUCT FORM */}
      {isProductFormOpen && (
        <ProductFormModal
          isOpen={isProductFormOpen}
          onClose={() => {
            setIsProductFormOpen(false);
            setProductToEdit(null);
          }}
          categories={categories}
          initialValues={productToEdit}
          onSave={handleSaveProduct}
        />
      )}

      {/* MODAL 2: STOCK RESTOCK & INVENTORY CHECK */}
      {isStockModalOpen && productToRestock && (
        <StockAdjustModal
          isOpen={isStockModalOpen}
          onClose={() => {
            setIsStockModalOpen(false);
            setProductToRestock(null);
          }}
          product={productToRestock}
          onStockUpdated={handleStockUpdated}
        />
      )}

      {/* MODAL 3: DELETE CONFIRMATION DIALOG */}
      {productToDelete && (
        <Modal
          isOpen={Boolean(productToDelete)}
          onClose={() => setProductToDelete(null)}
          title="⚠️ Confirm Product SKU Deletion"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '12px 0' }}>
            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to delete <strong>{productToDelete.name}</strong> (SKU: <code>{productToDelete.sku}</code>)?
            </p>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              This will remove the item from the live B2B customer wholesale catalog and cart ordering.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button variant="outline" onClick={() => setProductToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: FULL CATEGORY MANAGEMENT */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onUpdateCategories={setCategories}
        productCountsByCategory={productCountsByCategory}
        onReassignCategoryProducts={(fromCat, toCat) => {
          setProducts((prev) =>
            prev.map((p) => (p.category === fromCat ? { ...p, category: toCat } : p))
          );
        }}
        onShowToast={showToast}
      />
    </div>
  );
};

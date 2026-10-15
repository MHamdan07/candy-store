import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Dropdown, Badge, Alert } from '@candi/ui';
import { AdminCategory } from './CategoryManagementModal';

export interface AdminProductFormValues {
  id?: string;
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

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: AdminCategory[];
  initialValues?: AdminProductFormValues | null;
  onSave: (product: AdminProductFormValues) => void;
}

const BADGE_PRESETS = [
  'None',
  'BESTSELLER',
  'FAST MOVER',
  'HIGH MARGIN',
  'STARTER PACK',
  'POPULAR',
  'HOT DEMAND',
];

const BASE_UNIT_OPTIONS = [
  { value: 'carton', label: 'Carton (Master Outer)' },
  { value: 'box', label: 'Box (Inner Display)' },
  { value: 'packet', label: 'Packet / Bag' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialValues,
  onSave,
}) => {
  const isEditing = Boolean(initialValues?.id);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('Candi Delights');
  const [baseUnit, setBaseUnit] = useState('carton');
  const [conversionSummary, setConversionSummary] = useState('');
  const [retailerPrice, setRetailerPrice] = useState<number>(2500);
  const [subWholesalerPrice, setSubWholesalerPrice] = useState<number>(2300);
  const [availableStock, setAvailableStock] = useState<number>(100);
  const [reservedStock, setReservedStock] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [badgeText, setBadgeText] = useState('None');
  const [shelfLifeMonths, setShelfLifeMonths] = useState<number>(12);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [batchNumber, setBatchNumber] = useState('LOT-2026-01');
  const [error, setError] = useState<string | null>(null);

  // Sync form state when modal opens or initialValues change
  useEffect(() => {
    if (initialValues) {
      setSku(initialValues.sku);
      setName(initialValues.name);
      setCategory(initialValues.category);
      setBrand(initialValues.brand);
      setBaseUnit(initialValues.baseUnit || 'carton');
      setConversionSummary(initialValues.conversionSummary || '');
      setRetailerPrice(initialValues.retailerPrice || 0);
      setSubWholesalerPrice(initialValues.subWholesalerPrice || 0);
      setAvailableStock(initialValues.availableStock || 0);
      setReservedStock(initialValues.reservedStock || 0);
      setIsActive(initialValues.isActive ?? true);
      setImageUrl(initialValues.imageUrl || '');
      setBadgeText(initialValues.badgeText || 'None');
      setShelfLifeMonths(initialValues.shelfLifeMonths || 12);
      setExpiryDate(initialValues.expiryDate || '2027-12-31');
      setBatchNumber(initialValues.batchNumber || 'LOT-2026-01');
    } else {
      // Default values for new product
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setSku(`CND-SKU-${randomSuffix}`);
      setName('');
      setCategory(categories[0]?.name || 'Chocolates & Bars');
      setBrand('Candi Delights');
      setBaseUnit('carton');
      setConversionSummary('1 Carton = 12 Display Boxes = 144 Pieces');
      setRetailerPrice(2800);
      setSubWholesalerPrice(2600);
      setAvailableStock(150);
      setReservedStock(0);
      setIsActive(true);
      setImageUrl('https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80');
      setBadgeText('BESTSELLER');
      setShelfLifeMonths(12);
      setExpiryDate('2027-12-31');
      setBatchNumber(`LOT-${new Date().getFullYear()}-${randomSuffix}`);
    }
    setError(null);
  }, [initialValues, categories, isOpen]);

  // Handle local image file upload preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size exceeds 2MB limit. Please upload an optimized image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim() || !name.trim()) {
      setError('SKU code and Product Name are mandatory');
      return;
    }
    if (retailerPrice <= 0 || subWholesalerPrice <= 0) {
      setError('Wholesale prices must be greater than zero');
      return;
    }
    if (subWholesalerPrice > retailerPrice) {
      setError('Sub-Wholesaler tier price should be equal to or lower than Standard Retailer price');
      return;
    }

    onSave({
      id: initialValues?.id || `prod-${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: category || categories[0]?.name || 'General',
      brand: brand.trim(),
      baseUnit,
      conversionSummary: conversionSummary.trim(),
      retailerPrice: Number(retailerPrice),
      subWholesalerPrice: Number(subWholesalerPrice),
      availableStock: Number(availableStock),
      reservedStock: Number(reservedStock),
      isActive,
      imageUrl: imageUrl.trim(),
      badgeText: badgeText === 'None' ? undefined : badgeText,
      shelfLifeMonths: Number(shelfLifeMonths),
      expiryDate,
      batchNumber,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `✏️ Edit Product: ${name || sku}` : '➕ Add New Wholesale Product SKU'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '12px 0' }}>
        {error && <Alert type="error">{error}</Alert>}

        {/* Section 1: Basic Product Identity */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            1. Product Identification
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                SKU Code *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="CND-CHOC-01"
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Choco Dream Truffle Bites (24x50g)"
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Brand / Manufacturer *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Candi Delights"
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF' }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name} disabled={!c.isActive}>
                    {c.icon} {c.name} {!c.isActive ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Packaging Hierarchy & Inventory Units */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            2. Packaging Hierarchy & Base Unit
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Base Inventory Unit
              </label>
              <select
                value={baseUnit}
                onChange={(e) => setBaseUnit(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF' }}
              >
                {BASE_UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Conversion Breakdown Summary
              </label>
              <input
                type="text"
                value={conversionSummary}
                onChange={(e) => setConversionSummary(e.target.value)}
                placeholder="e.g. 1 Carton = 10 Display Boxes = 120 Packs"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Wholesale Pricing & Stock */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            3. Wholesale Pricing & Inventory Stock
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Retailer Price (PKR) *
              </label>
              <input
                type="number"
                value={retailerPrice}
                onChange={(e) => setRetailerPrice(Number(e.target.value))}
                min="1"
                required
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Sub-Wholesale (PKR) *
              </label>
              <input
                type="number"
                value={subWholesalerPrice}
                onChange={(e) => setSubWholesalerPrice(Number(e.target.value))}
                min="1"
                required
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Available Stock ({baseUnit}s) *
              </label>
              <input
                type="number"
                value={availableStock}
                onChange={(e) => setAvailableStock(Number(e.target.value))}
                min="0"
                required
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 800 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Reserved Stock
              </label>
              <input
                type="number"
                value={reservedStock}
                onChange={(e) => setReservedStock(Number(e.target.value))}
                min="0"
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Product Image (Upload & URL) & Promotion Badge */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            4. Product Image & Visual Display
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
            {/* Live Image Preview (matches catalog card 3:2 / 16:9 texture) */}
            <div
              style={{
                width: '120px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#0F172A',
                border: '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Product preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              ) : (
                <span style={{ fontSize: '28px' }}>🍫</span>
              )}
              {badgeText !== 'None' && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontSize: '8px',
                    fontWeight: 800,
                    padding: '1px 4px',
                    borderRadius: '3px',
                  }}
                >
                  {badgeText}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Image URL or Upload File
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or paste image link"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '12px' }}
                  />
                  <label
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📁 Browse File
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                  Recommended Card Banner: <strong>600 × 400 px</strong> (3:2) or <strong>800 × 450 px</strong> (16:9). JPG / WebP under 150KB.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '2px', color: '#334155' }}>
                    Card Badge Tag
                  </label>
                  <select
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '12px', backgroundColor: '#FFFFFF' }}
                  >
                    {BADGE_PRESETS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '2px', color: '#334155' }}>
                    Status
                  </label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontSize: '12px', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="active">🟢 Active in Catalog</option>
                    <option value="inactive">🔴 Suspended / Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Save Product Changes' : 'Create & Publish SKU'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

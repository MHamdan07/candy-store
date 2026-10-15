import React, { useState, useMemo, useRef } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { useAuth } from '@candi/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';
import {
  WHOLESALE_PRODUCTS,
  WHOLESALE_CATEGORIES,
  getCategoryCounts,
  matchProductCategory,
} from '../data/wholesaleCatalogData';
import { WholesaleNavbar } from '../components/WholesaleNavbar';
import { WholesaleCatalogHero } from '../components/WholesaleCatalogHero';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { OrderConfirmationModal } from '../components/OrderConfirmationModal';
import { OrderTrackingDrawer } from '../components/OrderTrackingDrawer';
import { WholesaleInvoiceModal } from '../components/WholesaleInvoiceModal';
import { CustomerOrdersTab } from '../components/CustomerOrdersTab';
import { CustomerKhataTab } from '../components/CustomerKhataTab';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useLanguage } from '../context/LanguageContext';

export interface CustomerPortalPageProps {
  defaultTab?: 'catalog' | 'orders' | 'khata' | 'addresses';
}

interface SavedAddressItem {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  area: string;
  city: string;
  coordinates: string;
  isPrimary: boolean;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ defaultTab = 'catalog' }) => {
  const { profile, customerAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    products,
    isLoadingProducts,
    setSelectedDetailProduct,
    selectedDetailProduct,
    cartItemCount,
    totalCartons,
    setIsCartOpen,
  } = useWholesaleOrder();

  // Navigation tab state
  const initialTab = useMemo(() => {
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/khata')) return 'khata';
    if (location.pathname.includes('/account')) return 'addresses';
    return defaultTab;
  }, [location.pathname, defaultTab]);

  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'khata' | 'addresses'>(initialTab);
  const { language: lang, setLanguage, toggleLanguage, t, isRTL } = useLanguage();

  // Catalog search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [highMarginOnly, setHighMarginOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'margin_desc' | 'price_asc' | 'price_desc'>('featured');

  // Delivery Addresses State
  const [addresses, setAddresses] = useState<SavedAddressItem[]>([
    {
      id: 'addr-1',
      label: 'Main Shop Counter',
      recipientName: profile?.fullName || 'Muhammad Bilal Khan',
      phone: profile?.phone || '+92 300 1111111',
      addressLine: 'Shop 4, Block H, Main Commercial Road',
      area: 'North Nazimabad',
      city: 'Karachi',
      coordinates: '24.9372° N, 67.0423° E',
      isPrimary: true,
    },
    {
      id: 'addr-2',
      label: 'Secondary Warehouse',
      recipientName: 'Aslam (Store Incharge)',
      phone: '+92 301 9876543',
      addressLine: 'Plot 18, Street 4, Sector 7D',
      area: 'Buffer Zone',
      city: 'Karachi',
      coordinates: '24.9510° N, 67.0620° E',
      isPrimary: false,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newArea, setNewArea] = useState('Gulshan-e-Iqbal');
  const [notice, setNotice] = useState<string | null>(null);

  const status = customerAccount?.status || 'approved';
  const catalogGridRef = useRef<HTMLDivElement>(null);

  // Extract unique brands for filter
  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand)));
  }, [products]);

  // Dynamically compute category counts from active products
  const categoryCounts = useMemo(() => {
    return getCategoryCounts(products);
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter (case-insensitive & slug/id normalized)
      if (selectedCategory !== 'all' && !matchProductCategory(product.category, selectedCategory)) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }
      // High margin filter
      if (highMarginOnly && product.marginPercentage < 25) {
        return false;
      }
      // Stock status filter
      if (inStockOnly && product.stockStatus !== 'in_stock') {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        return matchesName || matchesBrand || matchesSku || matchesCategory;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'margin_desc') return b.marginPercentage - a.marginPercentage;
      if (sortBy === 'price_asc') return a.standardWholesalePrice - b.standardWholesalePrice;
      if (sortBy === 'price_desc') return b.standardWholesalePrice - a.standardWholesalePrice;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedBrand, highMarginOnly, inStockOnly, searchQuery, sortBy]);

  // Active category metadata for active filter banner
  const activeCategoryInfo = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return (
      WHOLESALE_CATEGORIES.find(
        (c) =>
          c.id.toLowerCase() === selectedCategory.toLowerCase() ||
          c.name.toLowerCase() === selectedCategory.toLowerCase()
      ) || {
        id: selectedCategory,
        name: selectedCategory,
        icon: '🍬',
        count: filteredProducts.length,
      }
    );
  }, [selectedCategory, filteredProducts.length]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catalogGridRef.current) {
      const rect = catalogGridRef.current.getBoundingClientRect();
      if (rect.top < 80 || rect.top > window.innerHeight * 0.7) {
        catalogGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Profile completion calculation
  const completionPercentage = useMemo(() => {
    let score = 25;
    if (customerAccount?.businessName) score += 25;
    if (profile?.phone) score += 25;
    if (addresses.length > 0) score += 25;
    return score;
  }, [customerAccount, profile, addresses]);

  const handleSetPrimary = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isPrimary: a.id === id,
      }))
    );
    setNotice('Primary delivery address updated successfully.');
  };

  const handleDeactivate = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setNotice('Address removed from active delivery locations.');
  };

  const handleAddAddress = () => {
    if (!newLabel || !newAddress) return;
    const item: SavedAddressItem = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      recipientName: profile?.fullName || 'Shop Incharge',
      phone: profile?.phone || '+92 300 1111111',
      addressLine: newAddress,
      area: newArea,
      city: 'Karachi',
      coordinates: '24.9200° N, 67.0800° E (Map Pin)',
      isPrimary: false,
    };
    setAddresses([...addresses, item]);
    setIsAddModalOpen(false);
    setNewLabel('');
    setNewAddress('');
    setNotice(`New address "${item.label}" saved!`);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: isRTL ? "'Noto Nastaliq Urdu', 'Segoe UI', Tahoma, sans-serif" : 'var(--font-family-base)',
      }}
    >
      {/* Wholesale Main Navbar */}
      <WholesaleNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'catalog') navigate('/home');
          else if (tab === 'orders') navigate('/orders');
          else if (tab === 'khata') navigate('/khata');
          else if (tab === 'addresses') navigate('/account');
        }}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* Main Content Area */}
      <main
        className="customer-main-content"
        style={{ maxWidth: '1240px', width: '100%', margin: '24px auto', padding: '0 20px', flex: 1, boxSizing: 'border-box' }}
      >
        {notice && (
          <div style={{ marginBottom: '16px' }}>
            <Alert type="success">{notice}</Alert>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: WHOLESALE ORDERING CATALOG */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'catalog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WholesaleCatalogHero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              highMarginOnly={highMarginOnly}
              onToggleHighMargin={() => setHighMarginOnly(!highMarginOnly)}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly(!inStockOnly)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              brands={brands}
              categoryCounts={categoryCounts}
            />

            {/* Results Header Count & Active Filter Area */}
            <div ref={catalogGridRef} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Active Category Header Banner (1-Click Clear Filter) */}
              {activeCategoryInfo && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 'var(--radius-md, 10px)',
                    padding: '12px 18px',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px', lineHeight: 1 }}>{activeCategoryInfo.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        Showing {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} in {activeCategoryInfo.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                        Filtered confectionery inventory • Factory-gate bulk pricing
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E11D48';
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E11D48';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.color = '#0F172A';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>✕</span>
                    <span>Clear filter</span>
                  </button>
                </div>
              )}

              {/* General Results Header Count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                  Showing {filteredProducts.length} Wholesale SKUs
                  {selectedCategory !== 'all' && ` in ${activeCategoryInfo ? activeCategoryInfo.name : selectedCategory}`}
                  {selectedBrand !== 'all' && ` from ${selectedBrand}`}
                </div>

                {cartItemCount > 0 && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    type="button"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--color-primary, #E11D48)',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    View Basket ({cartItemCount} items, {totalCartons} units) →
                  </button>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <Card padding="lg">
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted, #64748B)' }}>
                  <div style={{ fontSize: '42px', marginBottom: '12px' }}>🔍</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '6px' }}>
                    No confectionery products matched your filters
                  </div>
                  <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                    Try clearing your search keyword or switching category pills.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedBrand('all');
                      setHighMarginOnly(false);
                      setInStockOnly(false);
                    }}
                  >
                    Reset All Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="catalog-products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setSelectedDetailProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: MY ORDERS & DISPATCH TRACKING */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'orders' && <CustomerOrdersTab />}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: WHOLESALE CREDIT KHATA */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'khata' && <CustomerKhataTab />}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: SHOP ADDRESSES & PROFILE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'addresses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status Banner */}
            {status === 'pending_review' && (
              <Alert type="warning" title="Your Account is Under Review">
                Your wholesale business application has been submitted to Candi Super Store. You can manage profile details and delivery addresses while our team verifies your business.
              </Alert>
            )}

            {/* Profile Card & Meter */}
            <Card padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                    {customerAccount?.businessName || 'Bilal General Store'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px' }}>
                    Contact: {profile?.fullName || 'Muhammad Bilal Khan'} • {profile?.phone || '+92 300 1111111'}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <Badge
                      status={customerAccount?.customerType || 'retailer'}
                      label={(customerAccount?.customerType || 'retailer').toUpperCase()}
                    />
                  </div>
                </div>

                {/* Profile Completion Meter */}
                <div
                  style={{
                    width: '200px',
                    padding: '12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E2E8F0)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                    <span style={{ color: 'var(--color-text-main, #0F172A)' }}>Profile Completion:</span>
                    <span style={{ color: 'var(--color-primary, #E11D48)' }}>{completionPercentage}%</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: 'var(--color-border, #E2E8F0)',
                      borderRadius: '3px',
                      marginTop: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${completionPercentage}%`,
                        backgroundColor: 'var(--color-primary, #E11D48)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Saved Delivery Addresses */}
            <Card padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', margin: 0 }}>
                    Saved Delivery Addresses ({addresses.length})
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', margin: '4px 0 0 0' }}>
                    Karachi warehouse vans deliver wholesale confectionery orders to your verified primary address.
                  </p>
                </div>

                <Button size="sm" variant="primary" onClick={() => setIsAddModalOpen(true)}>
                  + Add New Address
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: `1.5px solid ${addr.isPrimary ? 'var(--color-primary, #E11D48)' : 'var(--color-border, #E2E8F0)'}`,
                      backgroundColor: addr.isPrimary ? '#FFF1F2' : '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-text-main, #0F172A)' }}>
                          {addr.label}
                        </span>
                        {addr.isPrimary && <Badge status="approved" label="PRIMARY" />}
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--color-text-main, #0F172A)', marginTop: '4px' }}>
                        {addr.addressLine}, {addr.area}, {addr.city}
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                        Recipient: {addr.recipientName} ({addr.phone}) • Pin: {addr.coordinates}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!addr.isPrimary && (
                        <Button size="sm" variant="outline" onClick={() => handleSetPrimary(addr.id)}>
                          Set as Primary
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDeactivate(addr.id)}>
                        Deactivate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Global Interactive Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <OrderTrackingDrawer />
      <WholesaleInvoiceModal />
      <ProductDetailModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
      />

      {/* Add Address Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Saved Karachi Delivery Address"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddAddress} disabled={!newLabel || !newAddress}>
                Save Address
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Address Label"
              placeholder="e.g. Branch 2 Counter, Jodia Bazaar Godown"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <Input
              label="Street Address"
              placeholder="Shop or warehouse number, street name"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <Input
              label="Area / Locality"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* Mobile Bottom Navigation (Only visible on screens < 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'catalog') navigate('/home');
          else if (tab === 'orders') navigate('/orders');
          else if (tab === 'khata') navigate('/khata');
          else if (tab === 'addresses') navigate('/account');
        }}
      />
    </div>
  );
};

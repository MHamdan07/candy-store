import React, { createContext, useContext, useState, useEffect } from 'react';
import { PackagingUnitType } from '@candi/types';
import {
  WholesaleProductItem,
  WholesaleOrderRecord,
  WHOLESALE_PRODUCTS,
  INITIAL_MOCK_ORDERS,
} from '../data/wholesaleCatalogData';
import { useAuth } from '@candi/auth';
import { fetchLiveProducts, submitCustomerOrder } from '../services/supabaseData';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  unit: PackagingUnitType;
  quantity: number;
  unitPrice: number;
  retailPricePerPiece: number;
  piecesPerUnit: number;
  minOrderQuantity: number;
  accentColor: string;
}

export interface WholesaleOrderContextType {
  // Live / Fallback Product Catalog
  products: WholesaleProductItem[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;

  cartItems: CartItem[];
  addToCart: (product: WholesaleProductItem, unit?: PackagingUnitType, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  reorder: (order: WholesaleOrderRecord) => void;

  // Cart calculations
  cartItemCount: number;
  totalCartons: number;
  subtotal: number;
  bulkDiscount: number;
  isFreeDelivery: boolean;
  freeDeliveryShortfall: number;
  taxFilerAdvance: number;
  deliveryFee: number;
  grandTotal: number;

  // Orders & tracking
  orders: WholesaleOrderRecord[];
  activeTrackingOrder: WholesaleOrderRecord | null;
  setActiveTrackingOrder: (order: WholesaleOrderRecord | null) => void;
  placeOrder: (orderParams: {
    deliverySlot: string;
    deliveryAddress: WholesaleOrderRecord['deliveryAddress'];
    paymentMethod: WholesaleOrderRecord['paymentMethod'];
    riderNote?: string;
  }) => WholesaleOrderRecord;

  // Retailer Credit (Khata)
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;

  // Modals & Drawer State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  selectedDetailProduct: WholesaleProductItem | null;
  setSelectedDetailProduct: (prod: WholesaleProductItem | null) => void;
  invoiceModalOrder: WholesaleOrderRecord | null;
  setInvoiceModalOrder: (order: WholesaleOrderRecord | null) => void;
  confirmationModalOrder: WholesaleOrderRecord | null;
  setConfirmationModalOrder: (order: WholesaleOrderRecord | null) => void;
}

const WholesaleOrderContext = createContext<WholesaleOrderContextType | null>(null);

const STORAGE_KEY_CART = 'candi_wholesale_cart_v1';
const STORAGE_KEY_ORDERS = 'candi_wholesale_orders_v1';
const STORAGE_KEY_CREDIT = 'candi_wholesale_credit_v1';

export const WholesaleOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, customerAccount } = useAuth();

  // Products State (Loaded from Supabase with instant fallback to local mock catalog)
  const [products, setProducts] = useState<WholesaleProductItem[]>(WHOLESALE_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  const refreshProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const liveItems = await fetchLiveProducts();
      if (liveItems && liveItems.length > 0) {
        setProducts(liveItems);
      }
    } catch (err) {
      console.warn('Error refreshing live products from Supabase, keeping current catalog:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders State
  const [orders, setOrders] = useState<WholesaleOrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_MOCK_ORDERS;
    } catch {
      return INITIAL_MOCK_ORDERS;
    }
  });

  // Credit Balance State
  const [creditBalance, setCreditBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CREDIT);
      return saved ? Number(saved) : 24500;
    } catch {
      return 24500;
    }
  });

  const creditLimit = 100000; // PKR 100,000 approved credit line
  const availableCredit = Math.max(0, creditLimit - creditBalance);

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<WholesaleProductItem | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<WholesaleOrderRecord | null>(null);
  const [confirmationModalOrder, setConfirmationModalOrder] = useState<WholesaleOrderRecord | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<WholesaleOrderRecord | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Sync credit to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CREDIT, String(creditBalance));
    } catch {
      // ignore
    }
  }, [creditBalance]);

  // Add to cart helper respecting retailer pricing
  const addToCart = (product: WholesaleProductItem, unit?: PackagingUnitType, quantity = 1) => {
    const selectedUnit = unit || product.baseUnit;
    const addQty = quantity && quantity > 0 ? quantity : 1;

    // Calculate unit price: check customer account tier if applicable
    let unitPrice = product.standardWholesalePrice;
    if (customerAccount?.customerType === 'sub_wholesaler') {
      unitPrice = product.tierPrices.tier_1_platinum;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          unit: selectedUnit,
          quantity: addQty,
          unitPrice,
          retailPricePerPiece: product.retailPricePerPiece,
          piecesPerUnit: product.piecesPerUnit,
          minOrderQuantity: product.minOrderQuantity,
          accentColor: product.accentColor,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const reorder = (order: WholesaleOrderRecord) => {
    order.items.forEach((line) => {
      const prod = products.find((p) => p.id === line.productId || p.sku === line.sku);
      if (prod) {
        addToCart(prod, line.unit, line.quantity);
      }
    });
    setIsCartOpen(true);
  };

  // Calculations
  const cartItemCount = cartItems.length;
  const totalCartons = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Disconnected promotional features removed
  const bulkDiscount = 0;
  const isFreeDelivery = true;
  const freeDeliveryShortfall = 0;
  const deliveryFee = 0;

  // Pakistan Tax Filer 0.5% advance withholding tax on wholesale confectionery
  const taxFilerAdvance = Math.round(subtotal * 0.005 * 100) / 100;

  const grandTotal = Math.round((subtotal + taxFilerAdvance) * 100) / 100;

  // Place Order
  const placeOrder = (params: {
    deliverySlot: string;
    deliveryAddress: WholesaleOrderRecord['deliveryAddress'];
    paymentMethod: WholesaleOrderRecord['paymentMethod'];
    riderNote?: string;
  }): WholesaleOrderRecord => {
    const today = new Date();
    const dateFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    const timeFormatted = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-KHI-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(
      today.getDate()
    ).padStart(2, '0')}-${randNum}`;

    const newOrder: WholesaleOrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber,
      orderDate: `${dateFormatted} ${timeFormatted}`,
      deliveryDate: 'Tomorrow Morning',
      deliverySlot: params.deliverySlot,
      deliveryAddress: params.deliveryAddress,
      items: cartItems.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
        piecesCount: item.piecesPerUnit * item.quantity,
      })),
      totalCartons,
      subtotal,
      bulkDiscount,
      taxAmount: taxFilerAdvance,
      deliveryFee,
      grandTotal,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'credit_khata' ? 'on_credit' : 'pending',
      orderStatus: 'confirmed',
      driverName: 'Assigned upon van dispatch (Karachi Hub)',
      riderNote: params.riderNote || 'Standard counter drop-off',
    };

    // If placed on credit, update credit balance
    if (params.paymentMethod === 'credit_khata') {
      setCreditBalance((prev) => prev + grandTotal);
    }

    // Submit to Supabase asynchronously with fallback
    submitCustomerOrder(newOrder, {
      customerAccountId: customerAccount?.id,
      deliveryZoneId: customerAccount?.assignedDeliveryZoneId,
    }).catch((err) => {
      console.warn('[Supabase] Background order sync note:', err);
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setConfirmationModalOrder(newOrder);
    return newOrder;
  };

  return (
    <WholesaleOrderContext.Provider
      value={{
        products,
        isLoadingProducts,
        refreshProducts,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        reorder,
        cartItemCount,
        totalCartons,
        subtotal,
        bulkDiscount,
        isFreeDelivery,
        freeDeliveryShortfall,
        taxFilerAdvance,
        deliveryFee,
        grandTotal,
        orders,
        activeTrackingOrder,
        setActiveTrackingOrder,
        placeOrder,
        creditLimit,
        currentBalance: creditBalance,
        availableCredit,
        isCartOpen,
        setIsCartOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        selectedDetailProduct,
        setSelectedDetailProduct,
        invoiceModalOrder,
        setInvoiceModalOrder,
        confirmationModalOrder,
        setConfirmationModalOrder,
      }}
    >
      {children}
    </WholesaleOrderContext.Provider>
  );
};

export const useWholesaleOrder = (): WholesaleOrderContextType => {
  const context = useContext(WholesaleOrderContext);
  if (!context) {
    throw new Error('useWholesaleOrder must be used within WholesaleOrderProvider');
  }
  return context;
};

// Core Account Statuses
export type AccountStatus =
  | 'pending_review'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'suspended'
  | 'archived';

// Customer Types
export type CustomerType = 'retailer' | 'sub_wholesaler';

// Profile
export interface Profile {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  preferredLanguage: 'en' | 'ur';
  contactPreferences?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Delivery Zone
export interface DeliveryZone {
  id: string;
  name: string;
  city: string;
  description?: string;
  isActive: boolean;
  serviceable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Customer Account
export interface CustomerAccount {
  id: string;
  profileId: string;
  customerType: CustomerType;
  businessName: string;
  businessCategory?: string;
  whatsappNumber?: string;
  status: AccountStatus;
  assignedDeliveryZoneId?: string;
  internalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  changeRequestMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// PHASE 3A: CUSTOMER MANAGEMENT SYSTEM
// ----------------------------------------------------

export type CustomerWorkflowStatus =
  | 'new_customer'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'on_credit_hold'
  | 'inactive';

export type CustomerTier = 'tier_1_platinum' | 'tier_2_gold' | 'tier_3_silver' | 'standard_retail';

export type CustomerCategory = 'Retailer' | 'Sub-Wholesaler' | 'Supermarket / Key Account';

export interface CustomerDeliveryAddress {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  area: string;
  city: string;
  isPrimary: boolean;
  gpsCoordinates?: string;
}

export interface CustomerRecord {
  id: string;
  code: string; // unique customer code e.g. "CUST-KHI-001"
  name: string; // business/shop name
  contactPerson: string;
  phone: string;
  email?: string;
  cnicOrNtn?: string;
  category: CustomerCategory;
  tier: CustomerTier;
  tierLabel: string;
  priceListName: string;
  paymentTerms: string;
  creditLimit: number; // in PKR
  currentBalance: number; // outstanding khata balance in PKR
  status: CustomerWorkflowStatus;
  assignedSalesperson: string;
  assignedDeliveryRoute: string;
  billingAddress: string;
  deliveryAddresses: CustomerDeliveryAddress[];
  orderHistory?: {
    id: string;
    orderNumber: string;
    orderDate: string;
    itemsCount: number;
    totalAmount: number;
    status: string;
  }[];
  invoiceHistory?: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
    paidAmount: number;
    status: string;
  }[];
  paymentHistory?: {
    id: string;
    receiptNumber: string;
    paymentDate: string;
    amount: number;
    mode: string;
    refNumber: string;
  }[];
  returnsHistory?: {
    id: string;
    returnNumber: string;
    returnDate: string;
    reason: string;
    amount: number;
    status: string;
  }[];
  notes?: string[];
  attachments?: {
    name: string;
    type: string;
    uploadDate: string;
  }[];
  auditHistory: {
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Customer Address
export interface CustomerAddress {
  id: string;
  customerAccountId: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  area: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationSource?: 'gps' | 'map_pin' | 'manual' | null;
  locationCapturedAt?: string | null;
  deliveryInstructions?: string;
  isPrimary: boolean;
  isActive: boolean;
  validationStatus: 'unverified' | 'verified' | 'needs_review';
  validatedBy?: string | null;
  validatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Packaging Units
export type PackagingUnitType = 'carton' | 'box' | 'packet' | 'piece';

export interface PackagingUnit {
  id: string;
  name: string;
  unitType: PackagingUnitType;
  description?: string;
}

export interface UnitConversion {
  id: string;
  productId: string;
  parentUnit: PackagingUnitType;
  childUnit: PackagingUnitType;
  multiplier: number; // e.g. 1 carton = 12 boxes, 1 box = 24 packets
}

// Product
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  imageUrl?: string;
  baseUnit: PackagingUnitType;
  basePrice: number; // PKR
  retailerPrice: number;
  subWholesalerPrice: number;
  unitsAvailable: number; // in base units
  reservedUnits: number;
  conversionSummary: string; // e.g. "1 Carton = 10 Boxes = 100 Packets"
  isActive: boolean;
}

// Order-to-Cash Operational Lifecycle
export type OrderStatus =
  | 'draft'
  | 'pending_confirmation'
  | 'confirmed'
  | 'approved_for_picking'
  | 'picked'
  | 'dispatched'
  | 'delivered'
  | 'reconciled'
  | 'cancelled'
  | 'confirmation_timeout'
  | 'credit_hold'
  | 'partially_delivered'
  | 'returned'
  | 'cash_variance';

export interface OrderLine {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: PackagingUnitType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  deliveredQuantity?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerAccountId: string;
  customerName: string;
  businessName: string;
  customerType: CustomerType;
  deliveryZoneId: string;
  deliveryZoneName: string;
  deliveryAddress: CustomerAddress;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cash_on_delivery' | 'credit' | 'partial_advance';
  whatsappConfirmationSentAt?: string;
  confirmedAt?: string;
  pickedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  reconciledAt?: string;
  createdAt: string;
}

// Invoicing & Challan
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerAccountId: string;
  customerName: string;
  businessName: string;
  grossAmount: number;
  discount: number;
  tax: number;
  netAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'issued' | 'paid' | 'partial' | 'cancelled';
  challanNumber: string;
  issuedAt: string;
}

// Customer Khata (Ledger)
export interface LedgerEntry {
  id: string;
  customerAccountId: string;
  date: string;
  referenceType: 'invoice' | 'payment' | 'return' | 'adjustment';
  referenceId: string;
  description: string;
  debit: number; // increases receivable (invoice)
  credit: number; // decreases receivable (payment, return)
  balance: number;
  createdAt: string;
}

// Staff & RBAC
export type StaffRoleName =
  | 'super_admin'
  | 'admin_manager'
  | 'sales_agent'
  | 'warehouse_manager'
  | 'warehouse_staff'
  | 'delivery_manager'
  | 'accounts_staff'
  | 'rider';

export interface StaffAccount {
  id: string;
  profileId: string;
  role: StaffRoleName;
  isActive: boolean;
  assignedBy?: string;
  assignedAt: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  actorProfileId?: string;
  actorName?: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ----------------------------------------------------
// PROCUREMENT MODULE CONTRACTS
// ----------------------------------------------------

export type PurchaseRequestStatus = 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected';

export interface PurchaseRequestItem {
  id: string;
  sku: string;
  productName: string;
  unit: PackagingUnitType;
  quantity: number;
  estimatedUnitPrice: number;
  totalEstimatedCost: number;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string; // e.g. "PR-2026-001"
  requesterName: string;
  requesterRole: string;
  requiredDate: string;
  reason: string;
  items: PurchaseRequestItem[];
  estimatedTotalCost: number;
  status: PurchaseRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'sent_to_supplier'
  | 'partially_received'
  | 'fully_received'
  | 'closed'
  | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  sku: string;
  productName: string;
  unit: PackagingUnitType;
  orderedQuantity: number;
  purchasePrice: number;
  subtotal: number;
  receivedQuantity: number;
  outstandingQuantity: number;
}

export type SupplierStatus =
  | 'new_supplier'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'on_hold'
  | 'inactive';

export interface SupplierPriceHistory {
  id: string;
  sku: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  effectiveDate: string;
  approvedBy: string;
}

export interface GoodsReceiptItem {
  id: string;
  sku: string;
  productName: string;
  unit: PackagingUnitType;
  orderedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  rejectedQuantity: number;
  acceptedQuantity: number; // calculated: received - damaged - rejected
  batchNumber?: string;
  expiryDate?: string;
  rejectionReason?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string; // e.g. "GRN-2026-089"
  poNumber: string;
  poId: string;
  supplierId: string;
  supplierName: string;
  receivingDate: string;
  warehouse: string; // e.g. "Korangi Central Depot - Dock A"
  deliveryNoteNumber: string; // Bilty / Challan #
  receiverName: string;
  items: GoodsReceiptItem[];
  totalAcceptedQty: number;
  totalDamagedQty: number;
  totalRejectedQty: number;
  stockUpdated: boolean;
  stockUpdatedAt?: string;
  status: 'draft' | 'goods_arrived' | 'quantity_checked' | 'stock_updated' | 'closed';
  notes?: string;
  createdAt: string;
}

export interface ThreeWayMatchDiscrepancy {
  field: 'product' | 'quantity' | 'purchase_price' | 'tax' | 'discount' | 'total_amount' | 'supplier' | 'duplicate_invoice';
  message: string;
  expectedValue: string | number;
  actualValue: string | number;
  severity: 'error' | 'warning';
}

export interface ThreeWayMatchResult {
  isMatch: boolean;
  status: 'matched' | 'mismatched';
  discrepancies: ThreeWayMatchDiscrepancy[];
  poAgreedTotal: number;
  grnAcceptedValue: number;
  invoicedTotal: number;
  varianceAmount: number;
}

export interface SupplierInvoice {
  id: string;
  supplierInvoiceNumber: string; // e.g. "INV-NAT-9921"
  invoiceNumber?: string; // optional alias
  supplierId: string;
  supplierName: string;
  poNumber: string;
  poId?: string;
  grnNumber: string;
  grnId?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  amount?: number; // optional alias
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  status?: 'unpaid' | 'partially_paid' | 'paid' | 'disputed';
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  paidAmount: number;
  attachmentName?: string;
  attachmentSize?: string;
  matchResult: ThreeWayMatchResult;
  approvedBy?: string;
  approvedAt?: string;
  auditTrail: {
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceivedRecord {
  id: string;
  grnNumber: string;
  poNumber: string;
  deliveryDate: string;
  receivedBy: string;
  itemCount: number;
  notes: string;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string; // e.g. "PAY-2026-441"
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  method: 'bank_transfer' | 'cheque' | 'cash';
  referenceNo: string;
}

export interface SupplierLedgerInvoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'disputed';
}

export interface Supplier {
  id: string;
  code: string; // unique code e.g. "SUP-NAT-01"
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  category: string; // e.g. "Confectionery Manufacturer", "Packaging Supplier", "Flour & Bakery"
  paymentTerms: string; // e.g. "Net 15", "Net 30", "Cash on Delivery"
  creditLimit: number; // PKR
  deliveryLeadTime: string; // e.g. "3-5 Days"
  status: SupplierStatus;
  outstandingBalance: number; // PKR
  rating?: number;
  bankDetails?: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
  productsSupplied?: {
    sku: string;
    productName: string;
    unit: PackagingUnitType;
    currentSupplyPrice: number;
    lastPriceChangeDate: string;
  }[];
  priceHistory?: SupplierPriceHistory[];
  goodsReceived?: GoodsReceivedRecord[];
  invoices?: SupplierLedgerInvoice[];
  payments?: SupplierPayment[];
  notes?: string[];
  auditHistory?: {
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. "PO-2026-104"
  purchaseRequestId?: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  paymentTerms: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: PurchaseOrderStatus;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  notes?: string;
  auditTrail: {
    action: string;
    actor: string;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// REPLENISHMENT & STOCK PLANNING CONTRACTS
// ----------------------------------------------------

export type StockStatus =
  | 'healthy'
  | 'low_stock'
  | 'reorder_required'
  | 'overstock'
  | 'out_of_stock';

export interface StockPlanningItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  packagingUnit: PackagingUnitType;
  currentStock: number;
  reservedStock: number;
  availableStock: number; // currentStock - reservedStock
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  suggestedPurchaseQuantity: number; // max(0, maxStockLevel - availableStock - pendingPurchaseQuantity)
  supplierId?: string;
  supplierName?: string;
  supplierLeadTime?: string;
  hasActiveSupplier: boolean;
  supplierUnitCost: number;
  pendingPurchaseQuantity: number;
  expectedDeliveryDate?: string;
  stockStatus: StockStatus;
  isSlowMoving: boolean;
  thresholdAuditLog?: {
    timestamp: string;
    actor: string;
    change: string;
    reason: string;
  }[];
}

// ----------------------------------------------------
// PHASE 3B — SALES PRICING & CUSTOMER TIERS CONTRACTS
// ----------------------------------------------------

export interface CustomerTierDefinition {
  id: string;
  name: string;
  tierKey: CustomerTier;
  code: string;
  description: string;
  eligibilityRules: string[];
  minMonthlyVolumePKR: number;
  defaultDiscountPct: number;
  activeCustomersCount: number;
  paymentTermsLimitDays: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface PriceChangeAuditEntry {
  id: string;
  changedAt: string;
  changedBy: string;
  actorRole: string;
  field: string;
  oldValue: number | string;
  newValue: number | string;
  reason: string;
  approvalRef?: string;
}

export interface PriceListItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  packagingUnit: PackagingUnitType;
  standardPrice: number; // Wholesale catalog base price in PKR
  tierPrices: {
    tier_1_platinum: number;
    tier_2_gold: number;
    tier_3_silver: number;
    standard_retail: number;
  };
  minQuantity: number;
  effectiveDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
  approvedBy?: string;
  approvedAt?: string;
  isExpired?: boolean;
  priceChangeHistory: PriceChangeAuditEntry[];
}

export type TradeOfferBenefitType = 'discount_percentage' | 'bonus_quantity' | 'flat_rebate';

export interface TradeOffer {
  id: string;
  offerCode: string;
  name: string;
  description: string;
  eligibleTiers: ('all' | CustomerTier)[];
  eligibleCustomerIds: string[]; // empty array means all within eligible tiers
  eligibleProductIds: string[];
  requiredQuantity: number;
  benefitType: TradeOfferBenefitType;
  discountPercentage?: number;
  bonusQuantity?: number;
  bonusProductId?: string;
  bonusProductName?: string;
  flatRebatePKR?: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'expired';
  approvedBy?: string;
  approvedAt?: string;
  isActive: boolean;
  usageCount: number;
}

export interface CustomerSpecificPrice {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  sku: string;
  specialPrice: number;
  contractRef: string;
  reason: string;
  approvedBy: string;
  effectiveDate: string;
  expiryDate: string;
  status: 'active' | 'expired';
}

export interface PricingPriorityStep {
  step: number;
  levelName: 'Customer-Specific Price' | 'Customer-Tier Price' | 'Promotional Price / Trade Offer' | 'Standard Price';
  isEvaluated: boolean;
  isMatched: boolean;
  resolvedPrice?: number;
  details: string;
}

export interface OrderPricingCalculation {
  customerId: string;
  customerName: string;
  customerTier: CustomerTier;
  customerTierName: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  packagingUnit: PackagingUnitType;

  // Waterfall priority resolution
  appliedPriceSource: 'customer_specific' | 'customer_tier' | 'promotional_offer' | 'standard_price';
  appliedPriceSourceName: string;
  baseCatalogPrice: number;
  resolvedUnitPrice: number;

  // Trade offer benefit
  tradeOfferApplied?: TradeOffer;
  tradeOfferDescription?: string;
  tradeOfferBonusQty?: number;
  tradeOfferDiscountPct?: number;

  // Exceptional discount override
  manualDiscountPct: number;
  manualDiscountAmount: number;
  overrideReason?: string;
  requiresSupervisorApproval: boolean;
  supervisorApprovalStatus: 'none' | 'pending' | 'approved' | 'rejected';
  supervisorApprovedBy?: string;

  // Final pricing
  finalUnitPrice: number;
  lineSubtotal: number;
  totalDiscountAmount: number;
  netLineTotal: number;

  // Detailed step-by-step breakdown
  steps: PricingPriorityStep[];
}

// ----------------------------------------------------
// PHASE 3C — CUSTOMER STATEMENTS & COLLECTIONS CONTRACTS
// ----------------------------------------------------

export type CustomerLedgerEntryType =
  | 'opening_balance'
  | 'invoice'
  | 'payment'
  | 'credit_note'
  | 'return_credit'
  | 'write_off'
  | 'discount_adjustment';

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  entryType: CustomerLedgerEntryType;
  referenceNumber: string; // e.g. INV-2026-0045, RCP-2026-012, CN-2026-003
  description: string;
  debit: number;  // Increases customer receivable balance (e.g. invoice)
  credit: number; // Decreases customer balance (e.g. payment, credit note)
  runningBalance: number;
  status: 'posted' | 'pending_approval' | 'reconciled' | 'reversed';
  authorizedBy?: string;
  notes?: string;
}

export interface CustomerStatementSummary {
  customerId: string;
  customerCode: string;
  customerName: string;
  customerTier: CustomerTier;
  startDate: string;
  endDate: string;
  openingBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  totalCreditNotes: number;
  totalReturns: number;
  totalAdjustments: number;
  closingBalance: number;
  entries: CustomerLedgerEntry[];
}

export type AgingBucket = 'current' | '1_30' | '31_60' | '61_90' | 'over_90';

export interface InvoiceAgingItem {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  challanNumber: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  customerTier: CustomerTier;
  customerPhone: string;
  assignedSalesperson: string;
  assignedRoute: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string;     // YYYY-MM-DD
  originalAmount: number;
  paidAmount: number;
  balanceDue: number;
  daysOverdue: number;
  bucket: AgingBucket;
  isCreditHoldTriggered: boolean;
  status: 'issued' | 'partial' | 'overdue' | 'disputed';
}

export type CollectionContactMethod = 'whatsapp' | 'phone_call' | 'in_person_visit' | 'formal_letter' | 'email';

export type CollectionWorkflowStage =
  | 'invoice_issued'
  | 'payment_due'
  | 'reminder_sent'
  | 'follow_up_required'
  | 'promise_to_pay'
  | 'payment_received'
  | 'reconciled'
  | 'legal_escalation';

export interface CollectionFollowUpRecord {
  id: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  customerTier: CustomerTier;
  outstandingBalance: number;
  overdueAmount: number;
  oldestDueDate: string;
  contactDate: string;
  contactTimestamp: string;
  contactMethod: CollectionContactMethod;
  contactPerson: string;
  promiseToPayDate?: string;
  promisedAmount?: number;
  followUpOwner: string; // Credit Controller / Recovery Officer
  notes: string;
  nextAction: string;
  nextActionDate: string;
  stage: CollectionWorkflowStage;
  isCreditHoldActive: boolean;
}

export interface PaymentAllocationItem {
  invoiceId: string;
  invoiceNumber: string;
  invoiceBalanceDue: number;
  allocatedAmount: number;
}

export interface PaymentAllocationRecord {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  paymentDate: string;
  totalCollected: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'pay_order';
  chequeOrSlipNumber?: string;
  allocations: PaymentAllocationItem[];
  unappliedAmount: number; // Recorded as unapplied on-account credit
  collectedBy: string; // Driver or Cashier
  status: 'posted' | 'reconciled';
}

export interface LedgerAdjustmentRequest {
  id: string;
  customerId: string;
  customerName: string;
  type: 'credit_note' | 'write_off' | 'damage_rebate' | 'pricing_correction';
  amount: number;
  reason: string;
  requestedBy: string;
  authorizedBy?: string;
  approvalStatus: 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}

// ----------------------------------------------------
// PHASE 3D — ADVANCED REPORTING & MANAGEMENT DASHBOARD
// ----------------------------------------------------

export interface ReportFilterCriteria {
  dateRangePreset: 'today' | 'this_week' | 'this_month' | 'last_month' | 'year_to_date' | 'custom';
  startDate: string;
  endDate: string;
  customerId?: string;
  productId?: string;
  supplierId?: string;
  routeZone?: string;
  salespersonId?: string;
  customerTier?: string;
}

export interface ManagementDashboardMetrics {
  todaySalesPKR: number;
  todaySalesChangePct: number;
  todayOrdersCount: number;
  pendingConfirmationsCount: number;
  ordersAwaitingDispatchCount: number;
  completedDeliveriesCount: number;
  lowStockAlertsCount: number;
  openPurchaseOrdersCount: number;
  outstandingReceivablesPKR: number;
  overdueInvoicesPKR: number;
  cashCollectedTodayPKR: number;
  openExceptionsCount: number;
}

export interface SalesReportRow {
  dimensionId: string;
  dimensionLabel: string;
  ordersCount: number;
  quantityUnits: number;
  grossSalesPKR: number;
  discountsPKR: number;
  returnsPKR: number;
  netSalesPKR: number;
  sourceOrderIds: string[];
}

export interface InventoryReportRow {
  productId: string;
  sku: string;
  productName: string;
  category: string;
  packagingUnit: PackagingUnitType;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  unitCostPKR: number;
  stockValuationPKR: number;
  reorderPoint: number;
  status: StockStatus;
  monthlyMovementQty: number;
  daysOfInventory: number;
}

export interface PurchasingReportRow {
  supplierId: string;
  supplierName: string;
  category: string;
  totalPOsIssued: number;
  totalPurchaseCostPKR: number;
  receivedCostPKR: number;
  pendingDeliveryCostPKR: number;
  openPOCount: number;
  overdueDeliveriesCount: number;
  sourcePOIds: string[];
}

export interface PayablesReportRow {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  paymentTerms: string;
  totalInvoicedPKR: number;
  paidPKR: number;
  outstandingBalancePKR: number;
  dueWithin7DaysPKR: number;
  overduePayablesPKR: number;
  threeWayMatchCleared: boolean;
}

export interface CashReportRow {
  transactionId: string;
  timestamp: string;
  referenceType: 'order_cod' | 'credit_recovery' | 'supplier_advance' | 'cash_expense' | 'bank_deposit';
  referenceNumber: string;
  customerOrPayee: string;
  cashierOrDriver: string;
  inflowPKR: number;
  outflowPKR: number;
  drawerBalancePKR: number;
  isReconciled: boolean;
  variancePKR?: number;
}

export interface GrossMarginReportRow {
  periodLabel: string;
  grossRevenuePKR: number;
  discountsPKR: number;
  returnsPKR: number;
  netRevenuePKR: number;
  costOfGoodsSoldPKR: number;
  grossMarginPKR: number;
  grossMarginPct: number;
}

// ----------------------------------------------------
// PHASE 4A — FINANCE FOUNDATION CONTRACTS
// ----------------------------------------------------

export type AccountCategory = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface ChartOfAccount {
  code: string; // e.g. "1010", "1100", "2010"
  name: string;
  type: AccountCategory;
  parentCode?: string;
  currentBalancePKR: number;
  currency: 'PKR';
  isActive: boolean;
  description: string;
  isControlAccount?: boolean; // e.g. 1100 Trade Receivables, 2010 Trade Payables
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface JournalEntryAuditTrail {
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}

export interface JournalEntry {
  id: string;
  journalNumber: string; // e.g. "JV-2026-0089"
  date: string; // YYYY-MM-DD
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean; // totalDebit === totalCredit
  status: 'draft' | 'pending_approval' | 'posted' | 'reversed';
  preparedBy: string;
  approvedBy?: string;
  postedAt?: string;
  isReversal?: boolean;
  reversalRef?: string;
  auditTrail: JournalEntryAuditTrail[];
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  date: string; // YYYY-MM-DD
  entryType: 'supplier_invoice' | 'payment' | 'debit_note' | 'credit_note' | 'opening_balance';
  referenceNumber: string;
  description: string;
  debit: number;  // Decreases payable liability (e.g. payment to supplier, debit note)
  credit: number; // Increases payable liability (e.g. supplier invoice)
  runningBalance: number;
  dueDate?: string;
  status: 'posted' | 'pending_approval' | 'reconciled' | 'disputed';
  authorizedBy?: string;
}

export type PaymentPartyType = 'customer' | 'supplier';

export interface PaymentRegisterRecord {
  id: string;
  paymentNumber: string; // e.g. "PAY-2026-0041"
  partyType: PaymentPartyType;
  partyId: string;
  partyCode: string;
  partyName: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'pay_order';
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  invoiceReference: string;
  receiptOrTransactionRef: string;
  recordedBy: string;
  approvalStatus: 'pending_approval' | 'approved' | 'reconciled' | 'rejected';
  approvedBy?: string;
  notes?: string;
  reconciledInGL: boolean;
}

export interface GeneralLedgerReconciliationItem {
  controlAccountCode: string;
  controlAccountName: string;
  accountType: AccountCategory;
  glBalancePKR: number;
  subLedgerBalancePKR: number;
  variancePKR: number; // glBalance - subLedgerBalance (must be 0)
  isReconciled: boolean;
  subLedgerName: string;
  lastReconciledAt: string;
  reconciledBy: string;
}

// ----------------------------------------------------
// PHASE 4B — CASH MANAGEMENT & RECONCILIATION CONTRACTS
// ----------------------------------------------------

export type CashPaymentMethod = 'cash' | 'cheque' | 'pay_order' | 'bank_deposit_slip';
export type CashHandoverStatus = 'pending_handover' | 'handed_over' | 'reconciled';
export type HandoverConfirmationStatus = 'pending_confirmation' | 'confirmed' | 'discrepancy_flagged';
export type CashVarianceType = 'none' | 'shortage' | 'excess';
export type CashReconciliationApprovalStatus = 'draft' | 'pending_approval' | 'approved' | 'posted_to_ledger';

export interface CashCollectionRecord {
  id: string;
  receiptNumber: string; // e.g. "RCP-CSH-2026-0101"
  collectorId: string;
  collectorName: string; // e.g. "Asif Nawaz (Fleet Van #3)"
  customerId: string;
  customerCode: string;
  customerName: string;
  invoiceReference: string; // e.g. "INV-2026-0044"
  amountReceived: number;
  paymentMethod: CashPaymentMethod;
  collectionDate: string; // YYYY-MM-DD
  handoverStatus: CashHandoverStatus;
  handoverId?: string;
  notes?: string;
  createdAt: string;
}

export interface CashHandoverRecord {
  id: string;
  handoverNumber: string; // e.g. "HND-2026-0041"
  collectorId: string;
  collectorName: string;
  handoverDate: string; // YYYY-MM-DD
  expectedCash: number;
  actualCash: number;
  difference: number; // actualCash - expectedCash (negative = shortage, positive = excess)
  receiverId: string;
  receiverName: string; // e.g. "Tariq Mehmood (Vault Cashier)"
  collectionIds: string[];
  status: HandoverConfirmationStatus;
  collectorConfirmedAt?: string;
  receiverConfirmedAt?: string;
  discrepancyReason?: string;
  notes?: string;
  createdAt: string;
}

export interface CashDenominations {
  note5000: number;
  note1000: number;
  note500: number;
  note100: number;
  note50: number;
  note20: number;
  note10: number;
}

export interface CashReconciliationSession {
  id: string;
  sessionNumber: string; // e.g. "REC-CSH-2026-0918"
  date: string; // YYYY-MM-DD
  openingCash: number;
  cashCollected: number;
  refunds: number;
  deposits: number; // Cash sent to bank
  expectedClosingCash: number; // openingCash + cashCollected - refunds - deposits
  actualClosingCash: number; // sum of counted physical denominations
  denominations: CashDenominations;
  variance: number; // actualClosingCash - expectedClosingCash
  varianceType: CashVarianceType;
  explanation?: string;
  approvalStatus: CashReconciliationApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  postedJournalId?: string; // Link to General Ledger Journal Entry
  auditTrail: {
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
  createdAt: string;
}

// ----------------------------------------------------
// PHASE 4C — FINANCIAL REPORTS & PERIOD CLOSING CONTRACTS
// ----------------------------------------------------

export type PeriodStatus =
  | 'open'
  | 'review_in_progress'
  | 'reconciled'
  | 'adjustments_pending'
  | 'management_review'
  | 'closed'
  | 'locked';

export interface AccountingPeriod {
  id: string;
  periodCode: string; // e.g. "2026-09"
  periodName: string; // e.g. "September 2026"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: PeriodStatus;
  openingBalancesTotal: number;
  closingBalancesTotal: number;
  postedTransactionsCount: number;
  unreconciledCount: number;
  adjustmentsCount: number;
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  closedAt?: string;
  isLocked: boolean;
  auditTrail: {
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
  createdAt: string;
}

export type PeriodAdjustmentType =
  | 'accrual'
  | 'prepayment'
  | 'depreciation'
  | 'inventory_shrinkage'
  | 'tax_provision';

export interface PeriodClosingAdjustment {
  id: string;
  periodId: string;
  adjustmentNumber: string; // e.g. "ADJ-2026-09-01"
  type: PeriodAdjustmentType;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
  amount: number;
  description: string;
  approvalStatus: 'draft' | 'pending_approval' | 'approved';
  approvedBy?: string;
  createdAt: string;
}

export type FinancialReportType =
  | 'trial_balance'
  | 'general_ledger'
  | 'profit_loss'
  | 'balance_sheet'
  | 'ar_summary'
  | 'ap_summary'
  | 'customer_aging'
  | 'supplier_aging'
  | 'cash_summary'
  | 'bank_reconciliation'
  | 'sales_summary'
  | 'purchase_summary'
  | 'gross_margin'
  | 'tax_summary';

// ----------------------------------------------------
// PHASE 4D — FINANCIAL CONTROLS, APPROVALS & AUDIT CONTRACTS
// ----------------------------------------------------

export type FinancialTransactionType =
  | 'journal_entry'
  | 'credit_note'
  | 'debit_note'
  | 'write_off'
  | 'financial_adjustment'
  | 'payment_approval'
  | 'cash_variance'
  | 'supplier_payment'
  | 'customer_balance_adjustment';

export type FinancialApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'posted'
  | 'reversed';

export type FinancialApprovalTier =
  | 'tier_1_accountant'
  | 'tier_2_controller'
  | 'tier_3_director';

export interface FinancialApprovalRule {
  id: string;
  transactionType: FinancialTransactionType;
  name: string;
  minAmountPKR: number;
  maxAmountPKR: number;
  requiredRole: StaffRoleName;
  requiresDualSignoff: boolean;
  description: string;
}

export interface FinancialApprovalRequest {
  id: string;
  requestNumber: string; // e.g. "APR-2026-001"
  transactionType: FinancialTransactionType;
  referenceNumber: string; // e.g. "JV-2026-0045", "CN-2026-0012", "WO-2026-003"
  amountPKR: number;
  description: string;
  preparedBy: string;
  preparedByRole: StaffRoleName;
  preparedAt: string;
  requiredTier: FinancialApprovalTier;
  currentStatus: FinancialApprovalStatus;
  reviewedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  overrideReason?: string;
  relatedPeriodCode: string;
  isClosedPeriodRequest: boolean;
}

export type FinancialExceptionType =
  | 'unapproved_journal'
  | 'unreconciled_payment'
  | 'cash_variance'
  | 'unmatched_invoice'
  | 'unusual_adjustment'
  | 'pending_write_off'
  | 'open_reconciliation_issue'
  | 'closed_period_adjustment_request';

export interface FinancialExceptionItem {
  id: string;
  exceptionType: FinancialExceptionType;
  title: string;
  description: string;
  sourceReference: string;
  amountPKR: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'overridden';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  periodCode: string;
}

export interface FinancialRolePermission {
  role: StaffRoleName;
  roleTitle: string;
  canCreate: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canPost: boolean;
  canReverse: boolean;
  canReconcile: boolean;
  canClosePeriod: boolean;
  maxApprovalLimitPKR: number;
}

export interface FinancialAuditRecord {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: StaffRoleName;
  transactionType: FinancialTransactionType;
  referenceNumber: string;
  action: string;
  fieldChanged?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  approvalReference?: string;
  ipAddress?: string;
  hashSignature: string;
}

export interface FinancialReversalRequest {
  id: string;
  originalTransactionId: string;
  originalVoucherNumber: string;
  originalAmountPKR: number;
  reason: string;
  preparedBy: string;
  approvedBy: string;
  reversalVoucherNumber: string;
  reversalTimestamp: string;
}

// ----------------------------------------------------
// PHASE 5: USERS, HR & WORKFORCE MANAGEMENT CONTRACTS
// ----------------------------------------------------

export type DepartmentType =
  | 'sales'
  | 'warehouse'
  | 'procurement'
  | 'finance'
  | 'delivery'
  | 'operations'
  | 'administration';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'probation';

export type EmployeeWorkflowStatus =
  | 'new'
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'archived';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  id: string; // e.g. "EMP-1001"
  employeeCode: string; // e.g. "CS-01001"
  fullName: string;
  phone: string;
  email: string;
  cnic: string; // e.g. "42101-1234567-1"
  department: DepartmentType;
  jobTitle: string;
  employmentStatus: EmploymentType;
  workflowStatus: EmployeeWorkflowStatus;
  joiningDate: string; // YYYY-MM-DD
  assignedLocationId: string;
  assignedLocationName: string;
  managerId?: string;
  managerName?: string;
  emergencyContact: EmergencyContact;
  address: string;
  userAccountId?: string;
  role: StaffRoleName;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  suspendedReason?: string;
  inactiveReason?: string;
  updatedAt: string;
}

export type SystemModule =
  | 'dashboard'
  | 'sales'
  | 'customers'
  | 'inventory'
  | 'delivery'
  | 'finance';

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  approve: boolean;
  delete: boolean;
}

export interface RoleDefinition {
  id: string;
  roleName: StaffRoleName;
  displayName: string;
  description: string;
  isSystemRole: boolean;
  isSensitive: boolean;
  permissions: Record<SystemModule, ModulePermissions>;
  assignedEmployeeCount: number;
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface WorkShift {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes: number;
  workingDays: DayOfWeek[];
  location: string;
  assignedEmployeeIds: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'leave'
  | 'off_day';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  date: string;
  shiftId: string;
  shiftName: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours: number;
  lateArrivalMinutes: number;
  earlyDepartureMinutes: number;
  overtimeHours: number;
  overtimeApproved: boolean;
  overtimeApprovedBy?: string;
  status: AttendanceStatus;
  isManualEdit: boolean;
  editReason?: string;
  editedBy?: string;
  editedAt?: string;
  notes?: string;
}

export type LeaveType =
  | 'annual'
  | 'casual'
  | 'sick'
  | 'maternity'
  | 'unpaid'
  | 'emergency';

export type LeaveApprovalStatus =
  | 'submitted'
  | 'manager_review'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  supportingDocumentUrl?: string;
  status: LeaveApprovalStatus;
  approverId?: string;
  approverName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  attendanceUpdated: boolean;
  createdAt: string;
}

export interface EmployeeLeaveBalance {
  employeeId: string;
  year: number;
  annualTotal: number;
  annualUsed: number;
  casualTotal: number;
  casualUsed: number;
  sickTotal: number;
  sickUsed: number;
}

export type SalaryStructureType = 'monthly_salaried' | 'daily_wage' | 'hourly';

export interface AllowanceItem {
  id: string;
  type: 'house_rent' | 'conveyance' | 'medical' | 'food' | 'special_duty' | 'performance_bonus';
  title: string;
  amountPKR: number;
  isTaxable: boolean;
}

export interface DeductionItem {
  id: string;
  type: 'income_tax' | 'eobi' | 'provident_fund' | 'advance_loan' | 'late_fine' | 'unpaid_leave';
  title: string;
  amountPKR: number;
}

export interface EmployeeCompensation {
  id: string;
  employeeId: string;
  salaryStructure: SalaryStructureType;
  basicSalaryPKR: number;
  allowances: AllowanceItem[];
  standardDeductions: DeductionItem[];
  overtimeHourlyRatePKR: number;
  paymentMethod: 'bank_transfer' | 'cheque' | 'cash';
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  effectiveDate: string;
  payrollStatus: 'active' | 'on_hold' | 'suspended';
  updatedAt: string;
}

export type PayrollPeriodStatus =
  | 'draft'
  | 'calculating'
  | 'under_review'
  | 'approved'
  | 'posted'
  | 'disbursed'
  | 'closed';

export interface PayrollPeriod {
  id: string;
  periodCode: string;
  startDate: string;
  endDate: string;
  status: PayrollPeriodStatus;
  totalGrossPKR: number;
  totalDeductionsPKR: number;
  totalNetPayPKR: number;
  employeeCount: number;
  calculatedBy?: string;
  calculatedAt?: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  postedBy?: string;
  postedAt?: string;
}

export interface PayrollEntry {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  jobTitle: string;
  daysInPeriod: number;
  daysPresent: number;
  daysApprovedLeave: number;
  daysUnpaidLeave: number;
  lateDeductionsPKR: number;
  approvedOvertimeHours: number;
  overtimePayPKR: number;
  basicSalaryPKR: number;
  totalAllowancesPKR: number;
  grossPayPKR: number;
  taxDeductionPKR: number;
  eobiDeductionPKR: number;
  otherDeductionsPKR: number;
  totalDeductionsPKR: number;
  netPayPKR: number;
  approvalStatus: 'pending' | 'approved' | 'adjusted' | 'rejected';
  paymentStatus: 'unpaid' | 'processing' | 'paid';
  paymentReference?: string;
  paidAt?: string;
  isAdjusted: boolean;
  adjustmentNotes?: string;
}

export interface EmployeeDocument {
  id: string;
  title: string;
  docType: 'cnic_copy' | 'employment_contract' | 'academic_degree' | 'driving_license' | 'medical_fitness' | 'other';
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSizeBytes: number;
}

export type PerformanceReviewStatus =
  | 'created'
  | 'goals_submitted'
  | 'manager_review'
  | 'employee_feedback'
  | 'finalized'
  | 'follow_up';

export interface PerformanceGoal {
  id: string;
  description: string;
  metric: string;
  target: string;
  achieved?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface PerformanceReview {
  id: string;
  reviewPeriod: string;
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  managerId: string;
  managerName: string;
  goals: PerformanceGoal[];
  overallRating: number;
  managerComments: string;
  employeeComments?: string;
  reviewStatus: PerformanceReviewStatus;
  followUpActions?: string[];
  finalizedAt?: string;
  createdAt: string;
}

export interface TrainingRecord {
  id: string;
  programTitle: string;
  employeeId: string;
  employeeName: string;
  trainingDate: string;
  provider: string;
  completionStatus: 'scheduled' | 'in_progress' | 'completed' | 'expired';
  certificateNumber?: string;
  skillsAcquired: string[];
  expiryDate?: string;
  notes?: string;
}

export interface WorkforceAuditRecord {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action:
    | 'employee_created'
    | 'employee_approved'
    | 'status_changed'
    | 'role_reassigned'
    | 'permissions_modified'
    | 'attendance_edited'
    | 'overtime_approved'
    | 'leave_approved'
    | 'leave_rejected'
    | 'payroll_calculated'
    | 'payroll_approved'
    | 'payroll_adjusted'
    | 'performance_finalized';
  targetEntity: string;
  targetId: string;
  details: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  reason?: string;
  ipAddress?: string;
}

// ==========================================
// Domain 2: Conversational Verification & Tele-Sales
// ==========================================

export type VerificationStatus =
  | 'whatsapp_pending'
  | 'whatsapp_delivered'
  | 'whatsapp_read'
  | 'whatsapp_confirmed'
  | 'escalated_telesales'
  | 'voice_verified'
  | 'changes_requested'
  | 'unreachable'
  | 'released_for_picking'
  | 'picked'
  | 'cancelled';

export type VerificationStage = 1 | 2 | 3 | 4 | 5;

export type VerificationPriority = 'normal' | 'urgent' | 'sla_breached';

export type WhatsAppMessageDirection = 'outbound' | 'inbound';

export type WhatsAppMessageType =
  | 'template_order_summary'
  | 'interactive_buttons'
  | 'customer_reply'
  | 'reminder_ping';

export interface WhatsAppMessageLog {
  id: string;
  timestamp: string;
  direction: WhatsAppMessageDirection;
  messageType: WhatsAppMessageType;
  body: string;
  deliveryStatus: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  interactivePayload?: {
    buttonClicked?: 'confirm' | 'edit' | 'cancel';
    customerReplyText?: string;
  };
}

export type TeleSalesCallOutcome =
  | 'voice_confirmed'
  | 'quantity_adjusted'
  | 'customer_busy_callback'
  | 'price_dispute'
  | 'out_of_stock_swap'
  | 'wrong_number'
  | 'shop_closed_cancelled';

export interface TeleSalesCallLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  durationSeconds: number;
  outcome: TeleSalesCallOutcome;
  notes: string;
  callbackScheduledAt?: string;
}

export interface ConversationalVerificationLineItem {
  id: string;
  skuId: string;
  skuName: string;
  unit: 'carton' | 'box' | 'packet' | 'piece';
  quantity: number;
  originalQuantity?: number;
  unitPrice: number;
  subtotal: number;
  bonusQuantity?: number;
  tradeSchemeApplied?: string;
  binLocation?: string;
}

export interface PickingBinAllocation {
  skuId: string;
  skuName: string;
  binLocation: string;
  quantity: number;
  unit: 'carton' | 'box' | 'packet' | 'piece';
  batchCode?: string;
}

export interface PickingReleaseDetails {
  releasedAt: string;
  releasedBy: string;
  waveId: string;
  waveName: string;
  assignedPickerId: string;
  assignedPickerName: string;
  pickingPriority: 'standard' | 'express' | 'urgent';
  binLocations: PickingBinAllocation[];
  status: 'pending_release' | 'released_to_floor' | 'in_picking' | 'picked';
  manifestCode: string;
  warehouseNotes?: string;
}

export interface ConversationalVerificationRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  orderSource: 'customer_web' | 'customer_mobile' | 'order_booker' | 'phone_inbound';
  orderCreatedAt: string;
  customerAccountId: string;
  customerName: string;
  businessName: string;
  customerType: CustomerType;
  phoneNumber: string;
  whatsappNumber: string;
  deliveryZone: string;
  deliveryAddress: string;
  creditLimit: number;
  currentKhataBalance: number;
  totalAmount: number;
  paymentMethod: 'cash_on_delivery' | 'credit' | 'partial_advance';
  verificationStatus: VerificationStatus;
  currentStage: VerificationStage;
  priority: VerificationPriority;
  slaDeadline: string;
  isSlaBreached: boolean;
  assignedAgentId?: string;
  assignedAgentName?: string;
  lines: ConversationalVerificationLineItem[];
  whatsappMessages: WhatsAppMessageLog[];
  callLogs: TeleSalesCallLog[];
  creditCheckPassed?: boolean;
  creditAvailableAfterOrder?: number;
  pickingRelease?: PickingReleaseDetails;
  cancellationReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

// ==========================================
// Domain: Fleet Logistics & Vehicle Trip Manifests
// ==========================================

export type VehicleType =
  | 'mini_van'
  | 'light_commercial_truck'
  | 'heavy_box_truck'
  | 'cargo_loader_bike';

export type VehicleStatus =
  | 'active_service'
  | 'in_transit'
  | 'loading_dock'
  | 'under_maintenance'
  | 'standby_reserve';

export interface DeliveryVehicle {
  id: string;
  registrationNumber: string; // e.g. "KHI-8821"
  modelName: string; // e.g. "Suzuki Bolan High-Roof Van"
  vehicleType: VehicleType;
  payloadCapacityKg: number; // e.g. 750
  cartonCapacity: number; // volumetric capacity e.g. 60
  fuelType: 'petrol' | 'diesel' | 'cng' | 'electric';
  status: VehicleStatus;
  currentOdometerKm: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  fuelLevelPercent: number;
  trackerDeviceId?: string;
}

export type DriverStatus = 'available' | 'on_trip' | 'on_leave' | 'off_duty';

export interface DeliveryDriver {
  id: string;
  fullName: string;
  phoneNumber: string;
  cnicNumber: string;
  drivingLicenseNumber: string;
  assignedVehicleId?: string;
  assignedVehiclePlate?: string;
  status: DriverStatus;
  rating: number; // e.g. 4.9
  completedTripsCount: number;
  codCollectionAccuracyPercent: number;
  mobileAppVersion?: string;
}

export interface BeatRoute {
  id: string;
  code: string; // e.g. "BEAT-N1"
  name: string; // e.g. "Nazimabad & North Karachi Commercial Beat"
  zone: string; // e.g. "Zone 1 - Nazimabad"
  keyCommercialHubs: string[]; // e.g. ["Main Gol Market", "Liaquatabad", "Paposh Nagar"]
  avgDailyOrdersCount: number;
  estimatedTransitMinutes: number;
  distanceKm: number;
  preferredVehicleType: VehicleType;
  isActive: boolean;
}

export type TripManifestStatus =
  | 'draft_clustering'
  | 'staged_loading'
  | 'dispatched_in_transit'
  | 'completed_delivered'
  | 'reconciled_closed';

export type StopDeliveryStatus =
  | 'pending_dispatch'
  | 'in_transit'
  | 'arrived_at_shop'
  | 'delivered_collected'
  | 'partially_delivered'
  | 'refused_returned';

export interface TripDeliveryStop {
  id: string;
  stopSequence: number;
  orderId: string;
  orderNumber: string;
  invoiceNumber?: string;
  customerAccountId: string;
  customerName: string;
  businessName: string;
  phoneNumber: string;
  deliveryAddress: string;
  areaLandmark: string;
  totalCartons: number;
  totalBoxes: number;
  totalWeightKg: number;
  paymentMethod: 'cash_on_delivery' | 'credit' | 'partial_advance';
  expectedCodAmount: number;
  actualCashCollected?: number;
  status: StopDeliveryStatus;
  arrivedAt?: string;
  completedAt?: string;
  proofOfDelivery?: {
    receivedByName: string;
    signatureRecorded: boolean;
    stampVerified: boolean;
    geoCoordinates?: string;
    remarks?: string;
  };
  refusalReason?: string;
}

export interface TripManifest {
  id: string;
  manifestNumber: string; // e.g. "TRIP-2026-MNF-01"
  beatRouteId: string;
  beatRouteCode: string;
  beatRouteName: string;
  deliveryZone: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  status: TripManifestStatus;
  scheduledDepartureTime: string;
  actualDepartureTime?: string;
  estimatedReturnTime: string;
  actualReturnTime?: string;
  totalStops: number;
  completedStopsCount: number;
  totalCartonsCount: number;
  totalBoxesCount: number;
  totalWeightKg: number;
  payloadUtilizationPercent: number;
  expectedTotalCod: number;
  collectedTotalCod: number;
  cashVariance: number;
  departureMileageKm?: number;
  returnMileageKm?: number;
  dispatcherName: string;
  cashierReconciliationId?: string;
  notes?: string;
  stops: TripDeliveryStop[];
}

export interface FleetKpis {
  totalVehiclesCount: number;
  activeVehiclesOnRoad: number;
  vehiclesUnderMaintenance: number;
  totalTripsToday: number;
  inTransitTripsCount: number;
  completedTripsCount: number;
  overallOnTimeDeliveryRate: number;
  totalCodExpectedToday: number;
  totalCodCollectedToday: number;
  averagePayloadUtilizationPercent: number;
}


import { z } from 'zod';

export const orderLineSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  unit: z.enum(['carton', 'box', 'packet', 'piece']),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const createOrderSchema = z.object({
  customerAccountId: z.string().min(1, 'Customer account is required'),
  deliveryAddressId: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.enum(['cash_on_delivery', 'credit', 'partial_advance']),
  lines: z.array(orderLineSchema).min(1, 'At least one product line is required'),
  notes: z.string().optional(),
});

export const purchaseRequestItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  productName: z.string().min(1, 'Product name is required'),
  unit: z.enum(['carton', 'box', 'packet', 'piece']),
  quantity: z.number().positive('Quantity must be greater than zero'),
  estimatedUnitPrice: z.number().positive('Estimated unit price is required'),
});

export const createPurchaseRequestSchema = z.object({
  requiredDate: z.string().min(1, 'Required date is required'),
  reason: z.string().min(3, 'Reason for procurement is required'),
  items: z.array(purchaseRequestItemSchema).min(1, 'At least one item is required'),
});

export const purchaseOrderItemSchema = z.object({
  sku: z.string().min(1),
  productName: z.string().min(1),
  unit: z.enum(['carton', 'box', 'packet', 'piece']),
  orderedQuantity: z.number().positive('Ordered quantity must be positive'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  notes: z.string().optional(),
});

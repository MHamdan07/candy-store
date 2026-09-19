import { z } from 'zod';

export const customerTypeSchema = z.enum(['retailer', 'sub_wholesaler'], {
  errorMap: () => ({ message: 'Please select whether you are a Retailer or Sub-wholesaler' }),
});

export const businessInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  businessName: z.string().min(2, 'Shop or business name is required'),
  customerType: customerTypeSchema,
  whatsappNumber: z.string().optional(),
  businessCategory: z.string().optional(),
  city: z.string().min(2, 'City is required (e.g. Karachi)'),
  area: z.string().min(2, 'Area or locality is required (e.g. North Nazimabad)'),
  secondaryContact: z.string().optional(),
  estimatedMonthlyVolume: z.string().optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1, 'Address label is required (e.g. Main Shop, Warehouse)'),
  recipientName: z.string().min(2, 'Recipient contact name is required'),
  recipientPhone: z.string().min(10, 'Recipient phone number is required'),
  addressLine: z.string().min(5, 'Full street address is required'),
  area: z.string().min(2, 'Area is required'),
  city: z.string().min(2, 'City is required'),
  landmark: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isPrimary: z.boolean().default(true),
});

export const completeRegistrationSchema = businessInfoSchema.extend({
  primaryAddress: addressSchema,
});

export type CustomerTypeForm = z.infer<typeof customerTypeSchema>;
export type BusinessInfoForm = z.infer<typeof businessInfoSchema>;
export type AddressForm = z.infer<typeof addressSchema>;
export type CompleteRegistrationForm = z.infer<typeof completeRegistrationSchema>;

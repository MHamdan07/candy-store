import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CustomerAccount, Profile, StaffAccount } from '@candi/types';

// Detect environment keys
const getEnvVar = (key: string): string | undefined => {
  const g = globalThis as Record<string, any>;
  let val: any = undefined;
  if (g.process?.env?.[key]) {
    val = g.process.env[key];
  } else if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    val = (import.meta as any).env[key];
  }
  return typeof val === 'string' ? val.trim() : undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const isLiveSupabase = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isLiveSupabase
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;


// Mock Accounts Database for Offline Demo Preview
export interface MockUserSession {
  user: {
    id: string;
    phone: string;
  };
  profile: Profile;
  customerAccount?: CustomerAccount;
  staffAccount?: StaffAccount;
}

export const MOCK_ACCOUNTS: Record<string, MockUserSession> = {
  // 1. Approved Retailer
  '+923001111111': {
    user: { id: 'usr-ret-01', phone: '+923001111111' },
    profile: {
      id: 'usr-ret-01',
      fullName: 'Muhammad Bilal Khan',
      phone: '+923001111111',
      preferredLanguage: 'en',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z',
    },
    customerAccount: {
      id: 'cust-ret-01',
      profileId: 'usr-ret-01',
      customerType: 'retailer',
      businessName: 'Bilal General Store',
      businessCategory: 'Confectionery & General Retail',
      whatsappNumber: '+923001111111',
      status: 'approved',
      assignedDeliveryZoneId: 'zone-01',
      createdAt: '2026-09-01T10:05:00Z',
      updatedAt: '2026-09-02T14:30:00Z',
      approvedAt: '2026-09-02T14:30:00Z',
    },
  },
  // 2. Pending Review Sub-wholesaler
  '+923002222222': {
    user: { id: 'usr-sub-02', phone: '+923002222222' },
    profile: {
      id: 'usr-sub-02',
      fullName: 'Tariq Mehmood',
      phone: '+923002222222',
      preferredLanguage: 'en',
      createdAt: '2026-09-15T09:30:00Z',
      updatedAt: '2026-09-15T09:30:00Z',
    },
    customerAccount: {
      id: 'cust-sub-02',
      profileId: 'usr-sub-02',
      customerType: 'sub_wholesaler',
      businessName: 'Mehmood Traders Wholesale',
      businessCategory: 'FMCG Wholesale Distributor',
      whatsappNumber: '+923002222222',
      status: 'pending_review',
      assignedDeliveryZoneId: 'zone-02',
      createdAt: '2026-09-15T09:40:00Z',
      updatedAt: '2026-09-15T09:40:00Z',
    },
  },
  // 3. Changes Requested Customer
  '+923003333333': {
    user: { id: 'usr-chg-03', phone: '+923003333333' },
    profile: {
      id: 'usr-chg-03',
      fullName: 'Kamran Siddiqui',
      phone: '+923003333333',
      preferredLanguage: 'en',
      createdAt: '2026-09-10T12:00:00Z',
      updatedAt: '2026-09-10T12:00:00Z',
    },
    customerAccount: {
      id: 'cust-chg-03',
      profileId: 'usr-chg-03',
      customerType: 'retailer',
      businessName: 'Al-Madina Mini Mart',
      whatsappNumber: '+923003333333',
      status: 'changes_requested',
      changeRequestMessage: 'Please provide exact shop number and confirm WhatsApp contact.',
      createdAt: '2026-09-10T12:15:00Z',
      updatedAt: '2026-09-12T11:00:00Z',
    },
  },
  // 4. Rejected Customer
  '+923004444444': {
    user: { id: 'usr-rej-04', phone: '+923004444444' },
    profile: {
      id: 'usr-rej-04',
      fullName: 'Zubair Ahmed',
      phone: '+923004444444',
      preferredLanguage: 'en',
      createdAt: '2026-09-05T08:00:00Z',
      updatedAt: '2026-09-05T08:00:00Z',
    },
    customerAccount: {
      id: 'cust-rej-04',
      profileId: 'usr-rej-04',
      customerType: 'retailer',
      businessName: 'Corner Kiosk',
      status: 'rejected',
      rejectedReason: 'Delivery area currently outside Candi service network in Phase 1.',
      createdAt: '2026-09-05T08:10:00Z',
      updatedAt: '2026-09-06T10:00:00Z',
    },
  },
  // 5. Suspended Customer
  '+923005555555': {
    user: { id: 'usr-sus-05', phone: '+923005555555' },
    profile: {
      id: 'usr-sus-05',
      fullName: 'Rashid Ali',
      phone: '+923005555555',
      preferredLanguage: 'en',
      createdAt: '2026-08-20T11:00:00Z',
      updatedAt: '2026-08-20T11:00:00Z',
    },
    customerAccount: {
      id: 'cust-sus-05',
      profileId: 'usr-sus-05',
      customerType: 'sub_wholesaler',
      businessName: 'Ali & Sons Candy Mart',
      status: 'suspended',
      internalNotes: 'Payment reconciliation pending for past COD delivery cycle.',
      createdAt: '2026-08-20T11:20:00Z',
      updatedAt: '2026-09-14T16:00:00Z',
    },
  },
  // 6. Super Admin Staff
  '+923009999999': {
    user: { id: 'usr-adm-01', phone: '+923009999999' },
    profile: {
      id: 'usr-adm-01',
      fullName: 'Farhan Zaidi (Operations Lead)',
      phone: '+923009999999',
      preferredLanguage: 'en',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    staffAccount: {
      id: 'staff-01',
      profileId: 'usr-adm-01',
      role: 'super_admin',
      isActive: true,
      assignedAt: '2026-08-01T00:00:00Z',
    },
  },
  // 7. Operations & Admin Manager
  '+923009999901': {
    user: { id: 'usr-adm-02', phone: '+923009999901' },
    profile: {
      id: 'usr-adm-02',
      fullName: 'Bilal Ahmed (Operations Manager)',
      phone: '+923009999901',
      preferredLanguage: 'en',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    staffAccount: {
      id: 'staff-02',
      profileId: 'usr-adm-02',
      role: 'admin_manager',
      isActive: true,
      assignedAt: '2026-08-01T00:00:00Z',
    },
  },
  // 8. Warehouse Manager
  '+923009999902': {
    user: { id: 'usr-wh-01', phone: '+923009999902' },
    profile: {
      id: 'usr-wh-01',
      fullName: 'Asim Raza (Warehouse Manager)',
      phone: '+923009999902',
      preferredLanguage: 'en',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    staffAccount: {
      id: 'staff-03',
      profileId: 'usr-wh-01',
      role: 'warehouse_manager',
      isActive: true,
      assignedAt: '2026-08-01T00:00:00Z',
    },
  },
  // 9. Warehouse Staff / Picker
  '+923009999903': {
    user: { id: 'usr-wh-02', phone: '+923009999903' },
    profile: {
      id: 'usr-wh-02',
      fullName: 'Kashif Mehmood (Warehouse Picker)',
      phone: '+923009999903',
      preferredLanguage: 'en',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    staffAccount: {
      id: 'staff-04',
      profileId: 'usr-wh-02',
      role: 'warehouse_staff',
      isActive: true,
      assignedAt: '2026-08-01T00:00:00Z',
    },
  },
  // 10. Wholesale Sales Agent / Booker
  '+923009999904': {
    user: { id: 'usr-sa-01', phone: '+923009999904' },
    profile: {
      id: 'usr-sa-01',
      fullName: 'Hamza Tariq (Sales Order Booker)',
      phone: '+923009999904',
      preferredLanguage: 'en',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    staffAccount: {
      id: 'staff-05',
      profileId: 'usr-sa-01',
      role: 'sales_agent',
      isActive: true,
      assignedAt: '2026-08-01T00:00:00Z',
    },
  },
  // 11. Logistics & Fleet Manager
  '+923009999905': {
    user: { id: 'usr-dl-01', phone: '+923009999905' },
    profile: {
      id: 'usr-dl-01',
      fullName: 'Salman Khan (Fleet & Delivery Lead)',
      phone: '+923009999905',
      preferredLanguage: 'en',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    staffAccount: {
      id: 'staff-06',
      profileId: 'usr-dl-01',
      role: 'delivery_manager',
      isActive: true,
      assignedAt: '2026-08-01T00:00:00Z',
    },
  },
  // 12. Delivery Fleet Rider
  '+923009999906': {
    user: { id: 'usr-rd-01', phone: '+923009999906' },
    profile: {
      id: 'usr-rd-01',
      fullName: 'Usman Ghani (Delivery Fleet Rider)',
      phone: '+923009999906',
      preferredLanguage: 'en',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    staffAccount: {
      id: 'staff-07',
      profileId: 'usr-rd-01',
      role: 'rider',
      isActive: true,
      assignedAt: '2026-08-01T00:00:00Z',
    },
  },
  // 13. Accounts & Cashier Staff
  '+923009999907': {
    user: { id: 'usr-ac-01', phone: '+923009999907' },
    profile: {
      id: 'usr-ac-01',
      fullName: 'Naveed Siddiqui (Accounts & Khata Officer)',
      phone: '+923009999907',
      preferredLanguage: 'en',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
    staffAccount: {
      id: 'staff-08',
      profileId: 'usr-ac-01',
      role: 'accounts_staff',
      isActive: true,
      assignedAt: '2026-08-01T00:00:00Z',
    },
  },
};

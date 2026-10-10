import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import type { CustomerRecord, CustomerWorkflowStatus, CustomerCategory, CustomerTier } from '@candi/types';
import { INITIAL_CUSTOMERS } from '../data/customers';

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New Customer Form State
  const [formData, setFormData] = useState({
    code: `CUST-KHI-00${INITIAL_CUSTOMERS.length + 1}`,
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    cnicOrNtn: '',
    category: 'Retailer' as CustomerCategory,
    tier: 'tier_2_gold' as CustomerTier,
    paymentTerms: 'Net 7 Days',
    creditLimit: '150000',
    assignedSalesperson: 'Adnan Tariq (Senior Sales Lead)',
    assignedDeliveryRoute: 'Route 01: Saddar & Old Town Confectionery Hub',
    billingAddress: '',
    deliveryAddressLine: '',
    deliveryArea: 'Saddar',
    deliveryCity: 'Karachi',
    deliveryGps: '',
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.assignedDeliveryRoute.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesTier && matchesCategory;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Customer/Business Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Customer Code is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Phone number is required.');
      return;
    }

    // CONTROL: "Customer codes must be unique"
    const existingCode = customers.some(
      (c) => c.code.toLowerCase() === formData.code.trim().toLowerCase()
    );
    if (existingCode) {
      setFormError(`CUSTOMER CODE CONFLICT: Code "${formData.code}" is already registered. Codes must be unique.`);
      return;
    }

    // CONTROL: "Duplicate customers must be flagged"
    const duplicateName = customers.some(
      (c) => c.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (duplicateName) {
      setFormError(`DUPLICATE DETECTED: A customer with the name "${formData.name}" already exists in the system.`);
      return;
    }

    const tierLabels: Record<CustomerTier, { label: string; priceList: string }> = {
      tier_1_platinum: { label: 'Tier 1: Platinum Wholesaler', priceList: 'Platinum Wholesale Bulk Pricing (8% Off Base)' },
      tier_2_gold: { label: 'Tier 2: Gold Key Retailer', priceList: 'Gold Retailer Price List (4% Off Base)' },
      tier_3_silver: { label: 'Tier 3: Silver Neighborhood Mart', priceList: 'Silver Standard Wholesale Price List' },
      standard_retail: { label: 'Standard Retail', priceList: 'Standard Retail Price List' },
    };

    const newCustomer: CustomerRecord = {
      id: `cust-${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim() || 'Store In-Charge',
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      cnicOrNtn: formData.cnicOrNtn.trim(),
      category: formData.category,
      tier: formData.tier,
      tierLabel: tierLabels[formData.tier].label,
      priceListName: tierLabels[formData.tier].priceList,
      paymentTerms: formData.paymentTerms,
      creditLimit: Number(formData.creditLimit) || 0,
      currentBalance: 0,
      status: 'pending_approval',
      assignedSalesperson: formData.assignedSalesperson,
      assignedDeliveryRoute: formData.assignedDeliveryRoute,
      billingAddress: formData.billingAddress.trim() || 'Karachi, Pakistan',
      deliveryAddresses: [
        {
          id: `addr-${Date.now()}`,
          label: 'Primary Delivery Location',
          recipientName: formData.contactPerson.trim() || formData.name.trim(),
          recipientPhone: formData.phone.trim(),
          addressLine: formData.deliveryAddressLine.trim() || formData.billingAddress.trim(),
          area: formData.deliveryArea,
          city: formData.deliveryCity,
          isPrimary: true,
          gpsCoordinates: formData.deliveryGps.trim() || undefined,
        },
      ],
      orderHistory: [],
      invoiceHistory: [],
      paymentHistory: [],
      returnsHistory: [],
      notes: ['New customer onboarded through Customer Creation Form.'],
      attachments: [],
      auditHistory: [
        {
          timestamp: new Date().toISOString().slice(0, 16),
          actor: 'Farhan Zaidi (Admin)',
          action: 'Created Customer Record',
          details: `Registered customer ${formData.code.toUpperCase()} (${formData.name}). Status set to pending_approval.`,
        },
      ],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setCustomers([newCustomer, ...customers]);
    setIsCreateModalOpen(false);
    setNotice(`Customer "${newCustomer.name}" (${newCustomer.code}) registered successfully and pending approval.`);
    setFormData({
      code: `CUST-KHI-00${customers.length + 2}`,
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      cnicOrNtn: '',
      category: 'Retailer',
      tier: 'tier_2_gold',
      paymentTerms: 'Net 7 Days',
      creditLimit: '150000',
      assignedSalesperson: 'Adnan Tariq (Senior Sales Lead)',
      assignedDeliveryRoute: 'Route 01: Saddar & Old Town Confectionery Hub',
      billingAddress: '',
      deliveryAddressLine: '',
      deliveryArea: 'Saddar',
      deliveryCity: 'Karachi',
      deliveryGps: '',
    });
  };

  const handleApproveCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            status: 'active' as const,
            auditHistory: [
              ...(c.auditHistory || []),
              {
                timestamp: new Date().toISOString().slice(0, 16),
                actor: 'Farhan Zaidi (Authorized Lead)',
                action: 'Approved Customer Account',
                details: 'Status transitioned to Active. Wholesale catalog order booking unlocked.',
              },
            ],
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      })
    );
    setNotice(`Customer account approved and activated successfully.`);
  };

  const getStatusBadge = (status: CustomerWorkflowStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="info">Approved</Badge>;
      case 'on_credit_hold':
        return <Badge variant="danger">On Credit Hold</Badge>;
      case 'inactive':
        return <Badge variant="neutral">Inactive</Badge>;
      case 'new_customer':
        return <Badge variant="info">New Customer</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Customer Code',
      render: (row: CustomerRecord) => (
        <span
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 700,
            fontSize: '12px',
            color: 'var(--color-smoky-black)',
            backgroundColor: 'var(--color-bone)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {row.code}
        </span>
      ),
      width: '130px',
    },
    {
      header: 'Customer Name & Category',
      render: (row: CustomerRecord) => (
        <div>
          <button
            onClick={() => navigate(`/customers/${row.id}`)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--color-smoky-black)',
              textAlign: 'left',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            {row.name}
          </button>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            {row.category} • {row.tierLabel}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      render: (row: CustomerRecord) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{row.contactPerson}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Terms & Route',
      render: (row: CustomerRecord) => (
        <div style={{ fontSize: '12px' }}>
          <div><strong>{row.paymentTerms}</strong></div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>{row.assignedDeliveryRoute}</div>
        </div>
      ),
    },
    {
      header: 'Credit Limit / Balance',
      render: (row: CustomerRecord) => (
        <div style={{ fontSize: '12px' }}>
          <div>Limit: PKR {row.creditLimit.toLocaleString()}</div>
          <div
            style={{
              fontWeight: 800,
              color: row.currentBalance > row.creditLimit ? '#b91c1c' : 'var(--color-smoky-black)',
            }}
          >
            Due: PKR {row.currentBalance.toLocaleString()}
          </div>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'Status',
      render: (row: CustomerRecord) => getStatusBadge(row.status),
      width: '140px',
    },
    {
      header: 'Actions',
      render: (row: CustomerRecord) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/customers/${row.id}`)}>
            Profile
          </Button>
          {row.status === 'pending_approval' && (
            <Button size="sm" variant="primary" onClick={() => handleApproveCustomer(row.id)}>
              Approve
            </Button>
          )}
        </div>
      ),
      width: '160px',
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--color-smoky-black)',
              margin: 0,
            }}
          >
            Customer Management
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              color: 'var(--color-olive-drab)',
              margin: '4px 0 0 0',
            }}
          >
            B2B wholesale customer accounts, tier pricing, credit control governance, and khata ledger balances.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          + Onboard New Customer
        </Button>
      </div>

      {notice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Total Customers
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            {customers.length} Accounts
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            {customers.filter((c) => c.status === 'active').length} Active • {customers.filter((c) => c.status === 'pending_approval').length} Pending
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Total Outstanding Khata
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
            PKR {customers.reduce((acc, c) => acc + c.currentBalance, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Across all retailer ledgers
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            On Credit Hold
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
            {customers.filter((c) => c.status === 'on_credit_hold').length} Accounts
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Orders restricted due to limit breach
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Total Authorized Credit
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {customers.reduce((acc, c) => acc + c.creditLimit, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Combined credit allocation
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card padding="md" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
          <Input
            placeholder="Search by name, code, contact, phone, or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Dropdown
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Pending Approval', value: 'pending_approval' },
              { label: 'Approved', value: 'approved' },
              { label: 'On Credit Hold', value: 'on_credit_hold' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />

          <Dropdown
            label="Filter Tier"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            options={[
              { label: 'All Tiers', value: 'all' },
              { label: 'Tier 1: Platinum', value: 'tier_1_platinum' },
              { label: 'Tier 2: Gold', value: 'tier_2_gold' },
              { label: 'Tier 3: Silver', value: 'tier_3_silver' },
              { label: 'Standard Retail', value: 'standard_retail' },
            ]}
          />

          <Dropdown
            label="Filter Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { label: 'All Categories', value: 'all' },
              { label: 'Retailer', value: 'Retailer' },
              { label: 'Sub-Wholesaler', value: 'Sub-Wholesaler' },
              { label: 'Supermarket / Key Account', value: 'Supermarket / Key Account' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table columns={columns} data={filteredCustomers} emptyMessage="No customers found matching your filters." />
      </Card>

      {/* Customer Creation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Onboard New Customer (Creation Form)"
      >
        <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <Alert type="danger">{formError}</Alert>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Customer Code *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. CUST-KHI-007"
              required
            />
            <Input
              label="Customer / Business Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Madina Cash & Carry"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Contact Person *"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Tariq Mehmood"
              required
            />
            <Input
              label="Phone Number *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+92 300 1234567"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tariq@business.pk"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="CNIC / NTN Number"
              placeholder="42201-xxxxxxx-x"
              value={formData.cnicOrNtn}
              onChange={(e) => setFormData({ ...formData, cnicOrNtn: e.target.value })}
            />
            <Dropdown
              label="Customer Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as CustomerCategory })}
              options={[
                { label: 'Retailer', value: 'Retailer' },
                { label: 'Sub-Wholesaler', value: 'Sub-Wholesaler' },
                { label: 'Supermarket / Key Account', value: 'Supermarket / Key Account' },
              ]}
            />
            <Dropdown
              label="Customer Tier *"
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value as CustomerTier })}
              options={[
                { label: 'Tier 1: Platinum Wholesaler', value: 'tier_1_platinum' },
                { label: 'Tier 2: Gold Key Retailer', value: 'tier_2_gold' },
                { label: 'Tier 3: Silver Neighborhood Mart', value: 'tier_3_silver' },
                { label: 'Standard Retail', value: 'standard_retail' },
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Dropdown
              label="Payment Terms *"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              options={[
                { label: 'Net 7 Days', value: 'Net 7 Days' },
                { label: 'Net 15 Days', value: 'Net 15 Days' },
                { label: 'Net 30 Days', value: 'Net 30 Days' },
                { label: 'Cash on Delivery (COD)', value: 'Cash on Delivery' },
                { label: 'Advance Payment', value: 'Advance Payment' },
              ]}
            />
            <Input
              label="Credit Limit (PKR) *"
              type="number"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Dropdown
              label="Assigned Salesperson *"
              value={formData.assignedSalesperson}
              onChange={(e) => setFormData({ ...formData, assignedSalesperson: e.target.value })}
              options={[
                { label: 'Adnan Tariq (Senior Sales Lead)', value: 'Adnan Tariq (Senior Sales Lead)' },
                { label: 'Kashif Abbasi (Sales Agent)', value: 'Kashif Abbasi (Sales Agent)' },
                { label: 'Zubair Qureshi (Field Agent)', value: 'Zubair Qureshi (Field Agent)' },
              ]}
            />
            <Dropdown
              label="Assigned Delivery Route *"
              value={formData.assignedDeliveryRoute}
              onChange={(e) => setFormData({ ...formData, assignedDeliveryRoute: e.target.value })}
              options={[
                { label: 'Route 01: Saddar & Old Town Confectionery Hub', value: 'Route 01: Saddar & Old Town Confectionery Hub' },
                { label: 'Route 02: Gulshan & F.B. Area Retail Loop', value: 'Route 02: Gulshan & F.B. Area Retail Loop' },
                { label: 'Route 03: Jamshed Road & Tariq Road Express', value: 'Route 03: Jamshed Road & Tariq Road Express' },
                { label: 'Route 04: Clifton & DHA Wholesale Run', value: 'Route 04: Clifton & DHA Wholesale Run' },
              ]}
            />
          </div>

          <Input
            label="Billing Address *"
            value={formData.billingAddress}
            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
            placeholder="Shop 12, Main Bazaar, Karachi"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Primary Delivery Address *"
              value={formData.deliveryAddressLine}
              onChange={(e) => setFormData({ ...formData, deliveryAddressLine: e.target.value })}
              placeholder="Delivery dock or shop entrance"
              required
            />
            <Input
              label="Area"
              value={formData.deliveryArea}
              onChange={(e) => setFormData({ ...formData, deliveryArea: e.target.value })}
            />
            <Input
              label="City"
              value={formData.deliveryCity}
              onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Customer for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

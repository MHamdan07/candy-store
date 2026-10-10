import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import type { Supplier, SupplierStatus } from '@candi/types';
import { INITIAL_SUPPLIERS } from '../data/suppliers';

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New Supplier Form State
  const [formData, setFormData] = useState({
    code: `SUP-NEW-0${INITIAL_SUPPLIERS.length + 1}`,
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Karachi',
    category: 'Confectionery Manufacturer',
    paymentTerms: 'Net 30',
    creditLimit: '500000',
    deliveryLeadTime: '3-5 Days',
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
  });

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name.trim()) {
      setFormError('Supplier Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Supplier Code is required.');
      return;
    }

    // Duplicate Check Control
    const existingCode = suppliers.some((s) => s.code.toLowerCase() === formData.code.trim().toLowerCase());
    if (existingCode) {
      setFormError(`Supplier Code "${formData.code}" is already registered. Codes must be unique.`);
      return;
    }

    const duplicateName = suppliers.some((s) => s.name.toLowerCase() === formData.name.trim().toLowerCase());
    if (duplicateName) {
      setFormError(`A supplier with the name "${formData.name}" already exists. Duplicate suppliers are flagged.`);
      return;
    }

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim() || 'Procurement Rep',
      phone: formData.phone.trim() || '+92 300 0000000',
      email: formData.email.trim(),
      address: formData.address.trim() || 'Industrial Estate',
      city: formData.city,
      category: formData.category,
      paymentTerms: formData.paymentTerms,
      creditLimit: Number(formData.creditLimit) || 0,
      deliveryLeadTime: formData.deliveryLeadTime,
      status: 'pending_approval',
      outstandingBalance: 0,
      rating: 5.0,
      bankDetails: {
        bankName: formData.bankName,
        accountTitle: formData.accountTitle,
        accountNumber: formData.accountNumber,
        iban: formData.iban,
      },
      auditHistory: [
        {
          timestamp: new Date().toISOString().slice(0, 16),
          actor: 'Farhan Zaidi (Procurement Admin)',
          action: 'Created Supplier Record',
          details: `Supplier onboarded with code ${formData.code.toUpperCase()}; submitted for management review.`,
        },
      ],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setSuppliers([newSupplier, ...suppliers]);
    setIsCreateModalOpen(false);
    setNotice(`Supplier "${newSupplier.name}" (${newSupplier.code}) registered successfully and pending approval.`);
    setFormData({
      code: `SUP-NEW-0${suppliers.length + 2}`,
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: 'Karachi',
      category: 'Confectionery Manufacturer',
      paymentTerms: 'Net 30',
      creditLimit: '500000',
      deliveryLeadTime: '3-5 Days',
      bankName: '',
      accountTitle: '',
      accountNumber: '',
      iban: '',
    });
  };

  const handleApprove = (supplierId: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          return {
            ...s,
            status: 'active',
            auditHistory: [
              ...(s.auditHistory || []),
              {
                timestamp: new Date().toISOString().slice(0, 16),
                actor: 'Farhan Zaidi (Authorized Lead)',
                action: 'Approved Supplier Account',
                details: 'Status transitioned to Active. Supplier is authorized for Purchase Orders.',
              },
            ],
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return s;
      })
    );
    setNotice(`Supplier account approved and activated successfully.`);
  };

  const getStatusBadge = (status: SupplierStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="info">Approved</Badge>;
      case 'on_hold':
        return <Badge variant="neutral">On Hold</Badge>;
      case 'inactive':
        return <Badge variant="danger">Inactive</Badge>;
      case 'new_supplier':
        return <Badge variant="info">New Supplier</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Supplier Code',
      render: (row: Supplier) => (
        <span
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 700,
            fontSize: '12px',
            color: 'var(--color-olive-drab)',
            backgroundColor: 'var(--color-bone)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {row.code}
        </span>
      ),
      width: '120px',
    },
    {
      header: 'Supplier Name & Category',
      render: (row: Supplier) => (
        <div>
          <button
            onClick={() => navigate(`/suppliers/${row.id}`)}
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
            {row.category} • {row.city}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      render: (row: Supplier) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-smoky-black)' }}>{row.contactPerson}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Terms & Lead Time',
      render: (row: Supplier) => (
        <div style={{ fontSize: '12px' }}>
          <div><strong>Terms:</strong> {row.paymentTerms}</div>
          <div style={{ color: 'var(--color-olive-drab)' }}>Lead: {row.deliveryLeadTime}</div>
        </div>
      ),
    },
    {
      header: 'Credit Limit / Balance',
      render: (row: Supplier) => (
        <div style={{ fontSize: '12px' }}>
          <div>Limit: PKR {row.creditLimit.toLocaleString()}</div>
          <div style={{ fontWeight: 700, color: row.outstandingBalance > 0 ? '#b91c1c' : 'var(--color-olive-drab)' }}>
            Due: PKR {row.outstandingBalance.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row: Supplier) => getStatusBadge(row.status),
      width: '130px',
    },
    {
      header: 'Actions',
      render: (row: Supplier) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/suppliers/${row.id}`)}>
            Profile
          </Button>
          {row.status === 'pending_approval' && (
            <Button size="sm" variant="primary" onClick={() => handleApprove(row.id)}>
              Approve
            </Button>
          )}
        </div>
      ),
      width: '150px',
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
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
            Supplier Management
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              color: 'var(--color-olive-drab)',
              margin: '4px 0 0 0',
            }}
          >
            Central FMCG supplier database connected to purchasing, inventory GRN, invoices, and payment khata.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          + Onboard New Supplier
        </Button>
      </div>

      {notice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Total Suppliers
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            {suppliers.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            {suppliers.filter((s) => s.status === 'active').length} Active • {suppliers.filter((s) => s.status === 'pending_approval').length} Pending
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Total Outstanding Balance
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
            PKR {suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Across all supplier ledgers
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Active Credit Pool
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {suppliers.reduce((acc, s) => acc + s.creditLimit, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Combined authorized credit limits
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Governance Control
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-olive-drab)', marginTop: '6px' }}>
            Strict RBAC & Audit Active
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
            Inactive & on-hold suppliers locked from POs
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card padding="md" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
          <Input
            placeholder="Search by supplier name, code, contact or city..."
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
              { label: 'On Hold', value: 'on_hold' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />

          <Dropdown
            label="Filter Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { label: 'All Categories', value: 'all' },
              { label: 'Confectionery Manufacturer', value: 'Confectionery Manufacturer' },
              { label: 'Flour & Bakery Ingredients', value: 'Flour & Bakery Ingredients' },
              { label: 'Packaging Materials', value: 'Packaging Materials' },
              { label: 'Flavors & Additives', value: 'Flavors & Additives' },
              { label: 'Plastic Containers', value: 'Plastic Containers' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table columns={columns} data={filteredSuppliers} emptyMessage="No suppliers found matching your criteria." />
      </Card>

      {/* Creation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Onboard New Supplier (Creation Form)"
      >
        <form onSubmit={handleCreateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <Alert type="danger">{formError}</Alert>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Supplier Code *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. SUP-NAT-07"
              required
            />
            <Input
              label="Supplier Company Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mehran Sugar Mills & Confectionery"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Contact Person *"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Ali Raza"
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
              placeholder="contact@supplier.pk"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Input
              label="Factory / Office Address *"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot 12, Sector 23, Korangi Industrial Area"
              required
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Dropdown
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'Confectionery Manufacturer', value: 'Confectionery Manufacturer' },
                { label: 'Flour & Bakery Ingredients', value: 'Flour & Bakery Ingredients' },
                { label: 'Packaging Materials', value: 'Packaging Materials' },
                { label: 'Flavors & Additives', value: 'Flavors & Additives' },
                { label: 'Plastic Containers', value: 'Plastic Containers' },
              ]}
            />
            <Dropdown
              label="Payment Terms"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              options={[
                { label: 'Net 15 Days', value: 'Net 15' },
                { label: 'Net 30 Days', value: 'Net 30' },
                { label: 'Net 45 Days', value: 'Net 45' },
                { label: 'Cash on Delivery (COD)', value: 'Cash on Delivery' },
                { label: 'Advance Payment', value: 'Advance Payment' },
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Authorized Credit Limit (PKR)"
              type="number"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
            />
            <Input
              label="Delivery Lead Time"
              value={formData.deliveryLeadTime}
              onChange={(e) => setFormData({ ...formData, deliveryLeadTime: e.target.value })}
              placeholder="e.g. 3-5 Days"
            />
          </div>

          {/* Bank Details Section */}
          <div style={{ padding: '12px', backgroundColor: 'var(--color-floral-white)', border: '1px solid var(--color-bone)', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-smoky-black)', marginBottom: '8px' }}>
              Bank & Settlement Details (Requires Verification)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                label="Bank Name"
                placeholder="e.g. Habib Bank Limited"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
              <Input
                label="Account Title"
                placeholder="e.g. Company Ltd"
                value={formData.accountTitle}
                onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
              />
              <Input
                label="Account Number"
                placeholder="0042..."
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
              <Input
                label="IBAN"
                placeholder="PK36..."
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

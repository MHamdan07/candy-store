import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Input, Alert } from '@candi/ui';
import { CustomerTierDefinition } from '@candi/types';
import { INITIAL_CUSTOMER_TIERS } from '../../data/customerTiers';

export const CustomerTierListPage: React.FC = () => {
  const [tiers, setTiers] = useState<CustomerTierDefinition[]>(INITIAL_CUSTOMER_TIERS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedTier, setSelectedTier] = useState<CustomerTierDefinition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Form state for edit/create
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    minMonthlyVolumePKR: 0,
    defaultDiscountPct: 0,
    paymentTermsLimitDays: 7,
    status: 'active' as 'active' | 'inactive',
    eligibilityRules: '',
  });

  const filteredTiers = tiers.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const handleOpenEdit = (tier: CustomerTierDefinition) => {
    setSelectedTier(tier);
    setFormData({
      name: tier.name,
      code: tier.code,
      description: tier.description,
      minMonthlyVolumePKR: tier.minMonthlyVolumePKR,
      defaultDiscountPct: tier.defaultDiscountPct,
      paymentTermsLimitDays: tier.paymentTermsLimitDays,
      status: tier.status,
      eligibilityRules: tier.eligibilityRules.join('\n'),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    const rulesArray = formData.eligibilityRules
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const updated = tiers.map((t) =>
      t.id === selectedTier.id
        ? {
            ...t,
            name: formData.name,
            code: formData.code,
            description: formData.description,
            minMonthlyVolumePKR: Number(formData.minMonthlyVolumePKR),
            defaultDiscountPct: Number(formData.defaultDiscountPct),
            paymentTermsLimitDays: Number(formData.paymentTermsLimitDays),
            status: formData.status,
            eligibilityRules: rulesArray,
            updatedAt: new Date().toISOString().split('T')[0],
          }
        : t
    );

    setTiers(updated);
    setIsEditModalOpen(false);
    setSaveSuccessMsg(`Tier "${formData.name}" covenants successfully updated.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const rulesArray = formData.eligibilityRules
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const newTier: CustomerTierDefinition = {
      id: `tier-${Date.now()}`,
      name: formData.name,
      tierKey: 'standard_retail',
      code: formData.code.toUpperCase(),
      description: formData.description,
      minMonthlyVolumePKR: Number(formData.minMonthlyVolumePKR),
      defaultDiscountPct: Number(formData.defaultDiscountPct),
      paymentTermsLimitDays: Number(formData.paymentTermsLimitDays),
      status: formData.status,
      eligibilityRules: rulesArray,
      activeCustomersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setTiers([...tiers, newTier]);
    setIsCreateModalOpen(false);
    setSaveSuccessMsg(`New tier "${formData.name}" created successfully.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleToggleStatus = (tierId: string) => {
    setTiers((prev) =>
      prev.map((t) =>
        t.id === tierId
          ? {
              ...t,
              status: t.status === 'active' ? 'inactive' : 'active',
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : t
      )
    );
  };

  const columns = [
    {
      header: 'Customer Tier Name & Code',
      render: (row: CustomerTierDefinition) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', fontSize: '14px' }}>
            {row.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Code: <span style={{ fontWeight: 700 }}>{row.code}</span> • Max Terms: {row.paymentTermsLimitDays} days
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px', maxWidth: '400px', lineHeight: 1.4 }}>
            {row.description}
          </div>
        </div>
      ),
      width: '340px',
    },
    {
      header: 'Eligibility Rules & Covenants',
      render: (row: CustomerTierDefinition) => (
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--color-smoky-black)', lineHeight: 1.5 }}>
          {row.eligibilityRules.map((rule, idx) => (
            <li key={idx} style={{ marginBottom: '2px' }}>{rule}</li>
          ))}
        </ul>
      ),
      width: '420px',
    },
    {
      header: 'Commercial Terms',
      render: (row: CustomerTierDefinition) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            <span style={{ color: 'var(--color-olive-drab)' }}>Default Rebate: </span>
            <span style={{ fontWeight: 800, color: 'var(--color-smoky-black)' }}>{row.defaultDiscountPct}%</span>
          </div>
          <div style={{ marginTop: '2px' }}>
            <span style={{ color: 'var(--color-olive-drab)' }}>Min Volume: </span>
            <span style={{ fontWeight: 700 }}>
              {row.minMonthlyVolumePKR > 0 ? `PKR ${row.minMonthlyVolumePKR.toLocaleString()}/mo` : 'No MOQ'}
            </span>
          </div>
          <div style={{ marginTop: '2px', color: 'var(--color-olive-drab)' }}>
            Active Accounts: <strong style={{ color: 'var(--color-smoky-black)' }}>{row.activeCustomersCount}</strong>
          </div>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'Status',
      render: (row: CustomerTierDefinition) => (
        <div>
          <Badge
            variant={row.status === 'active' ? 'success' : 'neutral'}
          >
            {row.status.toUpperCase()}
          </Badge>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
            Updated: {row.updatedAt}
          </div>
        </div>
      ),
      width: '120px',
    },
    {
      header: 'Actions',
      render: (row: CustomerTierDefinition) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(row)}>
            Configure Rules
          </Button>
          <Button
            size="sm"
            variant="ghost"
            style={{
              fontSize: '11px',
              color: row.status === 'active' ? '#8C2A2A' : '#2D6A4F',
            }}
            onClick={() => handleToggleStatus(row.id)}
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
      width: '180px',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Metric Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            Customer Tiers & Eligibility Rules
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Set price matrix levels, volume qualification thresholds, and credit terms by customer class.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="primary"
            onClick={() => {
              setFormData({
                name: '',
                code: 'TIER-',
                description: '',
                minMonthlyVolumePKR: 100000,
                defaultDiscountPct: 3.0,
                paymentTermsLimitDays: 7,
                status: 'active',
                eligibilityRules: 'Minimum monthly purchase of PKR 100,000+\nClean credit history',
              });
              setIsCreateModalOpen(true);
            }}
          >
            + New Customer Tier
          </Button>
        </div>
      </div>

      {saveSuccessMsg && (
        <Alert type="success" title="Rules Updated">
          {saveSuccessMsg}
        </Alert>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>TOTAL TIERS</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            {tiers.length}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            {tiers.filter((t) => t.status === 'active').length} Active • {tiers.filter((t) => t.status === 'inactive').length} Inactive
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>HIGHEST VOLUME TIER</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            Platinum (8.5% Off)
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>PKR 500,000+ monthly threshold</div>
        </Card>
        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>RETAIL BASE ACCOUNTS</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            42 Stores
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Standard catalog rate (0% discount)</div>
        </Card>
        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>GOVERNANCE PROTOCOL</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#2D6A4F', marginTop: '4px' }}>
            ✓ Date-Bound Pricing
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Strict priority waterfall enforced</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-bone)', paddingBottom: '8px' }}>
        {(['all', 'active', 'inactive'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: statusFilter === filter ? 'var(--color-smoky-black)' : 'var(--color-bone)',
              color: statusFilter === filter ? 'var(--color-floral-white)' : 'var(--color-smoky-black)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {filter} Tiers ({filter === 'all' ? tiers.length : tiers.filter((t) => t.status === filter).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredTiers}
          keyExtractor={(t) => t.id}
          emptyMessage="No customer tiers matched the selected filter."
        />
      </Card>

      {/* Edit Tier Modal */}
      {isEditModalOpen && selectedTier && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Configure Rules: ${selectedTier.name}`}
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Tier Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Tier Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <Input
                label="Min Monthly Volume (PKR)"
                type="number"
                value={String(formData.minMonthlyVolumePKR)}
                onChange={(e) => setFormData({ ...formData, minMonthlyVolumePKR: Number(e.target.value) })}
                required
              />
              <Input
                label="Default Rebate %"
                type="number"
                step="0.1"
                value={String(formData.defaultDiscountPct)}
                onChange={(e) => setFormData({ ...formData, defaultDiscountPct: Number(e.target.value) })}
                required
              />
              <Input
                label="Max Credit Terms (Days)"
                type="number"
                value={String(formData.paymentTermsLimitDays)}
                onChange={(e) => setFormData({ ...formData, paymentTermsLimitDays: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Eligibility Rules (One rule per line)
              </label>
              <textarea
                value={formData.eligibilityRules}
                onChange={(e) => setFormData({ ...formData, eligibilityRules: e.target.value })}
                rows={4}
                placeholder="Enter eligibility covenants..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              >
                <option value="active">Active (Available for Pricing Engine)</option>
                <option value="inactive">Inactive (Suspended)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create New Tier Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Customer Tier"
        >
          <form onSubmit={handleCreateNew} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Tier Name"
                placeholder="e.g. Tier 4 — Institutional Wholesale"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Tier Code"
                placeholder="e.g. TIER-INST-04"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Target customer segment description..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <Input
                label="Min Volume (PKR)"
                type="number"
                value={String(formData.minMonthlyVolumePKR)}
                onChange={(e) => setFormData({ ...formData, minMonthlyVolumePKR: Number(e.target.value) })}
                required
              />
              <Input
                label="Default Rebate %"
                type="number"
                step="0.1"
                value={String(formData.defaultDiscountPct)}
                onChange={(e) => setFormData({ ...formData, defaultDiscountPct: Number(e.target.value) })}
                required
              />
              <Input
                label="Max Credit Days"
                type="number"
                value={String(formData.paymentTermsLimitDays)}
                onChange={(e) => setFormData({ ...formData, paymentTermsLimitDays: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Eligibility Rules (One rule per line)
              </label>
              <textarea
                value={formData.eligibilityRules}
                onChange={(e) => setFormData({ ...formData, eligibilityRules: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Tier
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

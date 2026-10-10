import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { INITIAL_CHART_OF_ACCOUNTS } from '../../data/chartOfAccounts';
import type { ChartOfAccount, AccountCategory } from '@candi/types';

export const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>(INITIAL_CHART_OF_ACCOUNTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // New account form state
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newType, setNewType] = useState<AccountCategory>('asset');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newOpeningBalance, setNewOpeningBalance] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesCategory = selectedCategory === 'all' || acc.type === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        acc.code.toLowerCase().includes(q) ||
        acc.name.toLowerCase().includes(q) ||
        acc.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [accounts, selectedCategory, searchQuery]);

  // Financial summary aggregations
  const summaries = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;

    accounts.forEach((a) => {
      if (!a.isActive) return;
      if (a.type === 'asset') totalAssets += a.currentBalancePKR;
      else if (a.type === 'liability') totalLiabilities += a.currentBalancePKR;
      else if (a.type === 'equity') totalEquity += a.currentBalancePKR;
      else if (a.type === 'revenue') totalRevenue += a.currentBalancePKR;
      else if (a.type === 'expense') totalExpenses += a.currentBalancePKR;
    });

    return { totalAssets, totalLiabilities, totalEquity, totalRevenue, totalExpenses };
  }, [accounts]);

  // Toggle active status
  const handleToggleStatus = (code: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.code === code) {
          return { ...acc, isActive: !acc.isActive, updatedAt: new Date().toISOString().split('T')[0] };
        }
        return acc;
      })
    );
  };

  // Create new account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      setFormError('Account code and account name are mandatory.');
      return;
    }
    if (accounts.some((a) => a.code === newCode.trim())) {
      setFormError(`Account code "${newCode.trim()}" already exists in the Chart of Accounts.`);
      return;
    }

    const created: ChartOfAccount = {
      code: newCode.trim(),
      name: newName.trim(),
      type: newType,
      currentBalancePKR: Number(newOpeningBalance) || 0,
      currency: 'PKR',
      isActive: true,
      description: newDescription.trim() || 'Custom General Ledger Account',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setAccounts((prev) => [...prev, created].sort((a, b) => a.code.localeCompare(b.code)));
    setIsModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewDescription('');
    setNewOpeningBalance(0);
    setFormError(null);
    setSuccessNotice(`Account "${created.code} - ${created.name}" created and activated successfully.`);
  };

  const getCategoryBadge = (type: AccountCategory) => {
    switch (type) {
      case 'asset':
        return <Badge variant="neutral">Asset (1000s)</Badge>;
      case 'liability':
        return <Badge variant="warning">Liability (2000s)</Badge>;
      case 'equity':
        return <Badge variant="brand">Equity (3000s)</Badge>;
      case 'revenue':
        return <Badge variant="success">Revenue (4000s)</Badge>;
      case 'expense':
        return <Badge variant="danger">Expense (5000/6000s)</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              Chart of Accounts (COA)
            </h1>
            <Badge variant="brand">Standard Double-Entry GL</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Central financial classification connecting wholesale trade sales, inventory assets, supplier liabilities, and owner equity.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Add Account
        </Button>
      </div>

      {successNotice && (
        <Alert type="success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{successNotice}</span>
            <button
              onClick={() => setSuccessNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* Financial Overview Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #11120D', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>Total Assets (1000s)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            PKR {summaries.totalAssets.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>Cash, Bank, AR & Inventory</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #B8860B', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>Total Liabilities (2000s)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#8A5D00', marginTop: '4px' }}>
            PKR {summaries.totalLiabilities.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>Trade Payables & Sales Tax</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>Owner Equity (3000s)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR {summaries.totalEquity.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>Share Capital & Retained Earnings</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #1565C0', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>Net Revenue (4000s)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1565C0', marginTop: '4px' }}>
            PKR {summaries.totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>Sales less discounts & rebates</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #C62828', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>Total Operating Expenses</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#C62828', marginTop: '4px' }}>
            PKR {summaries.totalExpenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>COGS, Fleet Fuel & Depot Rent</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Accounts' },
              { key: 'asset', label: 'Assets (1000s)' },
              { key: 'liability', label: 'Liabilities (2000s)' },
              { key: 'equity', label: 'Equity (3000s)' },
              { key: 'revenue', label: 'Revenue (4000s)' },
              { key: 'expense', label: 'Expenses (5000/6000s)' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.key ? '#11120D' : '#D8CFBC',
                  background: selectedCategory === cat.key ? '#11120D' : '#FFFBF4',
                  color: selectedCategory === cat.key ? '#FFFBF4' : '#11120D',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '260px' }}>
            <Input
              placeholder="Search code, name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Accounts Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Account Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Account Title</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Classification</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Control Account</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Current Balance (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#565449' }}>
                    No general ledger accounts match the selected category or search filter.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, index) => (
                  <tr
                    key={acc.code}
                    style={{
                      borderBottom: '1px solid #EFEAE0',
                      background: index % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#11120D' }}>
                      {acc.code}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#11120D' }}>{acc.name}</div>
                      <div style={{ fontSize: '11px', color: '#7E7A6B', marginTop: '2px' }}>{acc.description}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getCategoryBadge(acc.type)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {acc.isControlAccount ? (
                        <Badge variant="brand">Sub-Ledger Control</Badge>
                      ) : (
                        <span style={{ color: '#9E9B90', fontSize: '12px' }}>Standard GL</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: acc.currentBalancePKR < 0 ? '#C62828' : '#11120D',
                      }}
                    >
                      PKR {acc.currentBalancePKR.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {acc.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleStatus(acc.code)}
                        style={{
                          background: 'none',
                          border: '1px solid #D8CFBC',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          color: acc.isActive ? '#8A5D00' : '#2E7D32',
                          fontWeight: 600,
                        }}
                      >
                        {acc.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Account Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormError(null);
          }}
          title="Create General Ledger Account"
        >
          <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && <Alert type="danger">{formError}</Alert>}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Account Code *
              </label>
              <Input
                placeholder="e.g. 1040, 2040, 6040"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
              />
              <div style={{ fontSize: '11px', color: '#7E7A6B', marginTop: '4px' }}>
                Conventions: 1xxx (Asset), 2xxx (Liability), 3xxx (Equity), 4xxx (Revenue), 5xxx/6xxx (Expense)
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Account Title *
              </label>
              <Input
                placeholder="e.g. Meezan Islamic Business Clearing"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Account Category *
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as AccountCategory)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  color: '#11120D',
                }}
              >
                <option value="asset">Asset (Balance Sheet - Debit Normal)</option>
                <option value="liability">Liability (Balance Sheet - Credit Normal)</option>
                <option value="equity">Equity (Balance Sheet - Credit Normal)</option>
                <option value="revenue">Revenue (Income Statement - Credit Normal)</option>
                <option value="expense">Expense (Income Statement - Debit Normal)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Initial Opening Balance (PKR)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={newOpeningBalance.toString()}
                onChange={(e) => setNewOpeningBalance(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Description / Purpose
              </label>
              <Input
                placeholder="Operational purpose and reconciliation notes..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create & Save Account
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

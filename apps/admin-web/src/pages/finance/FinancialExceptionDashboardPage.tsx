import React, { useState } from 'react';
import { INITIAL_FINANCIAL_EXCEPTIONS } from '../../data/financialControlsData';
import type { FinancialExceptionItem, StaffRoleName } from '@candi/types';
import { validateExceptionResolution } from '@candi/validation';

export const FinancialExceptionDashboardPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<FinancialExceptionItem[]>(INITIAL_FINANCIAL_EXCEPTIONS);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeRole, setActiveRole] = useState<StaffRoleName>('admin_manager');
  const [selectedException, setSelectedException] = useState<FinancialExceptionItem | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'approve' | 'reject' | 'reverse' | 'override'>('override');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const fmt = (n: number) => `PKR ${n.toLocaleString('en-PK')}`;

  const showNotice = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered exceptions
  const filteredExceptions = exceptions.filter((exc) => {
    if (selectedSeverity === 'all') return true;
    if (selectedSeverity === 'closed_period') return exc.exceptionType === 'closed_period_adjustment_request';
    return exc.severity === selectedSeverity;
  });

  // KPI Calculations
  const totalExposure = exceptions.filter((e) => e.status !== 'resolved').reduce((sum, e) => sum + e.amountPKR, 0);
  const criticalCount = exceptions.filter((e) => e.severity === 'critical' && e.status !== 'resolved').length;
  const openCount = exceptions.filter((e) => e.status === 'open').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'resolved' || e.status === 'overridden').length;

  const handleOpenResolveModal = (exc: FinancialExceptionItem) => {
    setSelectedException(exc);
    setResolutionNotes('');
    setResolutionAction('override');
  };

  const handleExecuteResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException) return;

    const validation = validateExceptionResolution(
      selectedException,
      resolutionAction,
      activeRole,
      resolutionNotes
    );

    if (!validation.isAllowed) {
      showNotice(validation.error || 'Resolution action unauthorized.', 'error');
      return;
    }

    setExceptions((prev) =>
      prev.map((item) => {
        if (item.id === selectedException.id) {
          return {
            ...item,
            status: resolutionAction === 'override' ? 'overridden' : 'resolved',
            resolutionNotes,
            resolvedBy: activeRole === 'admin_manager' ? 'Farhan Zaidi (Controller)' : 'Kashif Razzaq (Director)',
            resolvedAt: new Date().toLocaleString('en-PK'),
          };
        }
        return item;
      })
    );

    showNotice(`Exception ${selectedException.sourceReference} successfully marked as ${resolutionAction.toUpperCase()}.`, 'success');
    setSelectedException(null);
  };

  return (
    <div style={{ padding: '24px', background: '#FFFBF4', minHeight: '100vh', fontFamily: '"SUSE Mono", sans-serif', color: '#11120D' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '4px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            background: notification.type === 'error' ? '#D9534F' : notification.type === 'warning' ? '#E0A96D' : '#11120D',
            color: '#FFFBF4',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Header & Role Context Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px' }}>🚨</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Financial Exception Control Tower
            </h1>
            <span
              style={{
                background: criticalCount > 0 ? '#D9534F' : '#4A7C59',
                color: '#FFFBF4',
                padding: '3px 10px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.06em',
              }}
            >
              {openCount} ACTIVE EXCEPTIONS
            </span>
          </div>
          <p style={{ margin: 0, color: '#565449', fontSize: '13px', maxWidth: '850px', lineHeight: '1.4' }}>
            Live statutory risk monitoring. Detects unapproved journals, unreconciled payments, vault cash variances, 3-way match failures, unusual discounts, pending write-offs, and unauthorized closed-period postings.
          </p>
        </div>

        {/* Role Simulator Switcher */}
        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', padding: '8px 14px', borderRadius: '4px' }}>
          <label style={{ fontSize: '11px', color: '#565449', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
            Acting Governance Role:
          </label>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as StaffRoleName)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: 800,
              color: '#11120D',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            <option value="admin_manager">Farhan Zaidi (Finance Controller - PKR 250k limit)</option>
            <option value="super_admin">Kashif Razzaq (Commercial Director / CFO - Unlimited)</option>
            <option value="accounts_staff">Tariq Mehmood (Junior Accountant - View Only)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700, textTransform: 'uppercase' }}>Total Financial Exposure</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            {fmt(totalExposure)}
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>
            Cumulative at-risk variances
          </div>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700, textTransform: 'uppercase' }}>Critical Severity Flags</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: criticalCount > 0 ? '#D9534F' : '#4A7C59', marginTop: '4px' }}>
            {criticalCount} Items
          </div>
          <div style={{ fontSize: '11px', color: '#D9534F', marginTop: '2px', fontWeight: 700 }}>
            Director intervention required
          </div>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700, textTransform: 'uppercase' }}>Open Audit Queue</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            {openCount} Open / {exceptions.length} Total
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>
            Across 8 exception types
          </div>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700, textTransform: 'uppercase' }}>Resolved / Overridden</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#4A7C59', marginTop: '4px' }}>
            {resolvedCount} Cleared
          </div>
          <div style={{ fontSize: '11px', color: '#4A7C59', marginTop: '2px', fontWeight: 600 }}>
            Audit justifications logged
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { id: 'all', label: `All Exceptions (${exceptions.length})` },
          { id: 'critical', label: `Critical Severity (${exceptions.filter((e) => e.severity === 'critical').length})` },
          { id: 'high', label: `High Severity (${exceptions.filter((e) => e.severity === 'high').length})` },
          { id: 'medium', label: `Medium (${exceptions.filter((e) => e.severity === 'medium').length})` },
          { id: 'closed_period', label: `Closed-Period Requests (${exceptions.filter((e) => e.exceptionType === 'closed_period_adjustment_request').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSeverity(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: selectedSeverity === tab.id ? '2px solid #11120D' : '1px solid #D8CFBC',
              background: selectedSeverity === tab.id ? '#11120D' : '#FFF',
              color: selectedSeverity === tab.id ? '#FFFBF4' : '#565449',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exceptions Table */}
      <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#FAF8F3', borderBottom: '2px solid #D8CFBC', textAlign: 'left' }}>
              <th style={{ padding: '12px 14px' }}>Type & Reference</th>
              <th style={{ padding: '12px 14px' }}>Exception Details</th>
              <th style={{ padding: '12px 14px' }}>Period</th>
              <th style={{ padding: '12px 14px' }}>Severity</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px 14px' }}>Detected</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Resolution Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExceptions.map((exc) => {
              const isResolved = exc.status === 'resolved' || exc.status === 'overridden';
              return (
                <tr key={exc.id} style={{ borderBottom: '1px solid #EAE5D9', background: isResolved ? '#FAF8F3' : '#FFF' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 800, color: '#11120D' }}>{exc.sourceReference}</div>
                    <div style={{ fontSize: '11px', color: '#565449', textTransform: 'capitalize' }}>
                      {exc.exceptionType.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', maxWidth: '380px' }}>
                    <div style={{ fontWeight: 700, color: '#11120D', marginBottom: '2px' }}>{exc.title}</div>
                    <div style={{ fontSize: '12px', color: '#565449', lineHeight: '1.3' }}>{exc.description}</div>
                    {exc.resolutionNotes && (
                      <div style={{ fontSize: '11px', color: '#2E7D32', marginTop: '4px', background: '#E8F5E9', padding: '3px 6px', borderRadius: '3px' }}>
                        ✓ Resolved by {exc.resolvedBy}: {exc.resolutionNotes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                    <span style={{ background: exc.periodCode === '2026-08' ? '#FFEBEE' : '#F0EDE6', color: exc.periodCode === '2026-08' ? '#C62828' : '#11120D', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>
                      {exc.periodCode}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        background:
                          exc.severity === 'critical'
                            ? '#FFEBEE'
                            : exc.severity === 'high'
                            ? '#FFF3E0'
                            : '#E8F5E9',
                        color:
                          exc.severity === 'critical'
                            ? '#C62828'
                            : exc.severity === 'high'
                            ? '#E65100'
                            : '#2E7D32',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {exc.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#11120D' }}>
                    {fmt(exc.amountPKR)}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#565449', fontSize: '12px' }}>
                    {exc.detectedAt}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        background: isResolved ? '#E8F5E9' : '#F0EDE6',
                        color: isResolved ? '#2E7D32' : '#11120D',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {exc.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {!isResolved ? (
                      <button
                        onClick={() => handleOpenResolveModal(exc)}
                        style={{
                          background: '#11120D',
                          color: '#FFFBF4',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '3px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Resolve / Override
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#4A7C59', fontWeight: 700 }}>
                        ✓ Completed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RESOLUTION MODAL */}
      {selectedException && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(17, 18, 13, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              background: '#FFFBF4',
              border: '2px solid #11120D',
              borderRadius: '6px',
              width: '560px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  Resolve Financial Exception: {selectedException.sourceReference}
                </h3>
                <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>
                  {selectedException.title} — {fmt(selectedException.amountPKR)}
                </div>
              </div>
              <button
                onClick={() => setSelectedException(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteResolution}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Select Resolution Action:
                </label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value as any)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit' }}
                >
                  <option value="override">Authorize Override with Documented Rationale</option>
                  <option value="approve">Authorize & Clear Discrepancy</option>
                  <option value="reverse">Generate Contra-Reversal Voucher</option>
                  <option value="reject">Reject & Quarantine Transaction</option>
                </select>
              </div>

              {selectedException.exceptionType === 'closed_period_adjustment_request' && (
                <div style={{ background: '#FFF3E0', border: '1px solid #FFE0B2', padding: '10px 12px', borderRadius: '4px', marginBottom: '14px', fontSize: '12px', color: '#E65100' }}>
                  ⚠️ <strong>Closed-Period Protection Gate:</strong> Period {selectedException.periodCode} is closed. Authorizing this exception will safely route the adjustment into the current active open period (2026-09) with a reference audit link.
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Mandatory Audit Rationale / Justification (Min 10 characters):
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="State operational reason, reference delivery challan, or credit note approval..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedException(null)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #D8CFBC',
                    background: '#FFF',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    border: 'none',
                    background: '#11120D',
                    color: '#FFFBF4',
                    fontWeight: 800,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Execute Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

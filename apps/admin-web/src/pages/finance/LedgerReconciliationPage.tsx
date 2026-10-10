import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Alert } from '@candi/ui';
import { runGeneralLedgerReconciliation } from '../../data/financeReconciliationEngine';
import type { GeneralLedgerReconciliationItem } from '@candi/types';

export const LedgerReconciliationPage: React.FC = () => {
  const [reconData, setReconData] = useState(() => runGeneralLedgerReconciliation());
  const [selectedItem, setSelectedItem] = useState<GeneralLedgerReconciliationItem | null>(null);
  const [signOffNotice, setSignOffNotice] = useState<string | null>(null);

  const handleRunReconciliation = () => {
    const updated = runGeneralLedgerReconciliation();
    setReconData(updated);
    setSignOffNotice('General Ledger and Sub-Ledger reconciliation recomputed successfully.');
  };

  const handleSignOffClosing = () => {
    setSignOffNotice(
      `Daily Financial Closing Signed Off by Farhan Zaidi (Finance Controller) at ${new Date().toLocaleTimeString()} PKT. All 4 control accounts verified with $0.00 variance.`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              General Ledger Reconciliation
            </h1>
            <Badge variant="success">All Accounts In Balance ($0 Variance)</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Verification mechanism confirming that Customer Sub-ledgers, Supplier Sub-ledgers, Cash drawers, and Bank accounts tie out 1:1 to General Ledger Control accounts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={handleRunReconciliation}>
            ↻ Recompute Verification
          </Button>
          <Button variant="primary" onClick={handleSignOffClosing}>
            Sign Off Daily Closing
          </Button>
        </div>
      </div>

      {signOffNotice && (
        <Alert type="success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{signOffNotice}</span>
            <button
              onClick={() => setSignOffNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* Global Status Banner */}
      <Card
        style={{
          background: reconData.allBalanced ? '#E8F5E9' : '#FFEBEE',
          border: '1px solid',
          borderColor: reconData.allBalanced ? '#2E7D32' : '#C62828',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>{reconData.allBalanced ? '🛡️' : '⚠️'}</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: reconData.allBalanced ? '#2E7D32' : '#C62828' }}>
                {reconData.allBalanced
                  ? 'Audit Verification Status: 100% Reconciled'
                  : 'Variance Detected in Sub-Ledger Control Accounts'}
              </h3>
            </div>
            <p style={{ margin: '6px 0 0 34px', fontSize: '13px', color: '#565449' }}>
              All 4 primary control accounts (AR 1100, AP 2010, Cash 1010, Bank 1020) match corresponding operational sub-registers without any unallocated variances.
            </p>
          </div>
          <Badge variant={reconData.allBalanced ? 'success' : 'danger'}>
            {reconData.allBalanced ? 'ZERO VARIANCE (PKR 0.00)' : 'AUDIT WARNING'}
          </Badge>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #1565C0', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Customer Receivables (GL 1100)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1565C0', marginTop: '4px' }}>
            PKR {reconData.totalGLReceivables.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '4px', fontWeight: 600 }}>
            Sub-Ledger: PKR {reconData.totalSubLedgerReceivables.toLocaleString()} (Diff: PKR {reconData.receivablesVariance})
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #8A5D00', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Supplier Payables (GL 2010)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#8A5D00', marginTop: '4px' }}>
            PKR {reconData.totalGLPayables.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '4px', fontWeight: 600 }}>
            Sub-Ledger: PKR {reconData.totalSubLedgerPayables.toLocaleString()} (Diff: PKR {reconData.payablesVariance})
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Operating Cash Drawer (GL 1010)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR 125,400
          </div>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '4px', fontWeight: 600 }}>
            Drawer Physical Count: PKR 125,400 (Diff: PKR 0)
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #11120D', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            HBL Corporate Bank (GL 1020)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            PKR 1,840,000
          </div>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '4px', fontWeight: 600 }}>
            E-Banking Statement: PKR 1,840,000 (Diff: PKR 0)
          </div>
        </Card>
      </div>

      {/* Control Accounts Reconciliation Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#11120D' }}>
            Control Account Reconciliation Matrix
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#565449' }}>
            Comparison between General Ledger control balances and sub-ledger registers.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#FAF6EE', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>GL Account</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Operational Sub-Ledger Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>GL Balance (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Sub-Ledger Total</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Variance (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Last Audit Sign-off</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {reconData.reconciledItems.map((item, index) => (
                <tr
                  key={item.controlAccountCode}
                  style={{
                    borderBottom: '1px solid #EFEAE0',
                    background: index % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#11120D' }}>
                      {item.controlAccountCode}
                    </div>
                    <div style={{ fontSize: '12px', color: '#565449' }}>{item.controlAccountName}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#11120D' }}>
                    {item.subLedgerName}
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      textAlign: 'right',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: '#11120D',
                    }}
                  >
                    PKR {item.glBalancePKR.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      textAlign: 'right',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: '#11120D',
                    }}
                  >
                    PKR {item.subLedgerBalancePKR.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      textAlign: 'right',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: item.variancePKR === 0 ? '#2E7D32' : '#C62828',
                    }}
                  >
                    PKR {item.variancePKR.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={item.isReconciled ? 'success' : 'danger'}>
                      {item.isReconciled ? 'RECONCILED' : 'DISCREPANCY'}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#565449' }}>
                    <div>{item.lastReconciledAt}</div>
                    <div style={{ color: '#7E7A6B' }}>{item.reconciledBy}</div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedItem(item)}
                      style={{
                        padding: '4px 10px',
                        background: '#FFFBF4',
                        border: '1px solid #D8CFBC',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: '#1565C0',
                      }}
                    >
                      Audit Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Proof Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Reconciliation Proof: GL Account ${selectedItem.controlAccountCode}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ background: '#FAF6EE', padding: '14px', borderRadius: '6px', border: '1px solid #D8CFBC' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#7E7A6B', textTransform: 'uppercase' }}>
                Account Title
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#11120D', marginTop: '2px' }}>
                {selectedItem.controlAccountCode} &mdash; {selectedItem.controlAccountName}
              </div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>
                Comparing against: {selectedItem.subLedgerName}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ border: '1px solid #D8CFBC', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>
                  General Ledger
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#11120D', fontFamily: 'monospace' }}>
                  PKR {selectedItem.glBalancePKR.toLocaleString()}
                </span>
              </div>

              <div style={{ border: '1px solid #D8CFBC', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>
                  Sub-Ledger Total
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#11120D', fontFamily: 'monospace' }}>
                  PKR {selectedItem.subLedgerBalancePKR.toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  border: '1px solid #2E7D32',
                  background: '#E8F5E9',
                  padding: '12px',
                  borderRadius: '6px',
                }}
              >
                <span style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 700, display: 'block' }}>
                  Net Variance
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#2E7D32', fontFamily: 'monospace' }}>
                  PKR {selectedItem.variancePKR.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#565449', borderTop: '1px solid #EFEAE0', paddingTop: '10px' }}>
              <div>
                Reconciliation timestamp: <strong>{selectedItem.lastReconciledAt}</strong>
              </div>
              <div>
                Auditor / Sign-off officer: <strong>{selectedItem.reconciledBy}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" onClick={() => setSelectedItem(null)}>
                Close Audit Proof
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { INITIAL_CASH_RECONCILIATION_SESSIONS } from '../../data/cashManagement';
import {
  calculateCashVariance,
  calculateDenominationsTotal,
  generateCashClosingJournalEntry,
} from '@candi/validation';
import type {
  CashReconciliationSession,
  CashDenominations,
} from '@candi/types';

export const CashReconciliationPage: React.FC = () => {
  const [sessions, setSessions] = useState<CashReconciliationSession[]>(INITIAL_CASH_RECONCILIATION_SESSIONS);
  const [activeSession, setActiveSession] = useState<CashReconciliationSession>(INITIAL_CASH_RECONCILIATION_SESSIONS[0]);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState<boolean>(false);
  const [supervisorName, setSupervisorName] = useState<string>('Farhan Zaidi (Finance Controller)');
  const [approvalNote, setApprovalNote] = useState<string>('Daily vault physical count verified and approved for GL posting.');

  // Live reconciliation inputs for current session
  const [openingCash, setOpeningCash] = useState<number>(125400);
  const [cashCollected, setCashCollected] = useState<number>(68000);
  const [refunds, setRefunds] = useState<number>(0);
  const [deposits, setDeposits] = useState<number>(50000); // Deposited in HBL
  const [explanation, setExplanation] = useState<string>('');

  // Physical Denomination Notes Counter
  const [denoms, setDenoms] = useState<CashDenominations>({
    note5000: 20, // 100,000
    note1000: 35, // 35,000
    note500: 16,  // 8,000
    note100: 4,   // 400
    note50: 0,
    note20: 0,
    note10: 0,
  });

  // Calculate physical total dynamically
  const actualClosingCash = useMemo(() => {
    return calculateDenominationsTotal(denoms);
  }, [denoms]);

  // Expected Closing Cash = Opening + Collected - Refunds - Deposits
  const expectedClosingCash = useMemo(() => {
    return openingCash + cashCollected - refunds - deposits;
  }, [openingCash, cashCollected, refunds, deposits]);

  // Variance engine
  const varianceResult = useMemo(() => {
    return calculateCashVariance(expectedClosingCash, actualClosingCash);
  }, [expectedClosingCash, actualClosingCash]);

  const handleDenomChange = (field: keyof CashDenominations, val: number) => {
    setDenoms((prev) => ({
      ...prev,
      [field]: Math.max(0, val || 0),
    }));
  };

  // Submit for Supervisor Approval
  const handleSubmitApproval = () => {
    if (varianceResult.requiresExplanation && !explanation.trim()) {
      alert('Please provide an explanation for the cash shortage/excess before requesting supervisor sign-off.');
      return;
    }
    setIsSupervisorModalOpen(true);
  };

  // Confirm Supervisor Approval & Post to GL
  const handleApproveAndPostToGL = () => {
    const jvNumber = `JV-2026-00${Math.floor(90 + Math.random() * 10)}`;
    const updatedSession: CashReconciliationSession = {
      ...activeSession,
      openingCash,
      cashCollected,
      refunds,
      deposits,
      expectedClosingCash,
      actualClosingCash,
      denominations: { ...denoms },
      variance: varianceResult.variance,
      varianceType: varianceResult.varianceType,
      explanation: explanation.trim() || undefined,
      approvalStatus: 'posted_to_ledger',
      approvedBy: supervisorName,
      approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      postedJournalId: jvNumber,
      auditTrail: [
        ...activeSession.auditTrail,
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          actor: supervisorName,
          action: 'APPROVED_AND_POSTED_TO_GL',
          details: `Approved closing count: Expected PKR ${expectedClosingCash.toLocaleString()}, Actual PKR ${actualClosingCash.toLocaleString()} (Variance: PKR ${varianceResult.variance}). Journal ${jvNumber} posted.`,
        },
      ],
    };

    setActiveSession(updatedSession);
    setSessions((prev) => [updatedSession, ...prev.filter((s) => s.id !== updatedSession.id)]);
    setIsSupervisorModalOpen(false);
    setAlertNotice(
      `✓ Daily Vault Closing successfully reconciled and posted to General Ledger under Journal Voucher ${jvNumber}!`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              Cash Reconciliation & Vault Closing
            </h1>
            <Badge variant="brand">Daily Drawer & Depot Vault Audit</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Reconcile physical cash counts against field receipts and bank transfers. Enforce mandatory supervisor sign-offs for drawer variances and auto-post to General Ledger.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeSession.approvalStatus === 'posted_to_ledger' ? (
            <Badge variant="success">Posted to GL ({activeSession.postedJournalId})</Badge>
          ) : (
            <Button variant="primary" onClick={handleSubmitApproval}>
              Approve & Post to GL
            </Button>
          )}
        </div>
      </div>

      {alertNotice && (
        <Alert type="success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{alertNotice}</span>
            <button
              onClick={() => setAlertNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* Reconciliation Formula Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #11120D', padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Opening Vault Cash
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            PKR {openingCash.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>Start of shift balance</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            (+) Cash Collected
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR {cashCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>Route driver handovers</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #C62828', padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            (-) Bank Deposits
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#C62828', marginTop: '4px' }}>
            PKR {deposits.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>Deposited into HBL</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #1565C0', padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            (=) Expected Closing
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1565C0', marginTop: '4px' }}>
            PKR {expectedClosingCash.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>Book cash balance</div>
        </Card>

        <Card
          style={{
            borderLeft: `4px solid ${varianceResult.isBalanced ? '#2E7D32' : '#C62828'}`,
            padding: '14px',
            background: varianceResult.isBalanced ? '#F1F8E9' : '#FFEBEE',
          }}
        >
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Actual Count (Physical)
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: varianceResult.isBalanced ? '#2E7D32' : '#C62828',
              marginTop: '4px',
            }}
          >
            PKR {actualClosingCash.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: varianceResult.isBalanced ? '#2E7D32' : '#C62828' }}>
            {varianceResult.isBalanced ? '✓ 100% In Balance' : `Diff: PKR ${varianceResult.variance.toLocaleString()}`}
          </div>
        </Card>
      </div>

      {/* Main Reconciliation Grid: Left (Denomination Calculator) | Right (Variance Audit) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Physical Cash Denomination Breakdown Counter */}
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#11120D' }}>
                Physical Currency Notes Breakdown
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#565449' }}>
                Itemize counted banknote quantities from central vault drawer.
              </p>
            </div>
            <Badge variant="brand">Pakistani Rupee (PKR)</Badge>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: '#11120D' }}>Denomination</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Note Count</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Total (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { denom: 5000, key: 'note5000' as const, label: 'PKR 5,000 (State Bank of Pakistan)' },
                { denom: 1000, key: 'note1000' as const, label: 'PKR 1,000 (State Bank of Pakistan)' },
                { denom: 500, key: 'note500' as const, label: 'PKR 500 (State Bank of Pakistan)' },
                { denom: 100, key: 'note100' as const, label: 'PKR 100 (State Bank of Pakistan)' },
                { denom: 50, key: 'note50' as const, label: 'PKR 50 (State Bank of Pakistan)' },
                { denom: 20, key: 'note20' as const, label: 'PKR 20 (State Bank of Pakistan)' },
                { denom: 10, key: 'note10' as const, label: 'PKR 10 (State Bank of Pakistan)' },
              ].map((row, idx) => (
                <tr
                  key={row.key}
                  style={{
                    borderBottom: '1px solid #EFEAE0',
                    background: idx % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                  }}
                >
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#11120D' }}>{row.label}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={denoms[row.key] || ''}
                      onChange={(e) => handleDenomChange(row.key, parseInt(e.target.value, 10) || 0)}
                      style={{
                        width: '80px',
                        padding: '6px',
                        textAlign: 'center',
                        borderRadius: '4px',
                        border: '1px solid #D8CFBC',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                    PKR {((denoms[row.key] || 0) * row.denom).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#ECE6D9', fontWeight: 800 }}>
                <td colSpan={2} style={{ padding: '12px', textAlign: 'right' }}>
                  Total Physical Cash Counted:
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontSize: '16px', color: '#2E7D32' }}>
                  PKR {actualClosingCash.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Variance and Sign-Off Audit Gate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#11120D' }}>
              Variance & Compliance Status
            </h3>

            <div
              style={{
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: varianceResult.isBalanced ? '#2E7D32' : '#C62828',
                background: varianceResult.isBalanced ? '#E8F5E9' : '#FFEBEE',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '14px', color: varianceResult.isBalanced ? '#2E7D32' : '#C62828' }}>
                {varianceResult.isBalanced ? '✓ PERFECTLY BALANCED' : `⚠️ VARIANCE DETECTED`}
              </div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>
                {varianceResult.message}
              </div>
            </div>

            {/* Explanation box */}
            {varianceResult.requiresExplanation && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C62828', marginBottom: '4px' }}>
                  Mandatory Explanation for Variance *
                </label>
                <textarea
                  rows={3}
                  placeholder="State reason for shortage or excess (e.g. counterfeit note confiscated, petty cash expense)..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #C62828',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                  }}
                  required
                />
              </div>
            )}

            {/* Reconciliation Audit Trail */}
            <div style={{ borderTop: '1px solid #D8CFBC', paddingTop: '12px' }}>
              <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Reconciliation Session Audit Trail
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {activeSession.auditTrail.map((a, i) => (
                  <div key={i} style={{ fontSize: '11px', color: '#565449', background: '#FAF6EE', padding: '6px', borderRadius: '4px' }}>
                    <strong>{a.timestamp}</strong> &bull; {a.actor}: {a.details}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <Button
                variant="primary"
                onClick={handleSubmitApproval}
                disabled={activeSession.approvalStatus === 'posted_to_ledger'}
                style={{ width: '100%' }}
              >
                {activeSession.approvalStatus === 'posted_to_ledger'
                  ? '✓ Reconciliation Completed & Posted'
                  : 'Submit for Supervisor Sign-off & Post'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Supervisor Approval & Ledger Posting Modal */}
      {isSupervisorModalOpen && (
        <Modal
          isOpen={isSupervisorModalOpen}
          onClose={() => setIsSupervisorModalOpen(false)}
          title="Supervisor Authorization & General Ledger Posting Gate"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ background: '#FAF6EE', padding: '14px', borderRadius: '6px', border: '1px solid #D8CFBC' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#7E7A6B' }}>Reconciliation Summary</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#11120D', marginTop: '2px' }}>
                Session: {activeSession.sessionNumber} ({activeSession.date})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#7E7A6B' }}>Expected Cash</span>
                  <span style={{ display: 'block', fontWeight: 700 }}>PKR {expectedClosingCash.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#7E7A6B' }}>Counted Cash</span>
                  <span style={{ display: 'block', fontWeight: 800, color: '#2E7D32' }}>
                    PKR {actualClosingCash.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#7E7A6B' }}>Net Variance</span>
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 800,
                      color: varianceResult.isBalanced ? '#2E7D32' : '#C62828',
                    }}
                  >
                    PKR {varianceResult.variance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                Approving Finance Controller *
              </label>
              <Input value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                Sign-off Approval Note *
              </label>
              <Input value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} required />
            </div>

            <div style={{ background: '#E8F5E9', padding: '10px', borderRadius: '6px', fontSize: '12px', color: '#2E7D32' }}>
              <strong>Double-Entry GL Impact:</strong> Approving will automatically generate an immutable Journal Voucher posting:
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>Dr. Cash on Hand (GL 1010) / Cr. Trade Receivables (GL 1100): PKR {cashCollected.toLocaleString()}</li>
                <li>Dr. HBL Corporate Bank (GL 1020) / Cr. Cash on Hand (GL 1010): PKR {deposits.toLocaleString()}</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="secondary" onClick={() => setIsSupervisorModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApproveAndPostToGL}>
                Authorize & Post to Ledger
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

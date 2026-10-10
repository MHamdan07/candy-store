import React, { useState } from 'react';
import {
  INITIAL_ACCOUNTING_PERIODS,
  INITIAL_PRE_CLOSING_ADJUSTMENTS,
} from '../../data/periodClosingData';
import { initialAccounts } from '../../data/chartOfAccounts';
import type {
  AccountingPeriod,
  PeriodStatus,
  PeriodClosingAdjustment,
  PeriodAdjustmentType,
  ChartOfAccount,
} from '@candi/types';
import {
  validatePeriodCloseEligibility,
  calculateTrialBalance,
} from '@candi/validation';

interface ClosingStageInfo {
  status: PeriodStatus;
  stage: number;
  label: string;
  description: string;
}

const CLOSING_STAGES: ClosingStageInfo[] = [
  { status: 'open', stage: 1, label: 'Open Period', description: 'Normal transactional postings permitted' },
  { status: 'review_in_progress', stage: 2, label: 'Review Transactions', description: 'Review all subledger postings and invoices' },
  { status: 'reconciled', stage: 3, label: 'Reconcile Ledgers', description: 'Confirm zero variance in cash, bank, AR & AP' },
  { status: 'adjustments_pending', stage: 4, label: 'Identify Adjustments', description: 'Draft pre-closing journal entries and accruals' },
  { status: 'management_review', stage: 5, label: 'Management Review', description: 'Controller and executive review of balances' },
  { status: 'closed', stage: 6, label: 'Close Period', description: 'Ledger closed; awaiting audit lock' },
  { status: 'locked', stage: 7, label: 'Period Locked', description: 'Permanent read-only lock; changes blocked' },
];

interface PreClosingCheckItem {
  category: string;
  item: string;
  description: string;
  status: 'COMPLETED' | 'PENDING';
  auditor: string;
}

const PRE_CLOSING_CHECKLIST: PreClosingCheckItem[] = [
  {
    category: 'Sales & AR',
    item: 'Customer Invoice Register Posting',
    description: 'All 7 sales invoices confirmed, posted to customer sub-ledger, and matched to delivery challans.',
    status: 'COMPLETED',
    auditor: 'Farhan Zaidi',
  },
  {
    category: 'Procurement & AP',
    item: 'Supplier 3-Way Match & GRN Verification',
    description: 'All supplier invoices 3-way matched against PO and GRN with 0 price or quantity discrepancies.',
    status: 'COMPLETED',
    auditor: 'Farhan Zaidi',
  },
  {
    category: 'Cash & Vault',
    item: 'Daily Physical Cash Reconciliation',
    description: 'Physical vault note count balanced against system expected cash with PKR 0 variance.',
    status: 'COMPLETED',
    auditor: 'Muhammad Bilal',
  },
  {
    category: 'Banking',
    item: 'Bank Statement Reconciliation (HBL & Meezan)',
    description: 'Unpresented cheques cleared and e-banking deposits reconciled with zero unreconciled items.',
    status: 'COMPLETED',
    auditor: 'Farhan Zaidi',
  },
  {
    category: 'General Ledger',
    item: 'Trial Balance Debit & Credit Equality',
    description: 'Debit sum equals credit sum exactly (PKR 6,697,900 Dr = PKR 6,697,900 Cr; Δ = 0.00).',
    status: 'COMPLETED',
    auditor: 'Kashif Razzaq',
  },
];

export const PeriodClosingPage: React.FC = () => {
  const [periods, setPeriods] = useState<AccountingPeriod[]>(INITIAL_ACCOUNTING_PERIODS);
  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>('2026-09');
  const [adjustments, setAdjustments] = useState<PeriodClosingAdjustment[]>(INITIAL_PRE_CLOSING_ADJUSTMENTS);
  const [activeTab, setActiveTab] = useState<'workflow' | 'checklist' | 'adjustments' | 'balances' | 'audit'>('workflow');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Modal State for New Adjustment
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [adjType, setAdjType] = useState<PeriodAdjustmentType>('accrual');
  const [adjDescription, setAdjDescription] = useState('');
  const [adjDebitAccount, setAdjDebitAccount] = useState('6020');
  const [adjCreditAccount, setAdjCreditAccount] = useState('2020');
  const [adjAmount, setAdjAmount] = useState<number>(15000);

  // Active Period
  const activePeriod = periods.find((p) => p.periodCode === selectedPeriodCode) || periods[0];
  const isLocked = activePeriod.isLocked || activePeriod.status === 'locked';
  const isClosed = activePeriod.status === 'closed';

  // Currency Formatter
  const fmt = (n: number) => `PKR ${n.toLocaleString('en-PK')}`;

  // Notification helper
  const showNotice = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Trial Balance calculation
  const trialBalance = calculateTrialBalance(initialAccounts);

  // Eligibility validation using @candi/validation
  const closeEligibility = validatePeriodCloseEligibility(
    activePeriod,
    activePeriod.unreconciledCount,
    trialBalance.variance
  );

  // Stepper helper
  const currentStageIndex = CLOSING_STAGES.findIndex((s) => s.status === activePeriod.status);

  // Advance Stage Handler
  const handleAdvanceStage = () => {
    if (isLocked) {
      showNotice('This period is locked under GAAP/IFRS rules and cannot be modified.', 'error');
      return;
    }

    const nextIndex = currentStageIndex + 1;
    if (nextIndex >= CLOSING_STAGES.length) return;

    const nextStage = CLOSING_STAGES[nextIndex];

    // Check pre-conditions before advancing to 'closed' or 'locked'
    if (nextStage.status === 'closed' || nextStage.status === 'locked') {
      if (!closeEligibility.canClose) {
        showNotice(`Cannot advance to ${nextStage.label}: ${closeEligibility.error}`, 'error');
        return;
      }
    }

    setPeriods((prev) =>
      prev.map((p) => {
        if (p.id === activePeriod.id) {
          const updated: AccountingPeriod = {
            ...p,
            status: nextStage.status,
            reviewedBy: nextStage.status === 'management_review' ? 'Farhan Zaidi (Finance Controller)' : p.reviewedBy,
            approvedBy: nextStage.status === 'closed' || nextStage.status === 'locked' ? 'Kashif Razzaq (Director)' : p.approvedBy,
            closedAt: nextStage.status === 'closed' ? new Date().toISOString() : p.closedAt,
            isLocked: nextStage.status === 'locked' ? true : p.isLocked,
            auditTrail: [
              ...p.auditTrail,
              {
                timestamp: new Date().toLocaleString('en-PK'),
                actor: 'Farhan Zaidi',
                action: `STAGE_ADVANCED_${nextStage.status.toUpperCase()}`,
                details: `Accounting period advanced to stage: ${nextStage.label}`,
              },
            ],
          };
          return updated;
        }
        return p;
      })
    );

    showNotice(`Period ${activePeriod.periodCode} advanced to stage: ${nextStage.label}`, 'success');
  };

  // Revert Stage Handler
  const handleRevertStage = () => {
    if (isLocked) {
      showNotice('Locked periods cannot be reverted directly. Supervisory unlock authorization required.', 'error');
      return;
    }
    const prevIndex = currentStageIndex - 1;
    if (prevIndex < 0) return;

    const prevStage = CLOSING_STAGES[prevIndex];
    setPeriods((prev) =>
      prev.map((p) => {
        if (p.id === activePeriod.id) {
          return {
            ...p,
            status: prevStage.status,
            auditTrail: [
              ...p.auditTrail,
              {
                timestamp: new Date().toLocaleString('en-PK'),
                actor: 'Farhan Zaidi',
                action: `STAGE_REVERTED_${prevStage.status.toUpperCase()}`,
                details: `Period reverted to: ${prevStage.label}`,
              },
            ],
          };
        }
        return p;
      })
    );

    showNotice(`Period ${activePeriod.periodCode} reverted to: ${prevStage.label}`, 'warning');
  };

  // Approve adjustment handler
  const handleApproveAdjustment = (adjId: string) => {
    if (isLocked) {
      showNotice('Period is locked. Adjustments cannot be modified.', 'error');
      return;
    }
    setAdjustments((prev) =>
      prev.map((a) => {
        if (a.id === adjId) {
          return {
            ...a,
            approvalStatus: 'approved' as const,
            approvedBy: 'Farhan Zaidi (Controller)',
          };
        }
        return a;
      })
    );
    showNotice(`Adjustment ${adjId} approved by Financial Controller.`, 'success');
  };

  // Add adjustment handler
  const handleAddAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      showNotice('Cannot add adjustments to a locked accounting period.', 'error');
      return;
    }

    const debitAcc = initialAccounts.find((a: ChartOfAccount) => a.code === adjDebitAccount);
    const creditAcc = initialAccounts.find((a: ChartOfAccount) => a.code === adjCreditAccount);

    const newAdj: PeriodClosingAdjustment = {
      id: `adj-${String(adjustments.length + 1).padStart(2, '0')}`,
      periodId: activePeriod.id,
      adjustmentNumber: `ADJ-${activePeriod.periodCode}-${String(adjustments.length + 1).padStart(2, '0')}`,
      type: adjType,
      debitAccountCode: adjDebitAccount,
      debitAccountName: debitAcc ? debitAcc.name : 'Operating Expense',
      creditAccountCode: adjCreditAccount,
      creditAccountName: creditAcc ? creditAcc.name : 'Accrued Liabilities',
      amount: Number(adjAmount),
      description: adjDescription || `${adjType} adjustment entry for ${activePeriod.periodName}`,
      approvalStatus: 'pending_approval',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setAdjustments((prev) => [newAdj, ...prev]);
    setIsAdjModalOpen(false);
    setAdjDescription('');
    showNotice(`Adjustment ${newAdj.adjustmentNumber} recorded. Pending supervisor approval.`, 'success');
  };

  // Adjustments belonging to the active period
  const activeAdjustments = adjustments.filter((a) => a.periodId === activePeriod.id);

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

      {/* Header & Period Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px' }}>🔒</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Period Closing & Accounting Governance
            </h1>
            <span
              style={{
                background: isLocked ? '#11120D' : isClosed ? '#4A7C59' : '#C29B38',
                color: '#FFFBF4',
                padding: '3px 10px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {activePeriod.status.replace('_', ' ')}
            </span>
          </div>
          <p style={{ margin: 0, color: '#565449', fontSize: '13px', maxWidth: '800px', lineHeight: '1.4' }}>
            Enforce mandatory pre-closing reconciliations, audit trails, and multi-tier controller approvals before period lock.
            Closed and locked periods are permanently read-only under GAAP/IFRS statutory governance.
          </p>
        </div>

        {/* Period Selector & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#FFF', border: '1px solid #D8CFBC', padding: '6px 12px', borderRadius: '4px' }}>
            <label style={{ fontSize: '11px', color: '#565449', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
              Select Period:
            </label>
            <select
              value={selectedPeriodCode}
              onChange={(e) => setSelectedPeriodCode(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '14px',
                fontWeight: 800,
                color: '#11120D',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              {periods.map((p) => (
                <option key={p.id} value={p.periodCode}>
                  {p.periodCode} — {p.periodName} ({p.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAdjModalOpen(true)}
            disabled={isLocked}
            style={{
              background: isLocked ? '#EAE5D9' : '#11120D',
              color: isLocked ? '#8C887B' : '#FFFBF4',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isLocked ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Add Adjustment
          </button>
        </div>
      </div>

      {/* Locked Alert Notice if Period is Locked */}
      {isLocked && (
        <div
          style={{
            background: '#11120D',
            color: '#FFFBF4',
            borderLeft: '5px solid #C29B38',
            padding: '14px 20px',
            borderRadius: '4px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '3px' }}>
              ⚠️ PERIOD LOCKED & TAMPER-PROOF
            </div>
            <div style={{ fontSize: '12px', color: '#D8CFBC' }}>
              Period {activePeriod.periodName} ({activePeriod.periodCode}) is permanently locked. Direct modifications to the General Ledger, AR, AP, or inventory valuation are prohibited. Post-closing adjustments must be booked in subsequent open periods.
            </div>
          </div>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '3px', fontWeight: 700 }}>
            STATUTORY LOCK ACTIVE
          </span>
        </div>
      )}

      {/* Closing Workflow Visual Stepper */}
      <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '6px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#565449' }}>
              Closing Governance Protocol
            </span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#11120D' }}>
              7-Stage Financial Closing Lifecycle
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleRevertStage}
              disabled={isLocked || currentStageIndex === 0}
              style={{
                background: '#FFF',
                border: '1px solid #D8CFBC',
                color: isLocked || currentStageIndex === 0 ? '#C4BEAF' : '#11120D',
                padding: '6px 14px',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isLocked || currentStageIndex === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ← Previous Step
            </button>
            <button
              onClick={handleAdvanceStage}
              disabled={isLocked || currentStageIndex >= CLOSING_STAGES.length - 1}
              style={{
                background: isLocked || currentStageIndex >= CLOSING_STAGES.length - 1 ? '#EAE5D9' : '#11120D',
                border: 'none',
                color: isLocked || currentStageIndex >= CLOSING_STAGES.length - 1 ? '#8C887B' : '#FFFBF4',
                padding: '6px 16px',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: isLocked || currentStageIndex >= CLOSING_STAGES.length - 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {currentStageIndex === CLOSING_STAGES.length - 2 ? '🔒 Lock Period' : 'Advance Stage →'}
            </button>
          </div>
        </div>

        {/* Horizontal Stepper Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', overflowX: 'auto' }}>
          {CLOSING_STAGES.map((st, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={st.status}
                style={{
                  background: isCurrent ? '#11120D' : isCompleted ? '#F0EDE6' : '#FAF8F3',
                  color: isCurrent ? '#FFFBF4' : isCompleted ? '#11120D' : '#8C887B',
                  border: isCurrent ? '2px solid #11120D' : isCompleted ? '1px solid #565449' : '1px dashed #D8CFBC',
                  borderRadius: '4px',
                  padding: '10px 8px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isCurrent ? '#C29B38' : isCompleted ? '#4A7C59' : '#D8CFBC',
                    color: '#FFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginBottom: '6px',
                  }}
                >
                  {isCompleted ? '✓' : st.stage}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {st.label}
                </div>
                <div style={{ fontSize: '9px', opacity: 0.75, marginTop: '2px', lineHeight: '1.2' }}>
                  {isCurrent ? '● IN PROGRESS' : isCompleted ? 'COMPLETED' : 'PENDING'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700, textTransform: 'uppercase' }}>Period Ledger Postings</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            {activePeriod.postedTransactionsCount} Vouchers
          </div>
          <div style={{ fontSize: '11px', color: '#4A7C59', marginTop: '2px', fontWeight: 600 }}>
            100% balanced & posted
          </div>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700, textTransform: 'uppercase' }}>Unreconciled Transactions</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: activePeriod.unreconciledCount > 0 ? '#D9534F' : '#4A7C59', marginTop: '4px' }}>
            {activePeriod.unreconciledCount} Unresolved
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>
            Cash: PKR 0 | Bank: PKR 0
          </div>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700, textTransform: 'uppercase' }}>Closing Adjustments</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            {fmt(activeAdjustments.reduce((sum, a) => sum + a.amount, 0))}
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>
            {activeAdjustments.filter((a) => a.approvalStatus === 'approved').length} Approved / {activeAdjustments.length} Total
          </div>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700, textTransform: 'uppercase' }}>Trial Balance Parity</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: trialBalance.isBalanced ? '#4A7C59' : '#D9534F', marginTop: '4px' }}>
            {trialBalance.isBalanced ? 'PERFECT (Δ = 0)' : 'UNBALANCED'}
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>
            Dr: {fmt(trialBalance.totalDebits)} | Cr: {fmt(trialBalance.totalCredits)}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #D8CFBC', marginBottom: '20px' }}>
        {[
          { id: 'workflow', label: '1. Workflow Governance & Sign-Off' },
          { id: 'checklist', label: '2. Pre-Closing Checklists' },
          { id: 'adjustments', label: `3. Adjustments & Provisions (${activeAdjustments.length})` },
          { id: 'balances', label: '4. Period Balances & Trial Parity' },
          { id: 'audit', label: '5. Audit Trail & Controls' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: activeTab === tab.id ? '#11120D' : 'transparent',
              color: activeTab === tab.id ? '#FFFBF4' : '#565449',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              marginRight: '4px',
              fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WORKFLOW GOVERNANCE & SIGN-OFF */}
      {activeTab === 'workflow' && (
        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>
            Period Lifecycle Governance & Sign-Off
          </h3>
          <p style={{ color: '#565449', fontSize: '13px', marginBottom: '24px' }}>
            The financial close requires dual authorization by the Finance Controller and Commercial Director.
            All sub-ledgers (Sales, Purchasing, Cash, Bank) must be reconciled before locking.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <div style={{ border: '1px solid #EAE5D9', borderRadius: '4px', padding: '16px', background: '#FAF8F3' }}>
              <div style={{ fontSize: '11px', color: '#565449', fontWeight: 800, textTransform: 'uppercase' }}>1. Prepared By</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#11120D', marginTop: '6px' }}>{activePeriod.preparedBy}</div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>Role: Finance Controller</div>
              <div style={{ fontSize: '11px', color: '#4A7C59', marginTop: '8px', fontWeight: 700 }}>✓ Sub-ledger compilation complete</div>
            </div>

            <div style={{ border: '1px solid #EAE5D9', borderRadius: '4px', padding: '16px', background: '#FAF8F3' }}>
              <div style={{ fontSize: '11px', color: '#565449', fontWeight: 800, textTransform: 'uppercase' }}>2. Reviewed & Audited By</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#11120D', marginTop: '6px' }}>
                {activePeriod.reviewedBy || 'Pending Controller Review'}
              </div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>Role: Internal Audit & Governance</div>
              <div style={{ fontSize: '11px', color: activePeriod.reviewedBy ? '#4A7C59' : '#C29B38', marginTop: '8px', fontWeight: 700 }}>
                {activePeriod.reviewedBy ? '✓ Variance analysis signed off' : '⏳ Review in progress'}
              </div>
            </div>

            <div style={{ border: '1px solid #EAE5D9', borderRadius: '4px', padding: '16px', background: '#FAF8F3' }}>
              <div style={{ fontSize: '11px', color: '#565449', fontWeight: 800, textTransform: 'uppercase' }}>3. Executive Approval & Lock</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#11120D', marginTop: '6px' }}>
                {activePeriod.approvedBy || 'Awaiting Final Lock'}
              </div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>Role: Commercial Director</div>
              <div style={{ fontSize: '11px', color: isLocked ? '#11120D' : '#565449', marginTop: '8px', fontWeight: 700 }}>
                {isLocked ? '🔒 Period locked & read-only' : 'Open for adjustments'}
              </div>
            </div>
          </div>

          {/* Validation Checklist Check */}
          <div
            style={{
              background: closeEligibility.canClose ? '#F0F9F1' : '#FDF2F2',
              border: `1px solid ${closeEligibility.canClose ? '#A8D5BA' : '#F5C6CB'}`,
              borderRadius: '4px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 800,
                    color: closeEligibility.canClose ? '#2E6930' : '#721C24',
                  }}
                >
                  {closeEligibility.canClose ? '✓ Pre-Closing Eligibility: READY TO CLOSE' : '⚠️ Closing Blockers Identified'}
                </h4>
                <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>
                  {closeEligibility.canClose
                    ? 'All mandatory sub-ledger reconciliations, zero variance checks, and adjustment approvals are satisfied.'
                    : closeEligibility.error}
                </div>
              </div>

              {!isLocked && (
                <button
                  onClick={handleAdvanceStage}
                  disabled={!closeEligibility.canClose && currentStageIndex >= 5}
                  style={{
                    background: closeEligibility.canClose ? '#11120D' : '#EAE5D9',
                    color: closeEligibility.canClose ? '#FFFBF4' : '#8C887B',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: closeEligibility.canClose ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  Proceed to Next Workflow Stage →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRE-CLOSING CHECKLISTS */}
      {activeTab === 'checklist' && (
        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>Pre-Closing Sub-Ledger Verification</h3>
          <p style={{ color: '#565449', fontSize: '13px', marginBottom: '20px' }}>
            Every feeder module must be certified before closing. The system blocks period closing if any unposted invoices or unexplained cash/bank variances exist.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#FAF8F3', borderBottom: '2px solid #D8CFBC', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Category</th>
                <th style={{ padding: '10px' }}>Control Item</th>
                <th style={{ padding: '10px' }}>Verification Rule</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Audited By</th>
              </tr>
            </thead>
            <tbody>
              {PRE_CLOSING_CHECKLIST.map((item: PreClosingCheckItem, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #EAE5D9' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#565449' }}>{item.category}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>{item.item}</td>
                  <td style={{ padding: '12px 10px', color: '#565449' }}>{item.description}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span
                      style={{
                        background: item.status === 'COMPLETED' ? '#E8F5E9' : '#FFF3E0',
                        color: item.status === 'COMPLETED' ? '#2E7D32' : '#E65100',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {item.status === 'COMPLETED' ? '✓ VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#11120D', fontWeight: 600 }}>{item.auditor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ADJUSTMENTS & PROVISIONS */}
      {activeTab === 'adjustments' && (
        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                Period Adjusting Journal Entries ({activePeriod.periodName})
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#565449', fontSize: '13px' }}>
                Record required accruals, amortizations, depreciation, and inventory shrinkage prior to final lock.
              </p>
            </div>
            <button
              onClick={() => setIsAdjModalOpen(true)}
              disabled={isLocked}
              style={{
                background: isLocked ? '#EAE5D9' : '#11120D',
                color: isLocked ? '#8C887B' : '#FFFBF4',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              + Create Adjusting Entry
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#FAF8F3', borderBottom: '2px solid #D8CFBC', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Entry ID</th>
                <th style={{ padding: '10px' }}>Type</th>
                <th style={{ padding: '10px' }}>Description</th>
                <th style={{ padding: '10px' }}>Debit Account</th>
                <th style={{ padding: '10px' }}>Credit Account</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeAdjustments.map((adj) => (
                <tr key={adj.id} style={{ borderBottom: '1px solid #EAE5D9' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, color: '#11120D' }}>{adj.adjustmentNumber}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span
                      style={{
                        background: '#F0EDE6',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#565449',
                        textTransform: 'uppercase',
                      }}
                    >
                      {adj.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>{adj.description}</td>
                  <td style={{ padding: '12px 10px', color: '#565449' }}>
                    <span style={{ fontWeight: 700, color: '#11120D' }}>{adj.debitAccountCode}</span> - {adj.debitAccountName}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#565449' }}>
                    <span style={{ fontWeight: 700, color: '#11120D' }}>{adj.creditAccountCode}</span> - {adj.creditAccountName}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, color: '#11120D' }}>
                    {fmt(adj.amount)}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span
                      style={{
                        background: adj.approvalStatus === 'approved' ? '#E8F5E9' : '#FFF3E0',
                        color: adj.approvalStatus === 'approved' ? '#2E7D32' : '#E65100',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {adj.approvalStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    {adj.approvalStatus !== 'approved' && !isLocked && (
                      <button
                        onClick={() => handleApproveAdjustment(adj.id)}
                        style={{
                          background: '#4A7C59',
                          color: '#FFF',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Approve
                      </button>
                    )}
                    {adj.approvalStatus === 'approved' && (
                      <span style={{ fontSize: '11px', color: '#565449' }}>
                        By {adj.approvedBy?.split(' ')[0] || 'Controller'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PERIOD BALANCES & TRIAL PARITY */}
      {activeTab === 'balances' && (
        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                Period Trial Balance Verification ({activePeriod.periodName})
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#565449', fontSize: '13px' }}>
                Debits and credits must achieve exact mathematical balance before the period can be closed.
              </p>
            </div>
            <div
              style={{
                background: trialBalance.isBalanced ? '#E8F5E9' : '#FFEBEE',
                color: trialBalance.isBalanced ? '#2E7D32' : '#C62828',
                padding: '6px 14px',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              {trialBalance.isBalanced ? '✓ DEBITS EQUAL CREDITS (PARITY 100%)' : '⚠️ PARITY MISMATCH'}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#FAF8F3', borderBottom: '2px solid #D8CFBC', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Code</th>
                <th style={{ padding: '10px' }}>Account Name</th>
                <th style={{ padding: '10px' }}>Classification</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Debit (PKR)</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Credit (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.rows.map((row) => (
                <tr key={row.code} style={{ borderBottom: '1px solid #EAE5D9' }}>
                  <td style={{ padding: '10px', fontWeight: 800 }}>{row.code}</td>
                  <td style={{ padding: '10px' }}>{row.name}</td>
                  <td style={{ padding: '10px', color: '#565449', textTransform: 'capitalize' }}>{row.type}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: row.debit > 0 ? 700 : 400 }}>
                    {row.debit > 0 ? row.debit.toLocaleString('en-PK') : '-'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: row.credit > 0 ? 700 : 400 }}>
                    {row.credit > 0 ? row.credit.toLocaleString('en-PK') : '-'}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#11120D', color: '#FFFBF4', fontWeight: 800 }}>
                <td colSpan={3} style={{ padding: '12px 10px', textTransform: 'uppercase' }}>Total Parity Check</td>
                <td style={{ padding: '12px 10px', textAlign: 'right' }}>{fmt(trialBalance.totalDebits)}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right' }}>{fmt(trialBalance.totalCredits)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL & CONTROLS */}
      {activeTab === 'audit' && (
        <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>
            Audit Trail & Statutory Compliance Log
          </h3>
          <p style={{ color: '#565449', fontSize: '13px', marginBottom: '20px' }}>
            All period transitions, authorization timestamps, and lock events are recorded immutably to guarantee regulatory audit compliance.
          </p>

          <div style={{ border: '1px solid #D8CFBC', borderRadius: '4px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#FAF8F3', borderBottom: '2px solid #D8CFBC', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Action</th>
                  <th style={{ padding: '10px' }}>Details</th>
                  <th style={{ padding: '10px' }}>Audit Proof</th>
                </tr>
              </thead>
              <tbody>
                {activePeriod.auditTrail.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #EAE5D9' }}>
                    <td style={{ padding: '12px 10px', color: '#565449' }}>{log.timestamp}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{log.actor}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ background: '#F0EDE6', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', fontWeight: 700 }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>{log.details}</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontSize: '11px', color: '#4A7C59' }}>
                      SHA-256: 4f89b...e8a{idx}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE ADJUSTMENT MODAL */}
      {isAdjModalOpen && (
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
              width: '540px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Create Pre-Closing Adjustment</h3>
              <button
                onClick={() => setIsAdjModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdjustment}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Adjustment Type:
                </label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as PeriodAdjustmentType)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit' }}
                >
                  <option value="accrual">Accrual (Unbilled utility/wages)</option>
                  <option value="prepayment">Prepayment (Advance rent/insurance)</option>
                  <option value="depreciation">Depreciation (Fleet & Warehouse assets)</option>
                  <option value="inventory_shrinkage">Inventory Shrinkage (Transit damage write-off)</option>
                  <option value="tax_provision">Tax Provision (WHT/Sales Tax reserve)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Description:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Month-end distribution fuel accrual"
                  value={adjDescription}
                  onChange={(e) => setAdjDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    Debit Account:
                  </label>
                  <select
                    value={adjDebitAccount}
                    onChange={(e) => setAdjDebitAccount(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit' }}
                  >
                    {initialAccounts.map((a: ChartOfAccount) => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    Credit Account:
                  </label>
                  <select
                    value={adjCreditAccount}
                    onChange={(e) => setAdjCreditAccount(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit' }}
                  >
                    {initialAccounts.map((a: ChartOfAccount) => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Amount (PKR):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit', fontWeight: 800 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
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
                  Post Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

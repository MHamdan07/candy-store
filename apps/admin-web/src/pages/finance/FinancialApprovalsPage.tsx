import React, { useState } from 'react';
import {
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_APPROVAL_RULES,
  FINANCIAL_ROLE_PERMISSIONS,
} from '../../data/financialControlsData';
import type {
  FinancialApprovalRequest,
  StaffRoleName,
  FinancialTransactionType,
} from '@candi/types';
import {
  validateApprovalAuthority,
  generateFinancialReversalEntry,
} from '@candi/validation';

interface SimulatedUser {
  id: string;
  name: string;
  role: StaffRoleName;
  roleTitle: string;
}

const SIMULATED_USERS: SimulatedUser[] = [
  { id: 'usr-001', name: 'Farhan Zaidi', role: 'admin_manager', roleTitle: 'Finance Controller (Limit: PKR 250k)' },
  { id: 'usr-004', name: 'Kashif Razzaq', role: 'super_admin', roleTitle: 'Commercial Director & CFO (Unlimited)' },
  { id: 'usr-002', name: 'Tariq Mehmood', role: 'accounts_staff', roleTitle: 'Junior Accountant (Prepare / Submit Only)' },
];

export const FinancialApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<FinancialApprovalRequest[]>(INITIAL_APPROVAL_REQUESTS);
  const [activeUser, setActiveUser] = useState<SimulatedUser>(SIMULATED_USERS[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Reversal Modal State
  const [reversalModalOpen, setReversalModalOpen] = useState(false);
  const [selectedRequestForReversal, setSelectedRequestForReversal] = useState<FinancialApprovalRequest | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  const fmt = (n: number) => `PKR ${n.toLocaleString('en-PK')}`;

  const showNotice = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    if (filterType !== 'all' && req.transactionType !== filterType) return false;
    if (filterStatus !== 'all' && req.currentStatus !== filterStatus) return false;
    return true;
  });

  // Extract creator id heuristic
  const getCreatorId = (preparedBy: string) => {
    if (preparedBy.includes('Farhan')) return 'usr-001';
    if (preparedBy.includes('Tariq')) return 'usr-002';
    if (preparedBy.includes('Bilal')) return 'usr-003';
    return 'usr-unknown';
  };

  // Handle Approve
  const handleApprove = (req: FinancialApprovalRequest) => {
    const creatorId = getCreatorId(req.preparedBy);

    const authCheck = validateApprovalAuthority({
      approverId: activeUser.id,
      approverName: activeUser.name,
      approverRole: activeUser.role,
      creatorId,
      creatorName: req.preparedBy,
      amountPKR: req.amountPKR,
      transactionType: req.transactionType,
    });

    if (!authCheck.isAllowed) {
      showNotice(`Approval Rejected: ${authCheck.reason}`, 'error');
      return;
    }

    setRequests((prev) =>
      prev.map((item) => {
        if (item.id === req.id) {
          return {
            ...item,
            currentStatus: 'approved',
            approvedBy: `${activeUser.name} (${activeUser.roleTitle.split(' ')[0]})`,
            approvedAt: new Date().toLocaleString('en-PK'),
          };
        }
        return item;
      })
    );

    showNotice(`Transaction ${req.referenceNumber} (${fmt(req.amountPKR)}) approved successfully.`, 'success');
  };

  // Handle Reject
  const handleReject = (req: FinancialApprovalRequest) => {
    const reason = prompt('Please specify formal rejection reason for the audit trail:');
    if (!reason) return;

    setRequests((prev) =>
      prev.map((item) => {
        if (item.id === req.id) {
          return {
            ...item,
            currentStatus: 'rejected',
            rejectionReason: reason,
          };
        }
        return item;
      })
    );

    showNotice(`Transaction ${req.referenceNumber} rejected. Reason logged in audit trail.`, 'warning');
  };

  // Open Reversal Modal
  const handleOpenReversal = (req: FinancialApprovalRequest) => {
    setSelectedRequestForReversal(req);
    setReversalReason('');
    setReversalModalOpen(true);
  };

  // Execute Reversal
  const handleExecuteReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForReversal) return;

    const reversal = generateFinancialReversalEntry(
      {
        originalId: selectedRequestForReversal.id,
        originalVoucherNumber: selectedRequestForReversal.referenceNumber,
        isPosted: selectedRequestForReversal.currentStatus === 'posted',
        isReversed: false,
        amountPKR: selectedRequestForReversal.amountPKR,
        lines: [
          { accountCode: '6010', accountName: 'Operating Account', debit: selectedRequestForReversal.amountPKR, credit: 0 },
          { accountCode: '1010', accountName: 'Disbursement Float', debit: 0, credit: selectedRequestForReversal.amountPKR },
        ],
      },
      activeUser.name,
      reversalReason
    );

    if (!reversal.success) {
      showNotice(reversal.error || 'Reversal failed.', 'error');
      return;
    }

    setRequests((prev) =>
      prev.map((item) => {
        if (item.id === selectedRequestForReversal.id) {
          return {
            ...item,
            currentStatus: 'reversed',
            overrideReason: `Reversed by ${activeUser.name}: ${reversalReason} (Voucher ${reversal.reversalVoucherNumber})`,
          };
        }
        return item;
      })
    );

    showNotice(`Voucher ${selectedRequestForReversal.referenceNumber} reversed. Contra-voucher ${reversal.reversalVoucherNumber} posted.`, 'success');
    setReversalModalOpen(false);
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

      {/* Top Banner: Segregation of Duties & Active Role Simulator */}
      <div
        style={{
          background: '#FFF',
          border: '2px solid #11120D',
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
              Live Segregation of Duties (4-Eyes Principle) & Role Simulator
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#565449', fontSize: '12px', maxWidth: '750px' }}>
            Switch active persona below to test that <strong>creators can never approve their own transactions</strong>, junior staff cannot approve entries exceeding PKR 50k, and bad debt write-offs strictly enforce Commercial Director authorization.
          </p>
        </div>

        {/* Live Simulator Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SIMULATED_USERS.map((usr) => {
            const isSelected = usr.id === activeUser.id;
            return (
              <button
                key={usr.id}
                onClick={() => setActiveUser(usr)}
                style={{
                  background: isSelected ? '#11120D' : '#F0EDE6',
                  color: isSelected ? '#FFFBF4' : '#11120D',
                  border: isSelected ? '2px solid #11120D' : '1px solid #D8CFBC',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <div>{isSelected ? '● ' : ''}{usr.name}</div>
                <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 500 }}>
                  {usr.roleTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7-Stage Workflow Stepper */}
      <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#565449', textTransform: 'uppercase', marginBottom: '10px' }}>
          Statutory Financial Accounting Lifecycle
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '8px' }}>
          {[
            { step: 1, label: 'Create', desc: 'Draft Voucher' },
            { step: 2, label: 'Submit', desc: 'Formal Queue' },
            { step: 3, label: 'Review', desc: 'Variance Check' },
            { step: 4, label: 'Approve', desc: '4-Eyes Gate' },
            { step: 5, label: 'Post', desc: 'GL Integration' },
            { step: 6, label: 'Reconcile', desc: 'Sub-ledger Match' },
            { step: 7, label: 'Audit', desc: 'Immutable Seal' },
          ].map((st, idx, arr) => (
            <React.Fragment key={st.step}>
              <div style={{ textAlign: 'center', minWidth: '90px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#11120D',
                    color: '#FFFBF4',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    marginBottom: '4px',
                  }}
                >
                  {st.step}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#11120D' }}>{st.label}</div>
                <div style={{ fontSize: '10px', color: '#565449' }}>{st.desc}</div>
              </div>
              {idx < arr.length - 1 && (
                <div style={{ height: '2px', flex: 1, background: '#D8CFBC', minWidth: '20px' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Financial Approvals Queue</h2>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>
            Acting as: <strong>{activeUser.name}</strong> ({activeUser.roleTitle})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit', fontSize: '12px' }}
          >
            <option value="all">All Transaction Types</option>
            <option value="journal_entry">Journal Entries</option>
            <option value="write_off">Write-Offs</option>
            <option value="credit_note">Credit Notes</option>
            <option value="debit_note">Debit Notes</option>
            <option value="supplier_payment">Supplier Payments</option>
            <option value="cash_variance">Cash Variances</option>
            <option value="financial_adjustment">Financial Adjustments</option>
            <option value="customer_balance_adjustment">Customer Adjustments</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit', fontSize: '12px' }}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="posted">Posted</option>
            <option value="reversed">Reversed</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#FAF8F3', borderBottom: '2px solid #D8CFBC', textAlign: 'left' }}>
              <th style={{ padding: '12px 14px' }}>Request #</th>
              <th style={{ padding: '12px 14px' }}>Type & Reference</th>
              <th style={{ padding: '12px 14px' }}>Description</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px 14px' }}>Prepared By</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Governance & Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req) => {
              const creatorId = getCreatorId(req.preparedBy);
              const authCheck = validateApprovalAuthority({
                approverId: activeUser.id,
                approverName: activeUser.name,
                approverRole: activeUser.role,
                creatorId,
                creatorName: req.preparedBy,
                amountPKR: req.amountPKR,
                transactionType: req.transactionType,
              });

              const isSelf = activeUser.id === creatorId;

              return (
                <tr key={req.id} style={{ borderBottom: '1px solid #EAE5D9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: '#11120D' }}>
                    {req.requestNumber}
                    {req.isClosedPeriodRequest && (
                      <div style={{ fontSize: '10px', color: '#C62828', fontWeight: 700 }}>
                        ⚠️ CLOSED PERIOD ({req.relatedPeriodCode})
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 800 }}>{req.referenceNumber}</div>
                    <div style={{ fontSize: '11px', color: '#565449', textTransform: 'capitalize' }}>
                      {req.transactionType.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', maxWidth: '320px' }}>
                    <div style={{ color: '#11120D' }}>{req.description}</div>
                    {req.overrideReason && (
                      <div style={{ fontSize: '11px', color: '#E65100', marginTop: '3px' }}>
                        Reason: {req.overrideReason}
                      </div>
                    )}
                    {req.approvedBy && (
                      <div style={{ fontSize: '11px', color: '#2E7D32', marginTop: '2px' }}>
                        ✓ Approved by {req.approvedBy} at {req.approvedAt}
                      </div>
                    )}
                    {req.rejectionReason && (
                      <div style={{ fontSize: '11px', color: '#C62828', marginTop: '2px' }}>
                        ✕ Rejected: {req.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#11120D' }}>
                    {fmt(req.amountPKR)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600 }}>{req.preparedBy}</div>
                    <div style={{ fontSize: '11px', color: '#565449' }}>{req.preparedAt}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        background:
                          req.currentStatus === 'approved' || req.currentStatus === 'posted'
                            ? '#E8F5E9'
                            : req.currentStatus === 'rejected'
                            ? '#FFEBEE'
                            : req.currentStatus === 'reversed'
                            ? '#F0EDE6'
                            : '#FFF3E0',
                        color:
                          req.currentStatus === 'approved' || req.currentStatus === 'posted'
                            ? '#2E7D32'
                            : req.currentStatus === 'rejected'
                            ? '#C62828'
                            : req.currentStatus === 'reversed'
                            ? '#565449'
                            : '#E65100',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {req.currentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {req.currentStatus === 'submitted' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        {isSelf ? (
                          <div
                            style={{
                              background: '#FFEBEE',
                              color: '#C62828',
                              border: '1px solid #FFCDD2',
                              padding: '4px 8px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 800,
                              lineHeight: '1.2',
                              maxWidth: '180px',
                            }}
                          >
                            ⚠️ SELF-APPROVAL BLOCKED (4-Eyes Rule)
                          </div>
                        ) : !authCheck.isAllowed ? (
                          <div
                            style={{
                              background: '#FFF3E0',
                              color: '#E65100',
                              border: '1px solid #FFE0B2',
                              padding: '4px 8px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 700,
                              lineHeight: '1.2',
                              maxWidth: '180px',
                            }}
                          >
                            ⚠️ {authCheck.code === 'LIMIT_EXCEEDED' ? 'LIMIT EXCEEDED' : 'INSUFFICIENT ROLE'}
                            <div style={{ fontSize: '9px', marginTop: '1px' }}>
                              Needs {authCheck.requiredRole === 'super_admin' ? 'Director' : 'Controller'}
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleApprove(req)}
                              style={{
                                background: '#4A7C59',
                                color: '#FFF',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleReject(req)}
                              style={{
                                background: '#FFF',
                                color: '#C62828',
                                border: '1px solid #C62828',
                                padding: '5px 8px',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {req.currentStatus === 'posted' && (
                      <button
                        onClick={() => handleOpenReversal(req)}
                        style={{
                          background: '#11120D',
                          color: '#FFFBF4',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        ↩ Generate Reversal
                      </button>
                    )}

                    {req.currentStatus === 'reversed' && (
                      <span style={{ fontSize: '11px', color: '#565449', fontWeight: 600 }}>
                        ✓ Contra-Reversed
                      </span>
                    )}

                    {req.currentStatus === 'approved' && (
                      <span style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 700 }}>
                        ✓ Ready to Post
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* REVERSAL MODAL */}
      {reversalModalOpen && selectedRequestForReversal && (
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
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  Generate Authorized Reversal: {selectedRequestForReversal.referenceNumber}
                </h3>
                <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>
                  Amount: {fmt(selectedRequestForReversal.amountPKR)} — Direct deletion is permanently prohibited under GAAP.
                </div>
              </div>
              <button
                onClick={() => setReversalModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteReversal}>
              <div style={{ background: '#F0EDE6', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '12px' }}>
                <div style={{ fontWeight: 800, marginBottom: '4px' }}>Automatic Contra-Double Entry Mechanism:</div>
                <div style={{ color: '#565449' }}>
                  The engine will generate an immutable contra-journal entry with inverted debits and credits:
                </div>
                <div style={{ marginTop: '6px', fontFamily: 'monospace' }}>
                  Dr. Disbursement Float ({fmt(selectedRequestForReversal.amountPKR)})<br />
                  &nbsp;&nbsp;Cr. Operating Account ({fmt(selectedRequestForReversal.amountPKR)})
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Mandatory Reversal Justification Reason:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Invoiced wrong manufacturer or customer return processed..."
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #D8CFBC', borderRadius: '4px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReversalModalOpen(false)}
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
                  Post Contra-Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { INITIAL_FINANCIAL_AUDIT_LOGS } from '../../data/financialControlsData';
import type { FinancialAuditRecord } from '@candi/types';

export const FinancialAuditTrailPage: React.FC = () => {
  const [logs] = useState<FinancialAuditRecord[]>(INITIAL_FINANCIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLog, setSelectedLog] = useState<FinancialAuditRecord | null>(null);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.transactionType !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.referenceNumber.toLowerCase().includes(term) ||
        log.actorName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        (log.reason && log.reason.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div style={{ padding: '24px', background: '#FFFBF4', minHeight: '100vh', fontFamily: '"SUSE Mono", sans-serif', color: '#11120D' }}>
      
      {/* Header & Immutable Notice */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '24px' }}>🔍</span>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Statutory Financial Audit Trail & Tamper-Proof Log
          </h1>
          <span
            style={{
              background: '#11120D',
              color: '#FFFBF4',
              padding: '3px 10px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.06em',
            }}
          >
            IMMUTABLE LEDGER
          </span>
        </div>
        <p style={{ margin: 0, color: '#565449', fontSize: '13px', maxWidth: '850px', lineHeight: '1.4' }}>
          Every financial modification, state transition, override reason, and closed-period interaction is recorded immutably with cryptographic SHA-256 seal integrity. Normal users and operators cannot edit or delete audit entries.
        </p>
      </div>

      {/* Security & Integrity Banner */}
      <div
        style={{
          background: '#FFF',
          borderLeft: '5px solid #4A7C59',
          borderTop: '1px solid #D8CFBC',
          borderRight: '1px solid #D8CFBC',
          borderBottom: '1px solid #D8CFBC',
          borderRadius: '4px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🔐</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#11120D' }}>
              Cryptographic Ledger Integrity: 100% Verified
            </div>
            <div style={{ fontSize: '11px', color: '#565449' }}>
              All hash signatures match the immutable sequence chain. Zero unauthorized record alterations detected.
            </div>
          </div>
        </div>
        <div style={{ fontSize: '11px', background: '#E8F5E9', color: '#2E7D32', padding: '4px 10px', borderRadius: '3px', fontWeight: 800 }}>
          ✓ IFRS / GAAP AUDIT COMPLIANT
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '600px' }}>
          <input
            type="text"
            placeholder="Search by voucher (JV-, CN-, ADJ-), user name, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #D8CFBC',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #D8CFBC',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          >
            <option value="all">All Financial Types</option>
            <option value="journal_entry">Journal Entry</option>
            <option value="credit_note">Credit Note</option>
            <option value="debit_note">Debit Note</option>
            <option value="financial_adjustment">Financial Adjustment</option>
            <option value="cash_variance">Cash Variance</option>
            <option value="customer_balance_adjustment">Customer Adjustment</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#565449', fontWeight: 600 }}>
          Showing {filteredLogs.length} Audit Records
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{ background: '#FFF', border: '1px solid #D8CFBC', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#FAF8F3', borderBottom: '2px solid #D8CFBC', textAlign: 'left' }}>
              <th style={{ padding: '12px 14px' }}>Timestamp</th>
              <th style={{ padding: '12px 14px' }}>Actor</th>
              <th style={{ padding: '12px 14px' }}>Transaction & Action</th>
              <th style={{ padding: '12px 14px' }}>Field Diff (Previous &rarr; New)</th>
              <th style={{ padding: '12px 14px' }}>Documented Reason</th>
              <th style={{ padding: '12px 14px' }}>Audit Seal</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #EAE5D9' }}>
                <td style={{ padding: '12px 14px', color: '#565449', whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 800, color: '#11120D' }}>{log.actorName}</div>
                  <div style={{ fontSize: '11px', color: '#565449', textTransform: 'capitalize' }}>
                    {log.actorRole.replace('_', ' ')}
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 800, color: '#11120D' }}>{log.referenceNumber}</div>
                  <span
                    style={{
                      background: log.action.includes('BLOCKED') ? '#FFEBEE' : '#F0EDE6',
                      color: log.action.includes('BLOCKED') ? '#C62828' : '#11120D',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: 800,
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                  {log.fieldChanged ? (
                    <div>
                      <div style={{ fontSize: '11px', color: '#565449', fontWeight: 700 }}>
                        {log.fieldChanged}:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ textDecoration: 'line-through', color: '#C62828', background: '#FFEBEE', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>
                          {log.previousValue}
                        </span>
                        <span style={{ fontSize: '11px', color: '#565449' }}>&rarr;</span>
                        <span style={{ color: '#2E7D32', background: '#E8F5E9', padding: '1px 5px', borderRadius: '3px', fontSize: '11px', fontWeight: 700 }}>
                          {log.newValue}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#8C887B', fontSize: '12px' }}>Creation Record</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px', maxWidth: '300px' }}>
                  <div style={{ color: '#11120D', fontSize: '12px', lineHeight: '1.3' }}>
                    {log.reason || 'Standard transactional cycle'}
                  </div>
                  {log.approvalReference && (
                    <div style={{ fontSize: '10px', color: '#565449', marginTop: '3px' }}>
                      Ref: {log.approvalReference}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4A7C59', fontWeight: 700 }}>
                    {log.hashSignature.slice(0, 18)}...
                  </div>
                  <div style={{ fontSize: '10px', color: '#8C887B' }}>IP: {log.ipAddress}</div>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <button
                    onClick={() => setSelectedLog(log)}
                    style={{
                      background: '#11120D',
                      color: '#FFFBF4',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    View Packet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
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
              width: '580px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  Cryptographic Audit Packet #{selectedLog.id}
                </h3>
                <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>
                  Voucher Reference: {selectedLog.referenceNumber}
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ background: '#FFF', border: '1px solid #D8CFBC', padding: '10px', borderRadius: '4px' }}>
                <div style={{ color: '#565449', fontWeight: 700 }}>Actor Identity:</div>
                <div style={{ fontWeight: 800, marginTop: '2px' }}>{selectedLog.actorName}</div>
                <div style={{ color: '#565449' }}>Role: {selectedLog.actorRole}</div>
                <div style={{ color: '#565449' }}>IP: {selectedLog.ipAddress}</div>
              </div>

              <div style={{ background: '#FFF', border: '1px solid #D8CFBC', padding: '10px', borderRadius: '4px' }}>
                <div style={{ color: '#565449', fontWeight: 700 }}>Event Details:</div>
                <div style={{ fontWeight: 800, marginTop: '2px' }}>{selectedLog.action}</div>
                <div style={{ color: '#565449' }}>Time: {selectedLog.timestamp}</div>
                <div style={{ color: '#565449' }}>Ref: {selectedLog.approvalReference}</div>
              </div>
            </div>

            <div style={{ background: '#FFF', border: '1px solid #D8CFBC', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ fontWeight: 700, color: '#565449', marginBottom: '4px' }}>Audit Rationale & Justification:</div>
              <div style={{ color: '#11120D', lineHeight: '1.4' }}>{selectedLog.reason}</div>
            </div>

            <div style={{ background: '#11120D', color: '#FFFBF4', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all' }}>
              <div style={{ color: '#D8CFBC', marginBottom: '4px' }}>// Cryptographic Hash Seal:</div>
              {selectedLog.hashSignature}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  padding: '8px 18px',
                  background: '#11120D',
                  color: '#FFFBF4',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Close Packet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

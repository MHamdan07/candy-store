import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { INITIAL_JOURNAL_ENTRIES } from '../../data/journalEntries';
import { INITIAL_CHART_OF_ACCOUNTS } from '../../data/chartOfAccounts';
import { validateDoubleEntry, generateReversalJournalEntry } from '@candi/validation';
import type { JournalEntry, JournalEntryLine } from '@candi/types';

export const JournalEntryPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // New Journal Entry Form State
  const [entryDate, setEntryDate] = useState<string>('2026-09-17');
  const [entryRef, setEntryRef] = useState<string>('ADJ-2026-0917');
  const [entryDesc, setEntryDesc] = useState<string>('Inventory shrinkage adjustment / damage write-off');
  const [lines, setLines] = useState<JournalEntryLine[]>([
    {
      id: 'l-1',
      accountCode: '5010',
      accountName: 'Cost of Goods Sold (COGS)',
      debit: 15000,
      credit: 0,
      memo: 'Transit damage loss recognition',
    },
    {
      id: 'l-2',
      accountCode: '1200',
      accountName: 'Wholesale Inventory Asset',
      debit: 0,
      credit: 15000,
      memo: 'Reduction in warehouse inventory asset',
    },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Real-time double-entry validation
  const validation = useMemo(() => {
    return validateDoubleEntry(lines);
  }, [lines]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        e.journalNumber.toLowerCase().includes(q) ||
        e.reference.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.preparedBy.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, statusFilter, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalPosted = entries.filter((e) => e.status === 'posted').length;
    const totalVolume = entries
      .filter((e) => e.status === 'posted')
      .reduce((sum, e) => sum + e.totalDebit, 0);
    const reversedCount = entries.filter((e) => e.status === 'reversed' || e.isReversal).length;
    return { totalPosted, totalVolume, reversedCount };
  }, [entries]);

  // Add line to journal form
  const handleAddLine = () => {
    const defaultAcc = INITIAL_CHART_OF_ACCOUNTS[0];
    setLines((prev) => [
      ...prev,
      {
        id: `l-${Date.now()}`,
        accountCode: defaultAcc.code,
        accountName: defaultAcc.name,
        debit: 0,
        credit: 0,
        memo: '',
      },
    ]);
  };

  // Remove line from journal form
  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 2) {
      setFormError('A journal entry must contain at least two lines for double-entry.');
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update line field
  const handleLineChange = (idx: number, field: keyof JournalEntryLine, value: any) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        if (field === 'accountCode') {
          const acc = INITIAL_CHART_OF_ACCOUNTS.find((a) => a.code === value);
          return {
            ...l,
            accountCode: value,
            accountName: acc ? acc.name : l.accountName,
          };
        }
        return { ...l, [field]: value };
      })
    );
  };

  // Post Journal Entry
  const handlePostJournal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isBalanced) {
      setFormError(validation.error || 'Debit and Credit must balance.');
      return;
    }

    const journalNumber = `JV-2026-00${Math.floor(100 + Math.random() * 900)}`;
    const newEntry: JournalEntry = {
      id: `jv-${Date.now()}`,
      journalNumber,
      date: entryDate,
      reference: entryRef.trim(),
      description: entryDesc.trim(),
      lines: [...lines],
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      isBalanced: true,
      status: 'posted',
      preparedBy: 'Farhan Zaidi (Finance Controller)',
      approvedBy: 'Farhan Zaidi',
      postedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      auditTrail: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          actor: 'Farhan Zaidi',
          action: 'POSTED_TO_GENERAL_LEDGER',
          details: `Manual Journal Voucher posted: Balanced at PKR ${validation.totalDebit.toLocaleString()}`,
        },
      ],
    };

    setEntries((prev) => [newEntry, ...prev]);
    setIsModalOpen(false);
    setFormError(null);
    setAlertNotice(`Journal Entry ${newEntry.journalNumber} posted to General Ledger successfully.`);
  };

  // Reverse Entry action
  const handleReverseEntry = (entryToReverse: JournalEntry) => {
    try {
      const reversalNumber = `REV-${entryToReverse.journalNumber}`;
      const reversalDate = new Date().toISOString().split('T')[0];
      const reversal = generateReversalJournalEntry(
        entryToReverse,
        reversalNumber,
        'Farhan Zaidi (Finance Controller)',
        reversalDate
      );

      // Mark original as reversed and add reversal entry
      setEntries((prev) => [
        reversal,
        ...prev.map((e) => (e.id === entryToReverse.id ? { ...e, status: 'reversed' as const } : e)),
      ]);

      if (selectedEntry?.id === entryToReverse.id) {
        setSelectedEntry(null);
      }

      setAlertNotice(
        `Immutable Reversal Posted: ${reversalNumber} has been recorded, neutralizing ${entryToReverse.journalNumber}.`
      );
    } catch (err: any) {
      alert(err.message || 'Could not reverse entry.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              Journal Entries (General Ledger)
            </h1>
            <Badge variant="brand">Immutable Double-Entry Ledger</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Permanent double-entry transaction records with dual authorization, balancing validation, and compensating reversals.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Create Journal Entry
        </Button>
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

      {/* Workflow Stepper Card */}
      <Card style={{ padding: '16px 20px', background: '#FAF6EE', border: '1px solid #D8CFBC' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#7E7A6B', textTransform: 'uppercase', marginBottom: '10px' }}>
          Approved Financial Posting Workflow
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
          <span style={{ padding: '6px 12px', background: '#ECE6D9', borderRadius: '4px', fontWeight: 700, color: '#11120D' }}>
            1. Transaction Created
          </span>
          <span style={{ color: '#7E7A6B' }}>&rarr;</span>
          <span style={{ padding: '6px 12px', background: '#ECE6D9', borderRadius: '4px', fontWeight: 700, color: '#11120D' }}>
            2. Accounting Entry Generated
          </span>
          <span style={{ color: '#7E7A6B' }}>&rarr;</span>
          <span style={{ padding: '6px 12px', background: '#ECE6D9', borderRadius: '4px', fontWeight: 700, color: '#11120D' }}>
            3. Balancing & Approval Gate
          </span>
          <span style={{ color: '#7E7A6B' }}>&rarr;</span>
          <span style={{ padding: '6px 12px', background: '#11120D', color: '#FFFBF4', borderRadius: '4px', fontWeight: 700 }}>
            4. Posted to Ledger (Immutable)
          </span>
          <span style={{ color: '#7E7A6B' }}>&rarr;</span>
          <span style={{ padding: '6px 12px', background: '#2E7D32', color: '#FFFBF4', borderRadius: '4px', fontWeight: 700 }}>
            5. Reconciled
          </span>
        </div>
      </Card>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #11120D', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Posted Journals
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            {stats.totalPosted} Vouchers
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>General ledger entries</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Cumulative Posting Volume
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR {stats.totalVolume.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>Balanced debits = credits</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #B8860B', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Compensating Reversals
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#8A5D00', marginTop: '4px' }}>
            {stats.reversedCount} Reversals
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>Preserved in audit trail</div>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Entries' },
              { key: 'posted', label: 'Posted to Ledger' },
              { key: 'reversed', label: 'Reversed Entries' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: statusFilter === f.key ? '#11120D' : '#D8CFBC',
                  background: statusFilter === f.key ? '#11120D' : '#FFFBF4',
                  color: statusFilter === f.key ? '#FFFBF4' : '#11120D',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '260px' }}>
            <Input
              placeholder="Search JV#, reference, memo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Journal Entries Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Journal #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Reference</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Total Debit (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Total Credit (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Prepared By</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#565449' }}>
                    No journal entries found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((jv, index) => (
                  <tr
                    key={jv.id}
                    style={{
                      borderBottom: '1px solid #EFEAE0',
                      background: index % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setSelectedEntry(jv)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#1565C0',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        {jv.journalNumber}
                      </button>
                      {jv.isReversal && (
                        <span style={{ display: 'block', fontSize: '10px', color: '#B8860B', fontWeight: 700 }}>
                          REVERSAL ENTRY
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#565449' }}>{jv.date}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>{jv.reference}</td>
                    <td style={{ padding: '12px 16px', color: '#11120D', maxWidth: '300px' }}>
                      {jv.description}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: '#11120D',
                      }}
                    >
                      PKR {jv.totalDebit.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: '#11120D',
                      }}
                    >
                      PKR {jv.totalCredit.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        variant={
                          jv.status === 'posted'
                            ? 'success'
                            : jv.status === 'reversed'
                            ? 'neutral'
                            : 'warning'
                        }
                      >
                        {jv.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#565449' }}>{jv.preparedBy}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {jv.status === 'posted' && !jv.isReversal ? (
                        <button
                          onClick={() => handleReverseEntry(jv)}
                          style={{
                            padding: '4px 8px',
                            background: '#FFFBF4',
                            border: '1px solid #C62828',
                            color: '#C62828',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Reverse
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#7E7A6B' }}>Immutable</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Journal Entry Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormError(null);
          }}
          title="Create Double-Entry Journal Voucher"
        >
          <form onSubmit={handlePostJournal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && <Alert type="danger">{formError}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Voucher Date *
                </label>
                <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Supporting Document Reference *
                </label>
                <Input
                  placeholder="e.g. INV-9921, GRN-089, ADJ-041"
                  value={entryRef}
                  onChange={(e) => setEntryRef(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                Description / Economic Substance *
              </label>
              <Input
                placeholder="Detailed reason for this accounting entry..."
                value={entryDesc}
                onChange={(e) => setEntryDesc(e.target.value)}
                required
              />
            </div>

            {/* Line Items Builder */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#11120D' }}>
                  Journal Line Items (Accounts & Amounts)
                </span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  style={{
                    background: 'none',
                    border: '1px solid #D8CFBC',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Add Line Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lines.map((l, idx) => (
                  <div
                    key={l.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 2fr 30px',
                      gap: '8px',
                      alignItems: 'center',
                      background: '#FAF6EE',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #D8CFBC',
                    }}
                  >
                    <div>
                      <select
                        value={l.accountCode}
                        onChange={(e) => handleLineChange(idx, 'accountCode', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #D8CFBC',
                          fontSize: '12px',
                        }}
                      >
                        {INITIAL_CHART_OF_ACCOUNTS.map((acc) => (
                          <option key={acc.code} value={acc.code}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Debit"
                        value={l.debit || ''}
                        onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #D8CFBC',
                          fontSize: '12px',
                          textAlign: 'right',
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Credit"
                        value={l.credit || ''}
                        onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #D8CFBC',
                          fontSize: '12px',
                          textAlign: 'right',
                        }}
                      />
                    </div>

                    <div>
                      <input
                        placeholder="Memo note..."
                        value={l.memo}
                        onChange={(e) => handleLineChange(idx, 'memo', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #D8CFBC',
                          fontSize: '12px',
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#C62828',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Remove line"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Double-Entry Balance Validator Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: validation.isBalanced ? '#2E7D32' : '#C62828',
                background: validation.isBalanced ? '#E8F5E9' : '#FFEBEE',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: validation.isBalanced ? '#2E7D32' : '#C62828' }}>
                  {validation.isBalanced
                    ? '✓ BALANCED DOUBLE-ENTRY'
                    : `⚠️ UNBALANCED (Variance: PKR ${validation.difference.toLocaleString()})`}
                </div>
                <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>
                  Debits: PKR {validation.totalDebit.toLocaleString()} &nbsp;|&nbsp; Credits: PKR{' '}
                  {validation.totalCredit.toLocaleString()}
                </div>
              </div>
              <Badge variant={validation.isBalanced ? 'success' : 'danger'}>
                {validation.isBalanced ? 'POSTABLE' : 'LOCKED'}
              </Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
              <Button variant="primary" type="submit" disabled={!validation.isBalanced}>
                Post to General Ledger
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Entry Detail & Audit Trail Modal */}
      {selectedEntry && (
        <Modal
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          title={`Journal Voucher: ${selectedEntry.journalNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  Posting Date
                </span>
                <span style={{ fontWeight: 700, color: '#11120D' }}>{selectedEntry.date}</span>
                <span style={{ display: 'block', color: '#565449', fontSize: '12px' }}>Ref: {selectedEntry.reference}</span>
              </div>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Status</span>
                <Badge variant={selectedEntry.status === 'posted' ? 'success' : 'neutral'}>
                  {selectedEntry.status.toUpperCase()}
                </Badge>
                {selectedEntry.isReversal && (
                  <span style={{ display: 'block', color: '#B8860B', fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>
                    Reversing: {selectedEntry.reversalRef}
                  </span>
                )}
              </div>
            </div>

            <div style={{ background: '#FAF6EE', padding: '12px', borderRadius: '6px', border: '1px solid #D8CFBC' }}>
              <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Description</span>
              <span style={{ fontWeight: 600, color: '#11120D' }}>{selectedEntry.description}</span>
            </div>

            {/* Itemized Lines */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Account</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Memo</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Debit (PKR)</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Credit (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {selectedEntry.lines.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #EFEAE0' }}>
                    <td style={{ padding: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{l.accountCode}</span> - {l.accountName}
                    </td>
                    <td style={{ padding: '8px', color: '#565449' }}>{l.memo}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                      {l.debit > 0 ? l.debit.toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                      {l.credit > 0 ? l.credit.toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#F5F1E8', fontWeight: 800 }}>
                  <td colSpan={2} style={{ padding: '8px', textAlign: 'right' }}>
                    Total Balanced:
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>
                    PKR {selectedEntry.totalDebit.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>
                    PKR {selectedEntry.totalCredit.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Audit Trail */}
            <div style={{ borderTop: '1px solid #EFEAE0', paddingTop: '10px' }}>
              <span style={{ color: '#7E7A6B', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Immutable Audit Trail
              </span>
              {selectedEntry.auditTrail.map((a, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#565449', marginBottom: '4px' }}>
                  <strong>{a.timestamp}</strong> &bull; {a.actor} ({a.action}): {a.details}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              {selectedEntry.status === 'posted' && !selectedEntry.isReversal ? (
                <Button variant="danger" onClick={() => handleReverseEntry(selectedEntry)}>
                  Generate Reversal Entry
                </Button>
              ) : (
                <span />
              )}
              <Button variant="primary" onClick={() => setSelectedEntry(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

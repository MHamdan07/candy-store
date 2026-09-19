import React, { useState } from 'react';
import { Card, Badge, Input, Button } from '@candi/ui';
import { WorkforceDataStore } from '../../data/workforceData';
import type { WorkforceAuditRecord } from '@candi/types';

export const WorkforceAuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<WorkforceAuditRecord[]>(() => WorkforceDataStore.getAuditRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction = selectedActionFilter === 'all' || log.action === selectedActionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid var(--color-gray-200)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gray-900)', margin: 0 }}>
              Workforce & User Governance Audit Trail
            </h1>
            <Badge variant="primary">{logs.length} Immutable Events</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Permanent, tamper-evident chronological ledger recording who created, updated, approved, or disabled accounts and permissions.
          </p>
        </div>

        <Button variant="secondary" onClick={() => window.print()}>
          🖨️ Export Audit Report
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Search audit trail by actor, target ID (e.g. EMP-1001), reason, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ width: '260px' }}>
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-gray-300)',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="all">All Action Categories</option>
              <option value="employee_created">Employee Created</option>
              <option value="employee_approved">Employee Approved / Activated</option>
              <option value="status_changed">Status Changed (Suspended/Inactive)</option>
              <option value="permissions_modified">Permissions Modified</option>
              <option value="attendance_edited">Manual Attendance Edit</option>
              <option value="overtime_approved">Overtime Authorized</option>
              <option value="leave_approved">Leave Approved</option>
              <option value="leave_rejected">Leave Rejected</option>
              <option value="payroll_calculated">Payroll Calculated</option>
              <option value="payroll_approved">Payroll Approved</option>
              <option value="payroll_adjusted">Payroll Adjusted</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-600)' }}>
                <th style={{ padding: '12px 16px', width: '160px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', width: '180px' }}>Action Category</th>
                <th style={{ padding: '12px 16px', width: '220px' }}>Authorized Actor</th>
                <th style={{ padding: '12px 16px', width: '160px' }}>Target Entity</th>
                <th style={{ padding: '12px 16px' }}>Event Description & Details</th>
                <th style={{ padding: '12px 16px', width: '240px' }}>Justification / Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No audit records matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-gray-100)', backgroundColor: '#FFFFFF' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-gray-600)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={
                          log.action.includes('approved')
                            ? 'success'
                            : log.action.includes('suspended') || log.action.includes('rejected')
                            ? 'error'
                            : log.action.includes('modified') || log.action.includes('edited')
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {log.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                      {log.actorName}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-olive-drab)' }}>
                        {log.targetEntity}: {log.targetId}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--color-gray-800)' }}>
                      {log.details}
                      {log.newValues && (
                        <div
                          style={{
                            marginTop: '4px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            backgroundColor: '#F3F4F6',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            color: 'var(--color-gray-600)',
                          }}
                        >
                          Diff: {JSON.stringify(log.newValues)}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--color-gray-600)', fontStyle: 'italic' }}>
                      {log.reason || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

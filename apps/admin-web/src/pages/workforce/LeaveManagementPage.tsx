import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import type { LeaveRequest, LeaveType } from '@candi/types';
import { WorkforceDataStore, INITIAL_LEAVE_BALANCES } from '../../data/workforceData';
import { validateLeaveRequest } from '@candi/validation';

export const LeaveManagementPage: React.FC = () => {
  const { activeRole, canApproveLeave } = usePermissions();

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => WorkforceDataStore.getLeaves());
  const employees = WorkforceDataStore.getEmployees().filter((e) => e.workflowStatus === 'active');

  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Leave Form State
  const [newLeave, setNewLeave] = useState<{
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    employeeId: '',
    leaveType: 'annual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const reloadLeaves = () => {
    setLeaves(WorkforceDataStore.getLeaves());
  };

  // Calculate days difference
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();

    const emp = employees.find((e) => e.id === newLeave.employeeId);
    if (!emp) {
      setFormErrors(['Please select an employee.']);
      return;
    }

    const days = calculateDays(newLeave.startDate, newLeave.endDate);
    const draft: Partial<LeaveRequest> = {
      employeeId: newLeave.employeeId,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      numberOfDays: days,
      reason: newLeave.reason,
      status: 'submitted',
    };

    const validation = validateLeaveRequest(draft);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const nextId = `LV-${new Date().getFullYear()}-00${leaves.length + 1}`;
    const created: LeaveRequest = {
      id: nextId,
      employeeId: emp.id,
      employeeName: emp.fullName,
      department: emp.department,
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      numberOfDays: days,
      reason: newLeave.reason,
      status: 'manager_review',
      attendanceUpdated: false,
      createdAt: new Date().toISOString(),
    };

    WorkforceDataStore.submitLeave(created, `Staff (${activeRole})`);
    reloadLeaves();
    setIsApplyModalOpen(false);
    setFormErrors([]);
    setNewLeave({
      employeeId: '',
      leaveType: 'annual',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    });
    setNotification({
      type: 'success',
      message: `Leave application ${nextId} submitted for ${created.employeeName}. Awaiting manager review.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApprove = (id: string, name: string) => {
    WorkforceDataStore.reviewLeave(id, 'approved', `Staff (${activeRole})`);
    reloadLeaves();
    setNotification({
      type: 'success',
      message: `Leave application ${id} for ${name} approved. Daily attendance register automatically updated with leave status!`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleReject = (id: string, name: string) => {
    const reason = window.prompt(`Enter rejection reason for ${name}'s leave request:`);
    if (!reason || reason.trim().length < 5) {
      alert('Rejection cancelled: Valid reason required.');
      return;
    }

    WorkforceDataStore.reviewLeave(id, 'rejected', `Staff (${activeRole})`, reason);
    reloadLeaves();
    setNotification({
      type: 'error',
      message: `Leave application ${id} rejected. Reason recorded in audit trail.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredLeaves = leaves.filter((l) => {
    if (selectedStatusTab === 'all') return true;
    return l.status === selectedStatusTab;
  });

  const pendingLeaves = leaves.filter((l) => l.status === 'manager_review');

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
              Leave Management & Approval Workflows
            </h1>
            <Badge variant="primary">{leaves.length} Total Applications</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Annual, casual, and medical leave governance with automated attendance syncing upon authorization.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsApplyModalOpen(true)}>
          🌴 Submit Leave Request
        </Button>
      </div>

      {notification && (
        <Alert variant={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Card style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>PENDING REVIEW</span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#D97706', marginTop: '4px' }}>
              {pendingLeaves.length}
            </div>
          </div>
          <div style={{ fontSize: '24px' }}>⏳</div>
        </Card>

        <Card style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>APPROVED THIS MONTH</span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>
              {leaves.filter((l) => l.status === 'approved').length}
            </div>
          </div>
          <div style={{ fontSize: '24px' }}>✅</div>
        </Card>

        <Card style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>REJECTED REQUESTS</span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#DC2626', marginTop: '4px' }}>
              {leaves.filter((l) => l.status === 'rejected').length}
            </div>
          </div>
          <div style={{ fontSize: '24px' }}>❌</div>
        </Card>

        <Card style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>TOTAL DAYS AUTHORIZED</span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#2563EB', marginTop: '4px' }}>
              {leaves.filter((l) => l.status === 'approved').reduce((s, l) => s + l.numberOfDays, 0)} days
            </div>
          </div>
          <div style={{ fontSize: '24px' }}>🗓️</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: '8px' }}>
        {[
          { key: 'all', label: 'All Requests', count: leaves.length },
          { key: 'manager_review', label: 'Pending Manager Review', count: pendingLeaves.length },
          { key: 'approved', label: 'Approved', count: leaves.filter((l) => l.status === 'approved').length },
          { key: 'rejected', label: 'Rejected', count: leaves.filter((l) => l.status === 'rejected').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatusTab(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedStatusTab === tab.key ? 'var(--color-olive-drab)' : '#F3F4F6',
              color: selectedStatusTab === tab.key ? '#FFFFFF' : 'var(--color-gray-700)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.label}
            <span
              style={{
                backgroundColor: selectedStatusTab === tab.key ? 'rgba(255,255,255,0.3)' : 'var(--color-gray-300)',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Leaves Queue Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-600)' }}>
                <th style={{ padding: '12px 16px' }}>Request ID & Staff</th>
                <th style={{ padding: '12px 16px' }}>Leave Category</th>
                <th style={{ padding: '12px 16px' }}>Date Range</th>
                <th style={{ padding: '12px 16px' }}>Duration</th>
                <th style={{ padding: '12px 16px' }}>Reason & Document</th>
                <th style={{ padding: '12px 16px' }}>Approver / Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Authorization</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No leave applications matching the filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-gray-100)', backgroundColor: '#FFFFFF' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{req.employeeName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontFamily: 'monospace' }}>
                        {req.id} • {req.department.toUpperCase()}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--color-gray-800)' }}>
                        {req.leaveType} Leave
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                      {req.startDate} to {req.endDate}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {req.numberOfDays} {req.numberOfDays === 1 ? 'day' : 'days'}
                    </td>

                    <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                      <div style={{ color: 'var(--color-gray-800)', fontSize: '13px' }}>{req.reason}</div>
                      {req.rejectionReason && (
                        <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '2px' }}>
                          Reason: {req.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Badge
                          variant={
                            req.status === 'approved'
                              ? 'success'
                              : req.status === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {req.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                          {req.approverName || 'Pending Sign-off'}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {req.status === 'manager_review' ? (
                        canApproveLeave() ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Button
                              variant="primary"
                              style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#059669' }}
                              onClick={() => handleApprove(req.id, req.employeeName)}
                            >
                              ✓ Approve
                            </Button>
                            <Button
                              variant="secondary"
                              style={{ fontSize: '12px', padding: '5px 10px', color: '#DC2626' }}
                              onClick={() => handleReject(req.id, req.employeeName)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>No Approval Clearance</span>
                        )
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Submit Leave Modal */}
      {isApplyModalOpen && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Employee Leave"
        >
          <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formErrors.length > 0 && (
              <Alert variant="error">
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Employee *
              </label>
              <select
                value={newLeave.employeeId}
                onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                required
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
              >
                <option value="">Select Employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} — {emp.jobTitle} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Leave Type *
              </label>
              <select
                value={newLeave.leaveType}
                onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value as LeaveType })}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
              >
                <option value="annual">Annual Paid Leave</option>
                <option value="casual">Casual Emergency Leave</option>
                <option value="sick">Medical / Sick Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="emergency">Family Emergency Leave</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  End Date *
                </label>
                <Input
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>
              Duration Calculated: <strong>{calculateDays(newLeave.startDate, newLeave.endDate)} working day(s)</strong>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Reason for Leave *
              </label>
              <textarea
                value={newLeave.reason}
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                placeholder="Provide detailed explanation for supervisor review..."
                rows={3}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit for Manager Review
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

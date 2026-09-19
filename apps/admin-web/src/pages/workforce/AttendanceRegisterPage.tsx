import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import type { AttendanceRecord, AttendanceStatus, DepartmentType } from '@candi/types';
import { WorkforceDataStore, DEPARTMENTS } from '../../data/workforceData';
import { validateAttendanceOverride, validateOvertimeApproval } from '@candi/validation';

export const AttendanceRegisterPage: React.FC = () => {
  const { activeRole, canOverrideAttendance } = usePermissions();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => WorkforceDataStore.getAttendance());
  const [selectedDate, setSelectedDate] = useState('2026-09-19');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manual Override Modal State
  const [overrideRecord, setOverrideRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [editReason, setEditReason] = useState('');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  const reloadAttendance = () => {
    setAttendance(WorkforceDataStore.getAttendance());
  };

  const filteredRecords = attendance.filter((rec) => {
    const matchesDate = rec.date === selectedDate;
    const matchesDept = selectedDept === 'all' || rec.department === selectedDept;
    const matchesStatus = selectedStatus === 'all' || rec.status === selectedStatus;
    return matchesDate && matchesDept && matchesStatus;
  });

  const presentCount = filteredRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'late').length;
  const leaveCount = filteredRecords.filter((r) => r.status === 'leave').length;
  const totalOTHours = filteredRecords.reduce((sum, r) => sum + r.overtimeHours, 0);

  const handleApproveOvertime = (id: string, name: string, hours: number) => {
    const validation = validateOvertimeApproval(hours, activeRole);
    if (!validation.isValid) {
      setNotification({ type: 'error', message: validation.errors.join(' ') });
      return;
    }

    WorkforceDataStore.approveOvertime(id, `Staff (${activeRole})`);
    reloadAttendance();
    setNotification({
      type: 'success',
      message: `Overtime of ${hours} hours for ${name} authorized and cleared for payroll calculation.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenOverride = (rec: AttendanceRecord) => {
    setOverrideRecord(rec);
    setNewStatus(rec.status);
    setNewCheckIn(rec.checkInTime || '');
    setNewCheckOut(rec.checkOutTime || '');
    setEditReason('');
    setOverrideError(null);
  };

  const handleSubmitOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideRecord) return;

    const validation = validateAttendanceOverride(activeRole, newStatus, editReason);
    if (!validation.isValid) {
      setOverrideError(validation.errors.join(' '));
      return;
    }

    WorkforceDataStore.overrideAttendance(
      overrideRecord.id,
      newStatus,
      editReason,
      `Staff (${activeRole})`,
      newCheckIn,
      newCheckOut
    );

    reloadAttendance();
    setOverrideRecord(null);
    setNotification({
      type: 'success',
      message: `Attendance record for ${overrideRecord.employeeName} manually updated. Reason recorded in audit trail.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

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
              Daily Attendance Register & Time Tracking
            </h1>
            <Badge variant="primary">{filteredRecords.length} Punches on Date</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Biometric punch logs, punctuality tracking, supervisor overtime authorization, and audit-backed overrides.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-700)' }}>Log Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-gray-300)',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}
          />
        </div>
      </div>

      {notification && (
        <Alert variant={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Daily Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Card style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>PRESENT ON DATE</span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#059669', marginTop: '2px' }}>
              {presentCount}
            </div>
          </div>
          <div style={{ fontSize: '24px' }}>🟢</div>
        </Card>

        <Card style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>LATE ARRIVALS</span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#D97706', marginTop: '2px' }}>
              {lateCount}
            </div>
          </div>
          <div style={{ fontSize: '24px' }}>⚠️</div>
        </Card>

        <Card style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>APPROVED LEAVE</span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#2563EB', marginTop: '2px' }}>
              {leaveCount}
            </div>
          </div>
          <div style={{ fontSize: '24px' }}>🌴</div>
        </Card>

        <Card style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>OVERTIME LOGGED</span>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#7C3AED', marginTop: '2px' }}>
              {totalOTHours.toFixed(1)} hrs
            </div>
          </div>
          <div style={{ fontSize: '24px' }}>⏳</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '220px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '4px' }}>
              Department Filter
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: '200px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: '4px' }}>
              Attendance Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="half_day">Half Day</option>
              <option value="leave">Approved Leave</option>
              <option value="off_day">Off Day</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Attendance Punch Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-600)' }}>
                <th style={{ padding: '12px 16px' }}>Employee</th>
                <th style={{ padding: '12px 16px' }}>Shift</th>
                <th style={{ padding: '12px 16px' }}>Check In</th>
                <th style={{ padding: '12px 16px' }}>Check Out</th>
                <th style={{ padding: '12px 16px' }}>Working Hours</th>
                <th style={{ padding: '12px 16px' }}>Late Penalty</th>
                <th style={{ padding: '12px 16px' }}>Overtime</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No attendance punch records found for {selectedDate}.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-gray-100)', backgroundColor: '#FFFFFF' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{rec.employeeName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', textTransform: 'capitalize' }}>
                        {rec.department} • {rec.employeeId}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--color-gray-700)' }}>
                      {rec.shiftName}
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                      {rec.checkInTime || '—'}
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                      {rec.checkOutTime || '—'}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {rec.workingHours} hrs
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {rec.lateArrivalMinutes > 0 ? (
                        <span style={{ color: '#D97706', fontWeight: 600 }}>
                          +{rec.lateArrivalMinutes} mins
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-gray-400)' }}>On Time</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {rec.overtimeHours > 0 ? (
                        <div>
                          <span style={{ fontWeight: 600, color: '#059669' }}>
                            +{rec.overtimeHours} hrs
                          </span>
                          <div style={{ fontSize: '11px', marginTop: '2px' }}>
                            {rec.overtimeApproved ? (
                              <span style={{ color: '#059669' }}>✓ Authorized</span>
                            ) : (
                              <button
                                onClick={() => handleApproveOvertime(rec.id, rec.employeeName, rec.overtimeHours)}
                                style={{
                                  background: '#FEF3C7',
                                  border: '1px solid #F59E0B',
                                  color: '#92400E',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Authorize OT
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-gray-400)' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Badge
                          variant={
                            rec.status === 'present'
                              ? 'success'
                              : rec.status === 'late'
                              ? 'warning'
                              : rec.status === 'leave'
                              ? 'info'
                              : 'error'
                          }
                        >
                          {rec.status.toUpperCase()}
                        </Badge>
                        {rec.isManualEdit && (
                          <span
                            title={`Manual override: ${rec.editReason} (by ${rec.editedBy})`}
                            style={{
                              fontSize: '10px',
                              padding: '2px 4px',
                              backgroundColor: '#E0E7FF',
                              color: '#3730A3',
                              borderRadius: '4px',
                              fontWeight: 600,
                              cursor: 'help',
                            }}
                          >
                            EDITED
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {canOverrideAttendance() ? (
                        <Button
                          variant="secondary"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleOpenOverride(rec)}
                        >
                          ✏️ Override
                        </Button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>No clearance</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Attendance Override Modal */}
      {overrideRecord && (
        <Modal
          isOpen={Boolean(overrideRecord)}
          onClose={() => setOverrideRecord(null)}
          title={`Manual Attendance Override: ${overrideRecord.employeeName}`}
        >
          <form onSubmit={handleSubmitOverride} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '12px', color: '#92400E' }}>
              <strong>Governance Policy:</strong> Manual punches alter payroll and leave entitlements. All edits require a valid explanation and are stamped with your username in the immutable audit trail.
            </div>

            {overrideError && (
              <Alert variant="error">
                {overrideError}
              </Alert>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Attendance Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
              >
                <option value="present">Present (Full Day)</option>
                <option value="late">Late Arrival</option>
                <option value="half_day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="leave">Approved Leave</option>
                <option value="off_day">Scheduled Off Day</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Clock In Time
                </label>
                <Input
                  type="time"
                  value={newCheckIn}
                  onChange={(e) => setNewCheckIn(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Clock Out Time
                </label>
                <Input
                  type="time"
                  value={newCheckOut}
                  onChange={(e) => setNewCheckOut(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Mandatory Written Justification *
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Biometric scanner power failure at Dock 2; verified physical sign-in sheet."
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-gray-300)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                Minimum 5 characters required for compliance.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="secondary" onClick={() => setOverrideRecord(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Override & Log Audit
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

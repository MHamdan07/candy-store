import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import type { WorkShift, DayOfWeek } from '@candi/types';
import { WorkforceDataStore, WORKFORCE_LOCATIONS } from '../../data/workforceData';

export const ShiftManagementPage: React.FC = () => {
  const { activeRole } = usePermissions();

  const [shifts, setShifts] = useState<WorkShift[]>(() => WorkforceDataStore.getShifts());
  const employees = WorkforceDataStore.getEmployees().filter((e) => e.workflowStatus === 'active');

  const [selectedShiftForRoster, setSelectedShiftForRoster] = useState<WorkShift | null>(null);
  const [selectedEmployeeToAssign, setSelectedEmployeeToAssign] = useState<string>('');
  const [isNewShiftModalOpen, setIsNewShiftModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Shift Form State
  const [newShift, setNewShift] = useState<{
    shiftName: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    workingDays: DayOfWeek[];
    location: string;
  }>({
    shiftName: '',
    startTime: '08:00',
    endTime: '17:00',
    breakMinutes: 60,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    location: WORKFORCE_LOCATIONS[0].name,
  });

  const reloadShifts = () => {
    setShifts(WorkforceDataStore.getShifts());
  };

  const handleAssignEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftForRoster || !selectedEmployeeToAssign) return;

    WorkforceDataStore.assignEmployeeToShift(
      selectedShiftForRoster.id,
      selectedEmployeeToAssign,
      `Staff (${activeRole})`
    );

    reloadShifts();
    const emp = employees.find((emp) => emp.id === selectedEmployeeToAssign);
    setNotification(`Assigned ${emp?.fullName || selectedEmployeeToAssign} to ${selectedShiftForRoster.shiftName}.`);
    setSelectedEmployeeToAssign('');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRemoveFromShift = (shiftId: string, empId: string) => {
    const all = WorkforceDataStore.getShifts();
    const target = all.find((s) => s.id === shiftId);
    if (!target) return;

    target.assignedEmployeeIds = target.assignedEmployeeIds.filter((id) => id !== empId);
    WorkforceDataStore.saveShifts(all);
    reloadShifts();
    setNotification(`Removed employee from shift roster.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.shiftName.trim()) {
      alert('Shift name is required.');
      return;
    }

    const nextShiftId = `SHIFT-0${shifts.length + 1}`;
    const created: WorkShift = {
      id: nextShiftId,
      shiftName: newShift.shiftName,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      breakDurationMinutes: newShift.breakMinutes,
      workingDays: newShift.workingDays,
      location: newShift.location,
      assignedEmployeeIds: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const all = WorkforceDataStore.getShifts();
    all.push(created);
    WorkforceDataStore.saveShifts(all);

    reloadShifts();
    setIsNewShiftModalOpen(false);
    setNewShift({
      shiftName: '',
      startTime: '08:00',
      endTime: '17:00',
      breakMinutes: 60,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      location: WORKFORCE_LOCATIONS[0].name,
    });
    setNotification(`New shift "${created.shiftName}" created successfully.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleDay = (day: DayOfWeek) => {
    setNewShift((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
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
              Workforce Shift Management & Rostering Hub
            </h1>
            <Badge variant="primary">{shifts.length} Active Shifts</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Configure operational hours, dock intake shifts, field delivery schedules, and staff rosters.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsNewShiftModalOpen(true)}>
          ➕ Add New Shift
        </Button>
      </div>

      {notification && (
        <Alert variant="success" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      )}

      {/* Shift Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {shifts.map((shift) => {
          const assignedStaff = employees.filter((e) => shift.assignedEmployeeIds.includes(e.id));
          return (
            <Card key={shift.id} style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
                      {shift.shiftName}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontFamily: 'monospace' }}>
                      {shift.id}
                    </span>
                  </div>
                  <Badge variant={shift.status === 'active' ? 'success' : 'neutral'}>{shift.status.toUpperCase()}</Badge>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gray-700)' }}>
                    <span>⏰</span>
                    <strong>{shift.startTime} — {shift.endTime}</strong>
                    <span style={{ color: 'var(--color-gray-500)' }}>({shift.breakDurationMinutes}m break)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gray-700)' }}>
                    <span>📍</span>
                    <span>{shift.location.split('—')[0]}</span>
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', display: 'block', marginBottom: '4px' }}>
                      Working Days:
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <span
                          key={day}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: shift.workingDays.includes(day as DayOfWeek)
                              ? 'var(--color-cream)'
                              : '#F3F4F6',
                            color: shift.workingDays.includes(day as DayOfWeek)
                              ? 'var(--color-olive-drab)'
                              : 'var(--color-gray-400)',
                            fontWeight: shift.workingDays.includes(day as DayOfWeek) ? 'bold' : 'normal',
                          }}
                        >
                          {day.slice(0, 3).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assigned Personnel Roster */}
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-gray-100)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)' }}>
                      Rostered Personnel ({assignedStaff.length})
                    </span>
                    <button
                      onClick={() => setSelectedShiftForRoster(shift)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-olive-drab)',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      + Assign Staff
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {assignedStaff.length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--color-gray-400)', fontStyle: 'italic' }}>
                        No staff assigned to this shift yet.
                      </span>
                    ) : (
                      assignedStaff.map((staff) => (
                        <div
                          key={staff.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            backgroundColor: '#F9FAFB',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E5E7EB',
                          }}
                        >
                          <div>
                            <strong>{staff.fullName}</strong>
                            <span style={{ color: 'var(--color-gray-500)', marginLeft: '6px' }}>
                              ({staff.jobTitle})
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveFromShift(shift.id, staff.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#DC2626',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                            title="Remove from shift"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '18px', borderTop: '1px solid var(--color-gray-200)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>
                  Coverage: <strong>{assignedStaff.length} / 4 minimum</strong>
                </span>
                <Badge variant={assignedStaff.length >= 3 ? 'success' : 'warning'}>
                  {assignedStaff.length >= 3 ? 'Optimal Coverage' : 'Low Coverage'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Assign Staff Drawer / Modal */}
      {selectedShiftForRoster && (
        <Modal
          isOpen={Boolean(selectedShiftForRoster)}
          onClose={() => {
            setSelectedShiftForRoster(null);
            setSelectedEmployeeToAssign('');
          }}
          title={`Assign Staff to Roster: ${selectedShiftForRoster.shiftName}`}
        >
          <form onSubmit={handleAssignEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-gray-600)' }}>
              Select an active employee to add to this shift schedule ({selectedShiftForRoster.startTime} - {selectedShiftForRoster.endTime}).
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Active Employee
              </label>
              <select
                value={selectedEmployeeToAssign}
                onChange={(e) => setSelectedEmployeeToAssign(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
              >
                <option value="">Select Employee...</option>
                {employees
                  .filter((emp) => !selectedShiftForRoster.assignedEmployeeIds.includes(emp.id))
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} — {emp.jobTitle} ({emp.department})
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="secondary" onClick={() => setSelectedShiftForRoster(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Shift Creation Modal */}
      {isNewShiftModalOpen && (
        <Modal
          isOpen={isNewShiftModalOpen}
          onClose={() => setIsNewShiftModalOpen(false)}
          title="Create New Operational Shift"
        >
          <form onSubmit={handleCreateShift} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Shift Name *
              </label>
              <Input
                placeholder="e.g. Night Warehouse Stacking Shift"
                value={newShift.shiftName}
                onChange={(e) => setNewShift({ ...newShift, shiftName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={newShift.startTime}
                  onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  End Time *
                </label>
                <Input
                  type="time"
                  value={newShift.endTime}
                  onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Break (Mins)
                </label>
                <Input
                  type="number"
                  value={newShift.breakMinutes}
                  onChange={(e) => setNewShift({ ...newShift, breakMinutes: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Working Days
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as DayOfWeek[]).map(
                  (day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-gray-300)',
                        backgroundColor: newShift.workingDays.includes(day)
                          ? 'var(--color-olive-drab)'
                          : '#FFFFFF',
                        color: newShift.workingDays.includes(day) ? '#FFFFFF' : 'var(--color-gray-700)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {day.toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Operational Location
              </label>
              <select
                value={newShift.location}
                onChange={(e) => setNewShift({ ...newShift, location: e.target.value })}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
              >
                {WORKFORCE_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsNewShiftModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Shift
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

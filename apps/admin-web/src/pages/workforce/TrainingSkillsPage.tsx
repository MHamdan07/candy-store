import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import type { TrainingRecord } from '@candi/types';
import { WorkforceDataStore } from '../../data/workforceData';

export const TrainingSkillsPage: React.FC = () => {
  const { activeRole } = usePermissions();

  const [trainings, setTrainings] = useState<TrainingRecord[]>(() => WorkforceDataStore.getTrainingRecords());
  const employees = WorkforceDataStore.getEmployees().filter((e) => e.workflowStatus === 'active');

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [newTraining, setNewTraining] = useState<{
    programTitle: string;
    employeeId: string;
    trainingDate: string;
    provider: string;
    certificateNumber: string;
    skillsString: string;
    expiryDate: string;
    notes: string;
  }>({
    programTitle: '',
    employeeId: '',
    trainingDate: new Date().toISOString().split('T')[0],
    provider: 'Punjab Food Authority (PFA)',
    certificateNumber: '',
    skillsString: 'Food Safety, Cold-Chain Hygiene, Inventory FIFO',
    expiryDate: '',
    notes: '',
  });

  const reloadTrainings = () => {
    setTrainings(WorkforceDataStore.getTrainingRecords());
  };

  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newTraining.employeeId);
    if (!emp) {
      alert('Please select an employee.');
      return;
    }

    const created: TrainingRecord = {
      id: `TRN-${Date.now()}`,
      programTitle: newTraining.programTitle,
      employeeId: emp.id,
      employeeName: emp.fullName,
      trainingDate: newTraining.trainingDate,
      provider: newTraining.provider,
      completionStatus: 'completed',
      certificateNumber: newTraining.certificateNumber || `CERT-${Date.now().toString().slice(-6)}`,
      skillsAcquired: newTraining.skillsString.split(',').map((s) => s.trim()).filter(Boolean),
      expiryDate: newTraining.expiryDate || undefined,
      notes: newTraining.notes,
    };

    const all = WorkforceDataStore.getTrainingRecords();
    all.unshift(created);
    WorkforceDataStore.saveTrainingRecords(all);

    reloadTrainings();
    setIsLogModalOpen(false);
    setNotification(`Training record for ${created.employeeName} logged successfully.`);
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
              Training Records, Skills Inventory & Compliance
            </h1>
            <Badge variant="primary">{trainings.length} Accredited Programs</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Track confectionery food safety compliance, reach-truck forklift licensing, route defense, and renewal dates.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsLogModalOpen(true)}>
          📜 Log Training & Certification
        </Button>
      </div>

      {notification && (
        <Alert variant="success" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      )}

      {/* Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        <Card style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>FOOD SAFETY COMPLIANCE</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>
            100% Certified
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>
            Punjab Food Authority standard met across all warehouse personnel
          </span>
        </Card>

        <Card style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>FORKLIFT & REACH-TRUCK LICENSES</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gray-900)', marginTop: '4px' }}>
            {trainings.filter((t) => t.programTitle.toLowerCase().includes('forklift')).length} Operators
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>
            Pakistan Safety Training Institute certified
          </span>
        </Card>

        <Card style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>RENEWAL TRACKING</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D97706', marginTop: '4px' }}>
            1 Due Next Month
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>
            Defensive motorbike riding license renewal alert
          </span>
        </Card>
      </div>

      {/* Training Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-600)' }}>
                <th style={{ padding: '12px 16px' }}>Program Title & Employee</th>
                <th style={{ padding: '12px 16px' }}>Accredited Provider</th>
                <th style={{ padding: '12px 16px' }}>Training Date</th>
                <th style={{ padding: '12px 16px' }}>Certificate Number</th>
                <th style={{ padding: '12px 16px' }}>Skills Acquired</th>
                <th style={{ padding: '12px 16px' }}>Renewal Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--color-gray-100)', backgroundColor: '#FFFFFF' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{t.programTitle}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                      Trainee: <strong>{t.employeeName}</strong> ({t.employeeId})
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', color: 'var(--color-gray-700)' }}>
                    {t.provider}
                  </td>

                  <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                    {t.trainingDate}
                  </td>

                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-olive-drab)' }}>
                    {t.certificateNumber || 'N/A'}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {t.skillsAcquired.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#E0E7FF',
                            color: '#3730A3',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {t.expiryDate ? (
                      <span style={{ fontFamily: 'monospace' }}>{t.expiryDate}</span>
                    ) : (
                      <span style={{ color: 'var(--color-gray-400)' }}>Permanent</span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <Badge variant={t.completionStatus === 'completed' ? 'success' : 'warning'}>
                      {t.completionStatus.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Completed Training Modal */}
      {isLogModalOpen && (
        <Modal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          title="Log Completed Employee Training & Skill Certification"
        >
          <form onSubmit={handleCreateTraining} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Employee *
              </label>
              <select
                value={newTraining.employeeId}
                onChange={(e) => setNewTraining({ ...newTraining, employeeId: e.target.value })}
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
                Training Program Title *
              </label>
              <Input
                placeholder="e.g. Forklift Operation & Safe Stacking (Tier 4)"
                value={newTraining.programTitle}
                onChange={(e) => setNewTraining({ ...newTraining, programTitle: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Accredited Provider *
                </label>
                <Input
                  value={newTraining.provider}
                  onChange={(e) => setNewTraining({ ...newTraining, provider: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Training Date *
                </label>
                <Input
                  type="date"
                  value={newTraining.trainingDate}
                  onChange={(e) => setNewTraining({ ...newTraining, trainingDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Certificate / License Number
                </label>
                <Input
                  placeholder="e.g. PFA-2026-0091"
                  value={newTraining.certificateNumber}
                  onChange={(e) => setNewTraining({ ...newTraining, certificateNumber: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Expiry / Renewal Date (Optional)
                </label>
                <Input
                  type="date"
                  value={newTraining.expiryDate}
                  onChange={(e) => setNewTraining({ ...newTraining, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Skills Acquired (Comma-separated)
              </label>
              <Input
                value={newTraining.skillsString}
                onChange={(e) => setNewTraining({ ...newTraining, skillsString: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsLogModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Training Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

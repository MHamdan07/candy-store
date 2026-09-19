import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import type { PerformanceReview, PerformanceGoal, PerformanceReviewStatus } from '@candi/types';
import { WorkforceDataStore } from '../../data/workforceData';

export const PerformanceReviewPage: React.FC = () => {
  const { activeRole } = usePermissions();

  const [reviews, setReviews] = useState<PerformanceReview[]>(() => WorkforceDataStore.getPerformanceReviews());
  const employees = WorkforceDataStore.getEmployees().filter((e) => e.workflowStatus === 'active');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [newReview, setNewReview] = useState<{
    reviewPeriod: string;
    employeeId: string;
    overallRating: number;
    managerComments: string;
    employeeComments: string;
    goal1Desc: string;
    goal1Target: string;
    goal1Achieved: string;
    goal1Rating: number;
    goal2Desc: string;
    goal2Target: string;
    goal2Achieved: string;
    goal2Rating: number;
  }>({
    reviewPeriod: 'Q3-2026 (Jul - Sep)',
    employeeId: '',
    overallRating: 4.5,
    managerComments: '',
    employeeComments: '',
    goal1Desc: '',
    goal1Target: '',
    goal1Achieved: '',
    goal1Rating: 5,
    goal2Desc: '',
    goal2Target: '',
    goal2Achieved: '',
    goal2Rating: 4,
  });

  const reloadReviews = () => {
    setReviews(WorkforceDataStore.getPerformanceReviews());
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newReview.employeeId);
    if (!emp) {
      alert('Please select an employee.');
      return;
    }

    const created: PerformanceReview = {
      id: `REV-${Date.now()}`,
      reviewPeriod: newReview.reviewPeriod,
      employeeId: emp.id,
      employeeName: emp.fullName,
      department: emp.department,
      managerId: emp.managerId || 'EMP-1002',
      managerName: emp.managerName || 'Farhan Zaidi',
      goals: [
        {
          id: 'g-1',
          description: newReview.goal1Desc || 'Primary Departmental Objective',
          metric: 'Volume / Accuracy Target',
          target: newReview.goal1Target || '100%',
          achieved: newReview.goal1Achieved || '102%',
          rating: newReview.goal1Rating as any,
        },
        {
          id: 'g-2',
          description: newReview.goal2Desc || 'Compliance & Punctuality Goal',
          metric: 'Zero Incidents',
          target: newReview.goal2Target || '0',
          achieved: newReview.goal2Achieved || '0',
          rating: newReview.goal2Rating as any,
        },
      ],
      overallRating: newReview.overallRating,
      managerComments: newReview.managerComments || 'Performance meets and exceeds confectionery enterprise requirements.',
      employeeComments: newReview.employeeComments || 'Agreed on Q4 progression goals.',
      reviewStatus: 'finalized',
      followUpActions: ['Review again next quarter', 'Skill refresher scheduled'],
      finalizedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const all = WorkforceDataStore.getPerformanceReviews();
    all.unshift(created);
    WorkforceDataStore.savePerformanceReviews(all);

    WorkforceDataStore.addAuditRecord({
      actorId: 'current-user',
      actorName: `Staff (${activeRole})`,
      action: 'performance_finalized',
      targetEntity: 'PerformanceReview',
      targetId: created.id,
      details: `Finalized quarterly performance appraisal for ${created.employeeName} (${created.overallRating}/5.0)`,
    });

    reloadReviews();
    setIsCreateModalOpen(false);
    setNotification(`Performance appraisal for ${created.employeeName} saved and finalized.`);
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
              Performance Management & Appraisal Scorecards
            </h1>
            <Badge variant="primary">{reviews.length} Finalized Appraisals</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            6-stage evaluation lifecycle: Goals, KPI benchmarks, manager evaluation, employee feedback, and follow-ups.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          🎯 Conduct Performance Review
        </Button>
      </div>

      {notification && (
        <Alert variant="success" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      )}

      {/* 6-Stage Workflow Progress Banner */}
      <Card style={{ padding: '16px 20px', backgroundColor: '#F8FAFC' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
          6-Stage Performance Appraisal Workflow:
        </span>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px', color: 'var(--color-gray-700)', flexWrap: 'wrap' }}>
          <span>1. Review Created</span> →
          <span>2. Employee Goals Set</span> →
          <span>3. Manager Review & Scoring</span> →
          <span>4. Employee Feedback Dialogue</span> →
          <strong style={{ color: 'var(--color-olive-drab)' }}>5. Finalized Appraisal Scorecard</strong> →
          <span>6. Follow-up Development Actions</span>
        </div>
      </Card>

      {/* Reviews Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {reviews.map((rev) => (
          <Card key={rev.id} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
                    {rev.employeeName}
                  </h3>
                  <Badge variant="neutral">{rev.department.toUpperCase()}</Badge>
                  <Badge variant="success">{rev.reviewStatus.toUpperCase()}</Badge>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                  Cycle: <strong>{rev.reviewPeriod}</strong> • Evaluated by Supervisor: <strong>{rev.managerName}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#D97706' }}>
                  ★ {rev.overallRating.toFixed(1)} <span style={{ fontSize: '14px', color: 'var(--color-gray-400)' }}>/ 5.0</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                  Finalized: {rev.finalizedAt ? new Date(rev.finalizedAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            {/* Goals & KPI Scoring Grid */}
            <div style={{ marginTop: '18px', borderTop: '1px solid var(--color-gray-100)', paddingTop: '14px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '0 0 10px 0' }}>
                Quantitative KPI Scorecards
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {rev.goals.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '8px',
                      border: '1px solid var(--color-gray-200)',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                      {g.description}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--color-gray-500)' }}>Target: <strong>{g.target}</strong></span>
                      <span style={{ color: '#059669' }}>Achieved: <strong>{g.achieved}</strong></span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 600, color: '#D97706' }}>
                      Score: {g.rating} / 5 Stars
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', fontSize: '13px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>Manager Assessment:</strong>
                <p style={{ margin: 0, color: '#14532D', fontStyle: 'italic' }}>"{rev.managerComments}"</p>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                <strong style={{ color: '#1E40AF', display: 'block', marginBottom: '4px' }}>Employee Response:</strong>
                <p style={{ margin: 0, color: '#1E3A8A', fontStyle: 'italic' }}>"{rev.employeeComments || 'No comments provided.'}"</p>
              </div>
            </div>

            {rev.followUpActions && rev.followUpActions.length > 0 && (
              <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--color-gray-600)' }}>
                <strong>Follow-up Development Actions:</strong> {rev.followUpActions.join(' • ')}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Conduct Performance Review Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Conduct Employee Performance Appraisal"
        >
          <form onSubmit={handleCreateReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Select Employee *
              </label>
              <select
                value={newReview.employeeId}
                onChange={(e) => setNewReview({ ...newReview, employeeId: e.target.value })}
                required
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
              >
                <option value="">Select active employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} — {emp.jobTitle} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Review Period *
                </label>
                <Input
                  value={newReview.reviewPeriod}
                  onChange={(e) => setNewReview({ ...newReview, reviewPeriod: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Overall Score (1.0 to 5.0) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={newReview.overallRating}
                  onChange={(e) => setNewReview({ ...newReview, overallRating: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)' }}>
                Goal 1: Operational / Volume Deliverable
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <Input
                  placeholder="Goal description"
                  value={newReview.goal1Desc}
                  onChange={(e) => setNewReview({ ...newReview, goal1Desc: e.target.value })}
                />
                <Input
                  placeholder="Target"
                  value={newReview.goal1Target}
                  onChange={(e) => setNewReview({ ...newReview, goal1Target: e.target.value })}
                />
                <Input
                  placeholder="Achieved"
                  value={newReview.goal1Achieved}
                  onChange={(e) => setNewReview({ ...newReview, goal1Achieved: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Supervisor Qualitative Assessment *
              </label>
              <textarea
                value={newReview.managerComments}
                onChange={(e) => setNewReview({ ...newReview, managerComments: e.target.value })}
                placeholder="Detail key achievements, areas for growth, and leadership capabilities..."
                rows={3}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Employee Dialogue Feedback
              </label>
              <textarea
                value={newReview.employeeComments}
                onChange={(e) => setNewReview({ ...newReview, employeeComments: e.target.value })}
                placeholder="Employee's self-reflection, feedback on resources, and aspirations..."
                rows={2}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Finalize Appraisal & Log
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

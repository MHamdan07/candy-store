import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateApprovalAuthority,
  validateFinancialActionPermission,
  generateFinancialReversalEntry,
  validateExceptionResolution,
} from '../src/financialControls.ts';
import type { FinancialExceptionItem } from '@candi/types';

test('validateApprovalAuthority strictly prevents self-approval (4-eyes principle)', () => {
  const result = validateApprovalAuthority({
    approverId: 'usr-001',
    approverName: 'Farhan Zaidi',
    approverRole: 'admin_manager',
    creatorId: 'usr-001', // Same user
    creatorName: 'Farhan Zaidi',
    amountPKR: 45000,
    transactionType: 'journal_entry',
  });

  assert.strictEqual(result.isAllowed, false);
  assert.strictEqual(result.code, 'SELF_APPROVAL_BLOCKED');
  assert.match(result.reason, /Segregation of Duties/);
});

test('validateApprovalAuthority enforces monetary approval limits by role', () => {
  // Accounts staff attempting to approve PKR 85,000 (limit is 50,000)
  const staffCheck = validateApprovalAuthority({
    approverId: 'usr-staff',
    approverName: 'Tariq Staff',
    approverRole: 'accounts_staff',
    creatorId: 'usr-other',
    creatorName: 'Other Accountant',
    amountPKR: 85000,
    transactionType: 'journal_entry',
  });
  assert.strictEqual(staffCheck.isAllowed, false);
  assert.strictEqual(staffCheck.code, 'LIMIT_EXCEEDED');

  // Controller approving PKR 180,000 (within limit 250,000)
  const controllerCheck = validateApprovalAuthority({
    approverId: 'usr-controller',
    approverName: 'Farhan Zaidi',
    approverRole: 'admin_manager',
    creatorId: 'usr-other',
    creatorName: 'Other Accountant',
    amountPKR: 180000,
    transactionType: 'journal_entry',
  });
  assert.strictEqual(controllerCheck.isAllowed, true);
  assert.strictEqual(controllerCheck.code, 'APPROVED');

  // Controller attempting to approve PKR 500,000 (exceeds limit 250,000)
  const directorRequired = validateApprovalAuthority({
    approverId: 'usr-controller',
    approverName: 'Farhan Zaidi',
    approverRole: 'admin_manager',
    creatorId: 'usr-other',
    creatorName: 'Other Accountant',
    amountPKR: 500000,
    transactionType: 'supplier_payment',
  });
  assert.strictEqual(directorRequired.isAllowed, false);
  assert.strictEqual(directorRequired.code, 'LIMIT_EXCEEDED');
  assert.strictEqual(directorRequired.requiredRole, 'super_admin');
});

test('validateApprovalAuthority requires Director approval for write-offs > 25,000', () => {
  const writeOffCheck = validateApprovalAuthority({
    approverId: 'usr-controller',
    approverName: 'Farhan Zaidi',
    approverRole: 'admin_manager', // not super_admin
    creatorId: 'usr-other',
    creatorName: 'Tariq Staff',
    amountPKR: 35000,
    transactionType: 'write_off',
  });

  assert.strictEqual(writeOffCheck.isAllowed, false);
  assert.strictEqual(writeOffCheck.code, 'INSUFFICIENT_ROLE');
  assert.strictEqual(writeOffCheck.requiredRole, 'super_admin');
});

test('validateFinancialActionPermission protects closed/locked accounting periods', () => {
  // Direct edit on locked period must be rejected
  const lockedEdit = validateFinancialActionPermission('super_admin', 'edit', 'locked');
  assert.strictEqual(lockedEdit.isAllowed, false);
  assert.match(lockedEdit.reason, /locked/i);

  // Direct post on closed period must be rejected
  const closedPost = validateFinancialActionPermission('admin_manager', 'post', 'closed');
  assert.strictEqual(closedPost.isAllowed, false);
  assert.match(closedPost.reason, /closed/i);

  // Normal post in open period permitted for controller
  const openPost = validateFinancialActionPermission('admin_manager', 'post', 'open');
  assert.strictEqual(openPost.isAllowed, true);
});

test('generateFinancialReversalEntry inverts debits and credits and requires reason', () => {
  const sampleVoucher = {
    originalId: 'jv-101',
    originalVoucherNumber: 'JV-2026-0042',
    isPosted: true,
    isReversed: false,
    amountPKR: 50000,
    lines: [
      { accountCode: '6010', accountName: 'Fuel Expense', debit: 50000, credit: 0 },
      { accountCode: '1010', accountName: 'Cash on Hand', debit: 0, credit: 50000 },
    ],
  };

  // Reversal without reason fails
  const noReason = generateFinancialReversalEntry(sampleVoucher, 'Farhan Zaidi', '');
  assert.strictEqual(noReason.success, false);
  assert.match(noReason.error!, /reason/i);

  // Valid reversal generates swapped debits/credits
  const reversal = generateFinancialReversalEntry(sampleVoucher, 'Farhan Zaidi', 'Duplicate fuel claim voucher reversed');
  assert.strictEqual(reversal.success, true);
  assert.strictEqual(reversal.reversalVoucherNumber, 'REV-JV-2026-0042');
  assert.strictEqual(reversal.reversalLines![0].credit, 50000); // Inverted to credit
  assert.strictEqual(reversal.reversalLines![1].debit, 50000);  // Inverted to debit
});

test('validateExceptionResolution enforces reason and role rules on overrides', () => {
  const mockException: FinancialExceptionItem = {
    id: 'exc-01',
    exceptionType: 'cash_variance',
    title: 'Shortage in Driver Vault Handover',
    description: 'PKR 2,400 physical cash shortage on Route 4',
    sourceReference: 'HO-2026-003',
    amountPKR: 2400,
    severity: 'high',
    detectedAt: '2026-09-18 18:00',
    status: 'open',
    periodCode: '2026-09',
  };

  // Override without reason fails
  const noReason = validateExceptionResolution(mockException, 'override', 'admin_manager', '');
  assert.strictEqual(noReason.isAllowed, false);
  assert.match(noReason.error!, /rationale/i);

  // Staff cannot override
  const staffOverride = validateExceptionResolution(mockException, 'override', 'accounts_staff', 'Driver investigated and cleared');
  assert.strictEqual(staffOverride.isAllowed, false);
  assert.match(staffOverride.error!, /Controllers or Commercial Directors/);

  // Controller with detailed reason succeeds
  const controllerOverride = validateExceptionResolution(
    mockException,
    'override',
    'admin_manager',
    'Customer payment deducted via credit note adjustment CN-009; drawer verified'
  );
  assert.strictEqual(controllerOverride.isAllowed, true);
});

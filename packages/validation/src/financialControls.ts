import type {
  StaffRoleName,
  FinancialTransactionType,
  FinancialApprovalRule,
  PeriodStatus,
  FinancialExceptionItem,
} from '@candi/types';

export interface ApprovalAuthorityCheckParams {
  approverId: string;
  approverName: string;
  approverRole: StaffRoleName;
  creatorId: string;
  creatorName: string;
  amountPKR: number;
  transactionType: FinancialTransactionType;
  rule?: FinancialApprovalRule;
  overrideReason?: string;
}

export interface ApprovalAuthorityResult {
  isAllowed: boolean;
  code: 'APPROVED' | 'SELF_APPROVAL_BLOCKED' | 'LIMIT_EXCEEDED' | 'INSUFFICIENT_ROLE' | 'REASON_REQUIRED';
  reason: string;
  requiredRole?: StaffRoleName;
}

export const ROLE_APPROVAL_LIMITS: Record<StaffRoleName, number> = {
  super_admin: 100000000, // Unlimited / Commercial Director / CFO
  admin_manager: 250000,   // PKR 250,000 (Finance Controller)
  accounts_staff: 50000,   // PKR 50,000 (Junior Accountant / Reviewer)
  warehouse_manager: 25000,// PKR 25,000 (Inventory Adjustments)
  sales_agent: 0,
  warehouse_staff: 0,
  delivery_manager: 0,
  rider: 0,
};

/**
 * Validates whether an actor has authority to approve a financial transaction,
 * strictly enforcing the 4-eyes principle (Segregation of Duties) and monetary thresholds.
 */
export function validateApprovalAuthority(params: ApprovalAuthorityCheckParams): ApprovalAuthorityResult {
  const { approverId, approverRole, creatorId, amountPKR, transactionType, overrideReason } = params;

  // 1. Mandatory Segregation of Duties: Self-approval is strictly forbidden
  if (approverId && creatorId && approverId === creatorId) {
    return {
      isAllowed: false,
      code: 'SELF_APPROVAL_BLOCKED',
      reason: 'Segregation of Duties (4-Eyes Principle): The user who prepared this transaction cannot approve it.',
    };
  }

  // 2. Write-offs always require Director/CFO approval regardless of amount if > 25,000
  if (transactionType === 'write_off' && amountPKR > 25000 && approverRole !== 'super_admin') {
    return {
      isAllowed: false,
      code: 'INSUFFICIENT_ROLE',
      reason: 'Bad debt and inventory write-offs exceeding PKR 25,000 require Commercial Director / CFO authorization.',
      requiredRole: 'super_admin',
    };
  }

  // 3. Approval Limit Thresholds
  const maxLimit = ROLE_APPROVAL_LIMITS[approverRole] ?? 0;
  if (amountPKR > maxLimit) {
    return {
      isAllowed: false,
      code: 'LIMIT_EXCEEDED',
      reason: `Amount of PKR ${amountPKR.toLocaleString()} exceeds your role approval threshold of PKR ${maxLimit.toLocaleString()}. Escalation to higher authority required.`,
      requiredRole: amountPKR <= 250000 ? 'admin_manager' : 'super_admin',
    };
  }

  // 4. Accounts staff cannot approve financial transactions unless junior threshold
  if (approverRole === 'accounts_staff' && amountPKR > 50000) {
    return {
      isAllowed: false,
      code: 'INSUFFICIENT_ROLE',
      reason: 'Accounts Staff cannot approve transactions exceeding PKR 50,000.',
      requiredRole: 'admin_manager',
    };
  }

  return {
    isAllowed: true,
    code: 'APPROVED',
    reason: 'Approval authorized within role delegation matrix.',
  };
}

export type FinancialAction =
  | 'create'
  | 'edit'
  | 'submit'
  | 'approve'
  | 'post'
  | 'reverse'
  | 'reconcile'
  | 'close_period';

export interface ActionPermissionResult {
  isAllowed: boolean;
  reason: string;
}

/**
 * Enforces role permissions and protects closed/locked accounting periods from direct mutations.
 */
export function validateFinancialActionPermission(
  role: StaffRoleName,
  action: FinancialAction,
  periodStatus?: PeriodStatus
): ActionPermissionResult {
  // Period protection guard
  if (periodStatus === 'locked' || periodStatus === 'closed') {
    if (action === 'edit' || action === 'post' || action === 'reverse') {
      return {
        isAllowed: false,
        reason: `Accounting period is ${periodStatus.toUpperCase()}. Direct modifications and postings are permanently prohibited under statutory GAAP/IFRS controls. An authorized adjustment request in an open period is required.`,
      };
    }
  }

  // Role action matrices
  if (action === 'close_period') {
    if (role !== 'super_admin' && role !== 'admin_manager') {
      return {
        isAllowed: false,
        reason: 'Only Finance Controllers or Commercial Directors have permission to close or lock accounting periods.',
      };
    }
  }

  if (action === 'approve') {
    if (role !== 'super_admin' && role !== 'admin_manager') {
      return {
        isAllowed: false,
        reason: 'Approval rights are restricted to authorized financial management roles.',
      };
    }
  }

  if (action === 'reverse') {
    if (role !== 'super_admin' && role !== 'admin_manager') {
      return {
        isAllowed: false,
        reason: 'Posting reversal vouchers requires supervisor authorization.',
      };
    }
  }

  return {
    isAllowed: true,
    reason: 'Action authorized.',
  };
}

export interface ReversalLineItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface ReversalInput {
  originalId: string;
  originalVoucherNumber: string;
  isPosted: boolean;
  isReversed: boolean;
  lines: ReversalLineItem[];
  amountPKR: number;
}

export interface ReversalResult {
  success: boolean;
  error?: string;
  reversalVoucherNumber?: string;
  reversalLines?: ReversalLineItem[];
}

/**
 * Generates an immutable contra-reversal entry.
 * Direct deletion of posted transactions is strictly prohibited; reversals invert debits and credits.
 */
export function generateFinancialReversalEntry(
  input: ReversalInput,
  actorName: string,
  reason: string
): ReversalResult {
  if (!input.isPosted) {
    return {
      success: false,
      error: 'Cannot reverse an unposted transaction. Unposted draft entries should be rejected or cancelled.',
    };
  }

  if (input.isReversed) {
    return {
      success: false,
      error: `Transaction ${input.originalVoucherNumber} has already been reversed. Multiple reversals are not permitted.`,
    };
  }

  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: 'A detailed reversal justification reason (minimum 5 characters) is required for statutory audit trails.',
    };
  }

  // Invert debits and credits
  const reversalLines: ReversalLineItem[] = input.lines.map((line) => ({
    accountCode: line.accountCode,
    accountName: line.accountName,
    debit: line.credit,   // Inverted
    credit: line.debit,   // Inverted
  }));

  const reversalVoucherNumber = `REV-${input.originalVoucherNumber}`;

  return {
    success: true,
    reversalVoucherNumber,
    reversalLines,
  };
}

/**
 * Validates resolution of an item from the Financial Exception Dashboard.
 */
export function validateExceptionResolution(
  exception: FinancialExceptionItem,
  action: 'approve' | 'reject' | 'reverse' | 'override',
  actorRole: StaffRoleName,
  reason?: string
): { isAllowed: boolean; error?: string } {
  if (exception.status === 'resolved') {
    return { isAllowed: false, error: 'Exception item has already been resolved.' };
  }

  if (action === 'override') {
    if (!reason || reason.trim().length < 10) {
      return { isAllowed: false, error: 'Audit compliance requires a documented rationale (minimum 10 chars) for overriding an exception.' };
    }
    if (actorRole !== 'admin_manager' && actorRole !== 'super_admin') {
      return { isAllowed: false, error: 'Only Finance Controllers or Commercial Directors can authorize financial exception overrides.' };
    }
  }

  if (exception.severity === 'critical' && actorRole !== 'super_admin' && actorRole !== 'admin_manager') {
    return { isAllowed: false, error: 'Critical exceptions require Finance Controller or Director level resolution.' };
  }

  return { isAllowed: true };
}

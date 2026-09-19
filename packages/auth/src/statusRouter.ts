import type { AccountStatus } from '@candi/types';

export function resolveCustomerRoute(status?: AccountStatus | null): string {
  if (!status) {
    return '/register';
  }

  switch (status) {
    case 'approved':
      return '/home';
    case 'pending_review':
    case 'under_review':
      return '/account/pending';
    case 'changes_requested':
      return '/account/changes-requested';
    case 'rejected':
      return '/account/rejected';
    case 'suspended':
      return '/account/suspended';
    case 'archived':
      return '/account/archived';
    default:
      return '/welcome';
  }
}

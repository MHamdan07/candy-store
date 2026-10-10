import React from 'react';

export type BadgeStatus =
  | 'approved'
  | 'pending_review'
  | 'under_review'
  | 'changes_requested'
  | 'rejected'
  | 'suspended'
  | 'archived'
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'sent_to_supplier'
  | 'partially_received'
  | 'fully_received'
  | 'closed'
  | 'paid'
  | 'issued'
  | 'retailer'
  | 'sub_wholesaler';

export interface BadgeProps {
  status?: BadgeStatus | string;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral' | string;
  label?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, label, children, size = 'sm', style }) => {
  const effectiveType = variant || status || 'neutral';

  const getBadgeStyle = (): { bg: string; text: string; border: string; label: string } => {
    switch (effectiveType) {
      case 'success':
      case 'approved':
      case 'active':
      case 'fully_received':
      case 'paid':
        return {
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success)',
          border: 'var(--color-success-border)',
          label: 'Approved',
        };
      case 'pending_review':
      case 'pending_approval':
      case 'submitted':
        return {
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning)',
          border: 'var(--color-warning-border)',
          label: 'Pending Review',
        };
      case 'under_review':
      case 'sent_to_supplier':
      case 'partially_received':
      case 'issued':
        return {
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info)',
          border: 'var(--color-info-border)',
          label: 'Under Review',
        };
      case 'changes_requested':
        return {
          bg: '#FFF6E5',
          text: '#B36B00',
          border: '#F2C94C',
          label: 'Changes Requested',
        };
      case 'rejected':
      case 'cancelled':
        return {
          bg: 'var(--color-danger-bg)',
          text: 'var(--color-danger)',
          border: 'var(--color-danger-border)',
          label: 'Rejected',
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning)',
          border: 'var(--color-warning-border)',
          label: 'Warning',
        };
      case 'info':
        return {
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info)',
          border: 'var(--color-info-border)',
          label: 'Info',
        };
      case 'danger':
        return {
          bg: 'var(--color-danger-bg)',
          text: 'var(--color-danger)',
          border: 'var(--color-danger-border)',
          label: 'Danger',
        };
      case 'neutral':
      case 'suspended':
      case 'archived':
      case 'closed':
        return {
          bg: '#F0EEE9',
          text: 'var(--color-olive-drab)',
          border: 'var(--color-bone)',
          label: 'Neutral',
        };
      case 'retailer':
        return {
          bg: '#F6F2EA',
          text: 'var(--color-smoky-black)',
          border: 'var(--color-bone)',
          label: 'Retailer',
        };
      case 'sub_wholesaler':
        return {
          bg: '#EAF0F6',
          text: '#2C4964',
          border: '#ADC3D8',
          label: 'Sub-Wholesaler',
        };
      case 'draft':
      default:
        return {
          bg: 'var(--color-surface-muted)',
          text: 'var(--color-olive-drab)',
          border: 'var(--color-bone)',
          label: (label as string) || (status as string) || 'Default',
        };
    }
  };

  const styleConfig = getBadgeStyle();
  const displayLabel = children ?? label ?? styleConfig.label;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontFamily: 'var(--font-family-base)',
        fontWeight: 700,
        borderRadius: 'var(--radius-full)',
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
        border: `1px solid ${styleConfig.border}`,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {displayLabel}
    </span>

  );
};

import React from 'react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'danger' | 'error';
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'error' | string;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  variant,
  title,
  children,
  icon,
  onClose,
  style,
}) => {
  const effectiveType = variant || type || 'info';

  const getStyle = () => {
    switch (effectiveType) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          border: 'var(--color-success-border)',
          color: 'var(--color-success)',
          defaultIcon: '✓',
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-bg)',
          border: 'var(--color-warning-border)',
          color: 'var(--color-warning)',
          defaultIcon: '⚠',
        };
      case 'danger':
      case 'error':
        return {
          bg: 'var(--color-danger-bg)',
          border: 'var(--color-danger-border)',
          color: 'var(--color-danger)',
          defaultIcon: '✕',
        };
      case 'info':
      default:
        return {
          bg: 'var(--color-info-bg)',
          border: 'var(--color-info-border)',
          color: 'var(--color-info)',
          defaultIcon: 'ℹ',
        };
    }
  };

  const config = getStyle();

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-family-mono)',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
        <div
          style={{
            color: config.color,
            fontWeight: 700,
            fontSize: '16px',
            lineHeight: 1.2,
          }}
        >
          {icon || config.defaultIcon}
        </div>
        <div style={{ flex: 1, fontSize: '13px', color: 'var(--color-smoky-black)' }}>
          {title && (
            <div style={{ fontWeight: 700, marginBottom: '2px', color: config.color }}>
              {title}
            </div>
          )}
          <div>{children}</div>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: config.color,
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 4px',
            fontWeight: 'bold',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

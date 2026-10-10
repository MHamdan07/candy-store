import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bone' | 'confectionery' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'bone':
        return {
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          color: 'var(--color-text)',
        };
      case 'confectionery':
        return {
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #FFE4E6',
          boxShadow: '0 8px 24px rgba(225, 29, 72, 0.06)',
          borderRadius: 'var(--radius-lg)',
        };
      case 'dark':
        return {
          backgroundColor: '#0F172A',
          border: '1px solid #1E293B',
          color: '#F8FAFC',
        };
      case 'default':
      default:
        return {
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
        };
    }
  };

  const getPaddingStyles = (): React.CSSProperties => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: '12px' };
      case 'lg':
        return { padding: '24px' };
      case 'md':
      default:
        return { padding: '18px' };
    }
  };

  return (
    <div
      style={{
        ...getVariantStyles(),
        ...getPaddingStyles(),
        transition: 'all 0.2s ease',
        ...(hoverable
          ? {
              cursor: 'pointer',
            }
          : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

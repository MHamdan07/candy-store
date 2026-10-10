import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'promo' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-promo-crimson)',
          color: '#FFFFFF',
          border: '1px solid var(--color-promo-crimson)',
          boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
        };
      case 'secondary':
        return {
          backgroundColor: '#1E293B',
          color: '#F8FAFC',
          border: '1px solid #1E293B',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.1)',
        };
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          color: 'var(--color-text)',
          border: '1.5px solid var(--color-border)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger)',
          color: '#FFFFFF',
          border: '1px solid var(--color-danger)',
        };
      case 'promo':
        return {
          backgroundColor: 'var(--color-promo-crimson)',
          color: '#FFFFFF',
          border: '1px solid var(--color-promo-crimson)',
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-muted)',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)', minHeight: '34px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '15px', borderRadius: 'var(--radius-md)', minHeight: '48px' };
      case 'md':
      default:
        return { padding: '9px 18px', fontSize: '14px', borderRadius: 'var(--radius-sm)', minHeight: '40px' };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    boxShadow: variant === 'ghost' ? 'none' : 'var(--shadow-sm)',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button disabled={disabled || isLoading} style={baseStyles} {...props}>
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'candi-spin 0.75s linear infinite',
          }}
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefixText,
  leftIcon,
  rightIcon,
  id,
  style,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}
      >
        {prefixText && (
          <span
            style={{
              padding: '0 12px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-muted)',
              borderRight: '1px solid var(--color-border)',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {prefixText}
          </span>
        )}

        {leftIcon && (
          <span style={{ paddingLeft: '12px', color: 'var(--color-text-dim)', display: 'flex' }}>
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          style={{
            flex: 1,
            height: '42px',
            padding: '0 14px',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-family-base)',
            fontSize: '14px',
            color: 'var(--color-text)',
            backgroundColor: 'transparent',
            ...style,
          }}
          {...props}
        />

        {rightIcon && (
          <span style={{ paddingRight: '12px', color: 'var(--color-text-dim)', display: 'flex' }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 600 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

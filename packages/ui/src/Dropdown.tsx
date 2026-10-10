import React from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: DropdownOption[];
  error?: string;
  helperText?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  error,
  helperText,
  id,
  style,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-smoky-black)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <select
          id={selectId}
          style={{
            width: '100%',
            height: '38px',
            padding: '0 32px 0 12px',
            backgroundColor: '#FFFFFF',
            border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-bone)'}`,
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-family-mono)',
            fontSize: '14px',
            color: 'var(--color-smoky-black)',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            ...style,
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--color-olive-drab)',
            fontSize: '12px',
          }}
        >
          ▼
        </span>
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 500 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

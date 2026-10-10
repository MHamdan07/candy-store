import React from 'react';

export interface Column<T> {
  header: React.ReactNode;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
  isLoading = false,
}: TableProps<T>) {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-surface-muted)', borderBottom: '1.5px solid var(--color-border)' }}>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '12px 16px',
                  fontFamily: 'var(--font-family-base)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  width: col.width,
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-dim)', fontFamily: 'var(--font-family-base)' }}
              >
                Loading data...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-dim)', fontFamily: 'var(--font-family-base)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor ? keyExtractor(row, rowIdx) : ((row as any).id || (row as any).code || rowIdx)}
                style={{
                  borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--color-border-subtle)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    style={{
                      padding: '14px 16px',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: '13.5px',
                      color: 'var(--color-text)',
                      textAlign: col.align || 'left',
                    }}
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : col.accessor
                      ? String(row[col.accessor] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

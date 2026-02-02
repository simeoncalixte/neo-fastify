import React from 'react';

type DynamicTableProps = {
  data: any[];
  columns: string[]; // dot-paths like "estimated_diameter.kilometers.estimated_diameter_min"
  headers?: string[];
  onRowClick?: (row: any) => void;
};

const getValue = (obj: any, path: string) => {
  if (obj == null) return '';
  if (!path) return '';
  const parts = path.split('.');
  let cur: any = obj;
  for (const part of parts) {
    if (cur == null) return '';
    // numeric index support when path segment is a number
    if (/^\d+$/.test(part)) {
      cur = cur[parseInt(part, 10)];
    } else {
      cur = cur[part];
    }
  }
  if (cur == null) return '';
  if (typeof cur === 'object') return JSON.stringify(cur);
  return String(cur);
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const thTdStyle: React.CSSProperties = {
  border: '1px solid #e6e6e6',
  padding: '8px 10px',
  textAlign: 'left',
  fontSize: 13,
};

export default function DynamicTable({ data, columns, headers, onRowClick }: DynamicTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {(headers || columns).map((h, i) => (
              <th key={i} style={{ ...thTdStyle, background: '#fafafa' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr
              key={rIdx}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col, cIdx) => (
                <td key={cIdx} style={thTdStyle}>{getValue(row, col)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

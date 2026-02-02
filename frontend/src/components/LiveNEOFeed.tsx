import React from 'react';
import DynamicTable from './DynamicTable';
import NEODetails from './NEODetails';
import useLiveNEOFeed from '../hooks/useLiveNEOFeed';

export default function LiveNEOFeed() {
  const { start, end, setStart, setEnd, items, loading, error, selected, fetchFeed, lookup } = useLiveNEOFeed();
  const [sortBy, setSortBy] = React.useState<'none' | 'size' | 'closeness' | 'velocity'>('none');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

  const getNumeric = (row: any, key: typeof sortBy) => {
    try {
      if (!row) return NaN;
      if (key === 'size') {
        const a = row?.estimated_diameter?.kilometers?.estimated_diameter_min;
        const b = row?.estimated_diameter?.kilometers?.estimated_diameter_max;
        const v = (parseFloat(a) || 0) + (parseFloat(b) || 0);
        return v / 2;
      }
      if (key === 'closeness') {
        const v = row?.close_approach_data?.[0]?.miss_distance?.kilometers;
        return parseFloat(v) || NaN;
      }
      if (key === 'velocity') {
        const v = row?.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second;
        return parseFloat(v) || NaN;
      }
      return NaN;
    } catch (e) {
      return NaN;
    }
  };

  const sortedItems = React.useMemo(() => {
    if (sortBy === 'none') return items;
    const copy = [...items];
    copy.sort((a, b) => {
      const va = getNumeric(a, sortBy);
      const vb = getNumeric(b, sortBy);
      const na = isNaN(va) ? 0 : va;
      const nb = isNaN(vb) ? 0 : vb;
      if (na === nb) return 0;
      return (na - nb) * (sortDir === 'asc' ? 1 : -1);
    });
    return copy;
  }, [items, sortBy, sortDir]);

  return (
    <div>
      <h3>Live Feed (backend)</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <label>Start: <input value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>End: <input value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <button onClick={() => fetchFeed()} disabled={loading}>Fetch</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 13 }}>Sort:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={{ marginLeft: 8 }}>
              <option value="none">None</option>
              <option value="size">Size</option>
              <option value="closeness">Closeness</option>
              <option value="velocity">Relative Velocity</option>
            </select>
          </label>
          <button onClick={() => setSortDir((d) => d === 'asc' ? 'desc' : 'asc')} style={{ fontSize: 13 }}>{sortDir === 'asc' ? 'Asc' : 'Desc'}</button>
        </div>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <DynamicTable
        data={sortedItems}
        columns={[ 'neo_reference_id', 'name', 'close_approach_data.0.close_approach_date', 'close_approach_data.0.miss_distance.kilometers', 'close_approach_data.0.relative_velocity.kilometers_per_second' ]}
        headers={[ 'Ref', 'Name', 'Approach', 'Miss km', 'Rel Vel (km/s)' ]}
        onRowClick={(row) => lookup(row)}
      />
      <NEODetails neo={selected} />
    </div>
  );
}

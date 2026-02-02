import React from 'react';
import DynamicTable from './DynamicTable';
import NEODetails from './NEODetails';
import useLiveNEOBrowse from '../hooks/useLiveNEOBrowse';

export default function LiveNEOBrowse() {
  const {
    items,
    loading,
    error,
    selected,
    pageInfo,
    canPrev,
    canNext,
    prevPage,
    nextPage,
    lookup,
  } = useLiveNEOBrowse();
  const [sortBy, setSortBy] = React.useState<'none' | 'size' | 'closeness' | 'velocity'>('none');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

  const getNumeric = (row: any, key: typeof sortBy) => {
    try {
      if (!row) return NaN;
      if (key === 'size') {
        const a = row?.estimated_diameter?.kilometers?.estimated_diameter_min;
        const b = row?.estimated_diameter?.kilometers?.estimated_diameter_max;
        return ((parseFloat(a) || 0) + (parseFloat(b) || 0)) / 2;
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
      <h3>Live Browse (backend)</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <div>
          <button onClick={prevPage} disabled={!canPrev}>Prev</button>
          <button onClick={nextPage} disabled={!canNext} style={{ marginLeft: 8 }}>Next</button>
        </div>
        <div style={{ fontSize: 13 }}>
          {pageInfo ? `Page ${(pageInfo.number ?? 0) + 1} of ${pageInfo.total_pages} — ${pageInfo.total_elements} items` : ''}

        </div>
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
        columns={[ 'neo_reference_id', 'name', 'estimated_diameter.kilometers.estimated_diameter_max', 'close_approach_data.0.miss_distance.kilometers', 'close_approach_data.0.relative_velocity.kilometers_per_second' ]}
        headers={[ 'Ref', 'Name', 'Size (km max)', 'Miss km', 'Rel Vel (km/s)' ]}
        onRowClick={lookup}
      />
      <NEODetails neo={selected} />
    </div>
  );
}

import React from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function useLiveNEOFeed(initialStart = '2021-01-01', initialEnd = '2021-01-02') {
  const [start, setStart] = React.useState(initialStart);
  const [end, setEnd] = React.useState(initialEnd);
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<any | null>(null);

  const fetchFeed = React.useCallback(async (s?: string, e?: string) => {
    const useStart = s ?? start;
    const useEnd = e ?? end;
    setLoading(true);
    setError(null);
    setItems([]);
    try {
      const url = new URL(`${API_BASE}/neo/feed`);
      url.searchParams.set('start_date', useStart);
      url.searchParams.set('end_date', useEnd);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (!json || !json.success) throw new Error(json?.message || 'Failed to fetch feed');
      const feed = json.data?.near_earth_objects || {};
      const flattened = Object.values(feed).flat();
      setItems(flattened);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  React.useEffect(() => {
    // load initial feed on mount (uses current `start`/`end` values)
    fetchFeed();
  }, [fetchFeed]);

  const lookup = React.useCallback(async (row: any) => {
    try {
      const id = row.neo_reference_id || row.id;
      if (!id) return;
      const res = await fetch(`${API_BASE}/neo/lookup/${parseInt(String(id), 10)}`);
      const json = await res.json();
      if (!json || !json.success) throw new Error(json?.message || 'lookup failed');
      setSelected(json.data);
    } catch (err: any) {
      setError(String(err.message || err));
    }
  }, []);

  return {
    start,
    end,
    setStart,
    setEnd,
    items,
    loading,
    error,
    selected,
    fetchFeed,
    lookup,
  };
}

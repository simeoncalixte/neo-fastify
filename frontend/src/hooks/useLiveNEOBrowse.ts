import React from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function useLiveNEOBrowse() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<any | null>(null);
  const [pageInfo, setPageInfo] = React.useState<{ size?: number; total_elements?: number; total_pages?: number; number?: number } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/neo/browse`);
        const json = await res.json();
        if (!json || !json.success) {
          throw new Error(json?.message || 'Failed to fetch browse');
        }
        const page = json.data || {};
        const list = Array.isArray(page.near_earth_objects) ? page.near_earth_objects : [];
        if (mounted) {
          setItems(list);
          setPageInfo(page.page || null);
        }
      } catch (err: any) {
        setError(String(err.message || err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const gotoPage = React.useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const sizePart = pageInfo?.size ? `&size=${encodeURIComponent(String(pageInfo.size))}` : '';
      const res = await fetch(`${API_BASE}/neo/browse?page=${encodeURIComponent(String(pageNum))}${sizePart}`);
      const json = await res.json();
      if (!json || !json.success) throw new Error(json?.message || 'Failed to fetch page');
      const page = json.data || {};
      const list = Array.isArray(page.near_earth_objects) ? page.near_earth_objects : [];
      setItems(list);
      setPageInfo(page.page || null);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }, [pageInfo?.size]);

  const currentPageNumber = pageInfo?.number ?? null;
  const pageSize = pageInfo?.size ?? null;
  const canPrev = !loading && currentPageNumber !== null && currentPageNumber > 0;
  const canNext = !loading && currentPageNumber !== null && (pageInfo?.total_pages == null || currentPageNumber < (pageInfo!.total_pages - 1));

  const prevPage = React.useCallback(() => {
    if (currentPageNumber === null || currentPageNumber <= 0) return;
    gotoPage(currentPageNumber - 1);
  }, [currentPageNumber, gotoPage]);

  const nextPage = React.useCallback(() => {
    if (currentPageNumber === null) return;
    const target = currentPageNumber + 1;
    if (pageInfo?.total_pages != null && target >= pageInfo.total_pages) return;
    gotoPage(target);
  }, [currentPageNumber, gotoPage, pageInfo?.total_pages]);

  const lookup = React.useCallback(async (row: any) => {
    try {
      const id = row.neo_reference_id || row.id || row.neoId || row.reference || row.neo_reference;
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
    items,
    loading,
    error,
    selected,
    pageInfo,
    currentPageNumber,
    pageSize,
    canPrev,
    canNext,
    prevPage,
    nextPage,
    gotoPage,
    lookup,
  };
}

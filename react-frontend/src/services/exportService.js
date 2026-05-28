// Downloads the server-generated tasks XLSX through the authenticated API.
// Returns nothing — triggers a browser save dialog as a side effect.

import { apiFetch } from './apiClient';

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const filenameFromHeader = (header) => {
  if (!header) return null;
  const match = /filename="?([^"]+)"?/.exec(header);
  return match ? match[1] : null;
};

// Accepts optional { from, to } in YYYY-MM-DD. Backend filters on
// DATE(created_at) inclusive on both ends; omitting either side means
// "unbounded on that side".
export const exportService = {
  async downloadAllTasks({ from, to } = {}) {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    const res = await apiFetch(`/export/tasks.xlsx${qs ? `?${qs}` : ''}`);
    if (!res.ok) {
      let msg = `Export failed (HTTP ${res.status})`;
      try {
        const j = await res.json();
        if (j?.message) msg = j.message;
      } catch {
        /* not JSON */
      }
      throw new Error(msg);
    }
    const blob = await res.blob();
    const filename =
      filenameFromHeader(res.headers.get('content-disposition')) ??
      `ara-tasks-${new Date().toISOString().slice(0, 10)}.xlsx`;
    triggerDownload(blob, filename);
  },
};

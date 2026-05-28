// Date-range picker for the "Export to Excel" action on Management → All
// Tasks. Both dates are optional — leaving either blank means "unbounded
// on that side" so the user can grab "everything since X" or "everything
// up to Y" without filling both fields.

import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

export const ExportTasksDialog = ({
  open,
  busy = false,
  error = null,
  onCancel,
  onConfirm,
}) => {
  // Sensible default: last 30 days. Matches the in-app default view so the
  // export "feels like what I'm looking at" unless the user widens it.
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (open) {
      const t = today();
      const thirty = new Date();
      thirty.setDate(thirty.getDate() - 30);
      setFrom(thirty.toISOString().slice(0, 10));
      setTo(t);
    }
  }, [open]);

  if (!open) return null;

  const rangeInvalid = from && to && from > to;
  const canConfirm = !busy && !rangeInvalid;

  const handleKey = (e) => {
    if (e.key === 'Escape') onCancel?.();
    if (e.key === 'Enter' && canConfirm) onConfirm?.({ from, to });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
      onKeyDown={handleKey}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-jira-lg bg-card p-5 shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Download size={18} className="text-primary" />
            </span>
            <h3 className="text-base font-semibold text-ink">
              Export tasks to Excel
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-jira p-1 text-ink-light hover:bg-surface hover:text-ink-secondary"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-sm text-ink-secondary">
          Choose the date range (based on when each task was created). Leave a
          field blank to leave that side open.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-ink-secondary">
            From
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="input-base mt-1"
              disabled={busy}
            />
          </label>
          <label className="text-xs font-medium text-ink-secondary">
            To
            <input
              type="date"
              value={to}
              min={from || undefined}
              max={today()}
              onChange={(e) => setTo(e.target.value)}
              className="input-base mt-1"
              disabled={busy}
            />
          </label>
        </div>

        {rangeInvalid && (
          <p className="mt-3 rounded-jira bg-error/10 px-3 py-2 text-xs text-error">
            "From" must be on or before "To".
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-jira bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => canConfirm && onConfirm?.({ from, to })}
            disabled={!canConfirm}
            className="btn-primary"
          >
            <Download size={14} />
            {busy ? 'Generating…' : 'Download Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

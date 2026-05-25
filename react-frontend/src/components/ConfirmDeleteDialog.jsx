// Destructive-action modal. The Delete button stays disabled until the user
// types the literal word "Delete" in the input box — same convention as
// GitHub's repo-delete confirmation.

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { colors } from '@/utils/theme';

const CONFIRM_TEXT = 'Delete';

export const ConfirmDeleteDialog = ({
  open,
  title,
  itemLabel,
  onCancel,
  onConfirm,
  busy = false,
  error = null,
}) => {
  const [typed, setTyped] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTyped('');
      // Auto-focus the input shortly after the dialog renders.
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open]);

  if (!open) return null;

  const canConfirm = typed === CONFIRM_TEXT && !busy;

  const handleKey = (e) => {
    if (e.key === 'Escape') onCancel?.();
    if (e.key === 'Enter' && canConfirm) onConfirm?.();
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
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.error}1A` }}
            >
              <AlertTriangle size={18} color={colors.error} />
            </span>
            <h3 className="text-base font-semibold text-ink">{title}</h3>
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
          You are about to permanently delete{' '}
          <span className="font-semibold text-ink">{itemLabel}</span>. This
          action cannot be undone.
        </p>

        <p className="mt-3 text-xs text-ink-light">
          To confirm, type <span className="font-mono font-bold">Delete</span>{' '}
          in the box below and press the Delete button.
        </p>

        <input
          ref={inputRef}
          type="text"
          className="input-base mt-2"
          placeholder="Type Delete"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          disabled={busy}
        />

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
            onClick={() => canConfirm && onConfirm?.()}
            disabled={!canConfirm}
            className="btn-danger"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

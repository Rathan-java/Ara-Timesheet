// Admin password-reset modal. Used by management on the Employees page to
// set a new login password for any employee without needing their current
// password. Calls POST /api/users/:id/reset-password (added in
// feat/admin-password-reset PR on the backend).

import { Eye, EyeOff, KeyRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { colors } from '@/utils/theme';

export const ResetPasswordDialog = ({
  open,
  userLabel,
  onCancel,
  onConfirm,
  busy = false,
  error = null,
}) => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setShow(false);
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open]);

  if (!open) return null;

  const canSubmit = password.length >= 6 && !busy;

  const handleKey = (e) => {
    if (e.key === 'Escape') onCancel?.();
    if (e.key === 'Enter' && canSubmit) onConfirm?.(password);
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
              style={{ backgroundColor: `${colors.primary}1A` }}
            >
              <KeyRound size={18} color={colors.primary} />
            </span>
            <h3 className="text-base font-semibold text-ink">Reset password</h3>
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
          Setting a new password for{' '}
          <span className="font-semibold text-ink">{userLabel}</span>. They
          will need this new password the next time they sign in.
        </p>

        <p className="mt-3 text-xs text-ink-light">
          New password (at least 6 characters)
        </p>
        <div className="relative mt-1">
          <input
            ref={inputRef}
            type={show ? 'text' : 'password'}
            className="input-base pr-10"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={busy}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-secondary"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

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
            onClick={() => canSubmit && onConfirm?.(password)}
            disabled={!canSubmit}
            className="btn-primary"
          >
            {busy ? 'Resetting…' : 'Reset password'}
          </button>
        </div>
      </div>
    </div>
  );
};

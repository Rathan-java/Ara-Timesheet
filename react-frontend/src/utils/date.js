// Mirrors the deadline formatting used by Flutter TaskCard._formatDate.
export const formatDeadline = (iso) => {
  const date = new Date(iso);
  const now = new Date();

  const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const diffDays = Math.round(
    (startOfDay(date) - startOfDay(now)) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${-diffDays}d ago`;
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

export const formatShortDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export const formatLongDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// For <input type="date"> values.
export const toDateInput = (iso) => new Date(iso).toISOString().slice(0, 10);

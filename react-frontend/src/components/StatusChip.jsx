import { statusDisplayName } from '@/types';
import { statusColor, withAlpha } from '@/utils/theme';

export const StatusChip = ({ status, size = 'md' }) => {
  const color = statusColor(status);
  const isSmall = size === 'sm';
  return (
    <span
      className={`inline-flex items-center rounded-[3px] font-bold uppercase tracking-wide ${
        isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'
      }`}
      style={{ backgroundColor: withAlpha(color, 0.15), color }}
    >
      {statusDisplayName(status)}
    </span>
  );
};

const STATUSES = ['todo', 'inProgress', 'review', 'done'];

export const StatusSelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => {
        const color = statusColor(s);
        const selected = value === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="rounded-jira border px-3 py-2 text-xs font-bold uppercase tracking-wide transition"
            style={{
              backgroundColor: selected ? color : withAlpha(color, 0.1),
              color: selected ? 'white' : color,
              borderColor: color,
              borderWidth: selected ? 2 : 1,
            }}
          >
            {statusDisplayName(s)}
          </button>
        );
      })}
    </div>
  );
};

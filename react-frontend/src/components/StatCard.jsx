import { withAlpha } from '@/utils/theme';

export const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-base flex w-full flex-col items-start gap-2 p-4 text-left transition hover:shadow-card-hover"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <span
        className="inline-flex items-center justify-center rounded-jira-lg p-2"
        style={{ backgroundColor: withAlpha(color, 0.12) }}
      >
        <Icon size={22} color={color} />
      </span>
      <span className="text-2xl font-bold text-ink">{value}</span>
      <span className="text-sm font-medium text-ink-secondary">{title}</span>
      {subtitle && (
        <span className="text-xs font-medium" style={{ color }}>
          {subtitle}
        </span>
      )}
    </button>
  );
};

export const MiniStatCard = ({ title, value, color }) => {
  return (
    <div
      className="flex flex-1 flex-col items-center rounded-jira-lg px-3 py-2"
      style={{ backgroundColor: withAlpha(color, 0.12) }}
    >
      <span className="text-xl font-bold" style={{ color }}>
        {value}
      </span>
      <span
        className="mt-0.5 text-xs font-medium"
        style={{ color: withAlpha(color, 0.85) }}
      >
        {title}
      </span>
    </div>
  );
};

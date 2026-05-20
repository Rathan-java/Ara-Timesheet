import { ChevronDown, ChevronUp, ChevronsUp, Minus } from 'lucide-react';
import { priorityDisplayName } from '@/types';
import { priorityColor, withAlpha } from '@/utils/theme';

const iconFor = (p) => {
  switch (p) {
    case 'highest':
      return ChevronsUp;
    case 'high':
      return ChevronUp;
    case 'medium':
      return Minus;
    case 'low':
      return ChevronDown;
    default:
      return Minus;
  }
};

export const PriorityIcon = ({ priority, size = 16, showLabel = false }) => {
  const Icon = iconFor(priority);
  const color = priorityColor(priority);
  if (showLabel) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-medium"
        style={{ color }}
      >
        <Icon size={size} />
        {priorityDisplayName(priority)}
      </span>
    );
  }
  return (
    <span title={priorityDisplayName(priority)}>
      <Icon size={size} color={color} />
    </span>
  );
};

const PRIORITIES = ['low', 'medium', 'high', 'highest'];

export const PrioritySelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {PRIORITIES.map((p) => {
        const Icon = iconFor(p);
        const color = priorityColor(p);
        const selected = value === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className="inline-flex items-center gap-1.5 rounded-jira border px-3 py-2 text-xs font-medium transition"
            style={{
              backgroundColor: selected ? withAlpha(color, 0.15) : '#EBECF0',
              color: selected ? color : '#333',
              borderColor: selected ? color : '#DFE1E6',
              borderWidth: selected ? 2 : 1,
            }}
          >
            <Icon size={14} color={color} />
            {priorityDisplayName(p)}
          </button>
        );
      })}
    </div>
  );
};

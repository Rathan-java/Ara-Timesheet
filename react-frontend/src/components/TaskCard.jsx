import { Clock } from 'lucide-react';
import { issueKey, isOverdue } from '@/types';
import { colors, statusColor, withAlpha } from '@/utils/theme';
import { formatDeadline } from '@/utils/date';
import { Avatar } from './Avatar.jsx';
import { IssueTypeIcon } from './IssueTypeIcon.jsx';
import { PriorityIcon } from './PriorityIcon.jsx';
import { StatusChip } from './StatusChip.jsx';

export const TaskCard = ({
  task,
  onClick,
  showAssignee = true,
  showWorkspace = true,
}) => {
  const overdue = isOverdue(task);
  // Jira-style: white card body, thin status-colored accent strip on the left.
  const accent = statusColor(task.status);
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-base w-full p-4 text-left transition hover:shadow-card-hover"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      {/* Issue key + priority */}
      <div className="flex items-center gap-2">
        <IssueTypeIcon type="task" size={14} />
        <span
          className="text-[13px] font-semibold"
          style={{ color: colors.primary }}
        >
          {issueKey(task)}
        </span>
        <span className="ml-auto">
          <PriorityIcon priority={task.priority} size={18} />
        </span>
      </div>

      <h3 className="mt-2 line-clamp-2 text-[15px] font-medium leading-snug text-ink">
        {task.title}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusChip status={task.status} size="sm" />
        {showWorkspace && (
          <span className="rounded-[3px] bg-surface px-1.5 py-0.5 text-[11px] font-medium text-ink-secondary">
            {task.workspaceName}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {showAssignee && (
          <>
            <Avatar name={task.assigneeName} size={22} />
            <span className="flex-1 truncate text-xs text-ink-secondary">
              {task.assigneeName}
            </span>
          </>
        )}
        <span
          className="ml-auto inline-flex items-center gap-1 text-[11px]"
          style={{
            color: overdue ? colors.error : colors.textLight,
            fontWeight: overdue ? 600 : 400,
          }}
        >
          <Clock size={12} />
          {formatDeadline(task.deadline)}
        </span>
      </div>

      {task.labels.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary"
              style={{ backgroundColor: withAlpha(colors.labelBlue, 0.15) }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </button>
  );
};

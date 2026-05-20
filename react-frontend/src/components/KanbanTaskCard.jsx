import { forwardRef } from 'react';
import { Clock } from 'lucide-react';
import { issueKey, isOverdue } from '@/types';
import { colors, priorityColor } from '@/utils/theme';
import { Avatar } from './Avatar.jsx';
import { IssueTypeIcon } from './IssueTypeIcon.jsx';
import { PriorityIcon } from './PriorityIcon.jsx';

export const KanbanTaskCard = forwardRef(
  ({ task, onClick, isDragging = false, isOverlay = false }, ref) => {
    const overdue = isOverdue(task);
    // Jira-style: white card body, thin priority-colored accent strip on the
    // left. The column conveys status; the strip + priority icon convey priority.
    const accent = priorityColor(task.priority);

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`group cursor-pointer rounded-jira border bg-card p-3 transition ${
          isOverlay ? 'shadow-card-hover' : 'shadow-card hover:shadow-card-hover'
        } ${isDragging ? 'opacity-40' : ''}`}
        style={{
          borderColor: isOverlay ? colors.primary : colors.divider,
          borderWidth: isOverlay ? 2 : 1,
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <h4 className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">
          {task.title}
        </h4>

        <div className="mt-2.5 flex items-center gap-1.5">
          <IssueTypeIcon type="task" size={12} />
          <span
            className="text-[11px] font-medium"
            style={{ color: colors.primary }}
          >
            {issueKey(task)}
          </span>
          <span className="ml-auto">
            <PriorityIcon priority={task.priority} size={14} />
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="rounded-[2px] bg-surface px-1 py-0.5 text-[9px] font-medium text-ink-secondary">
            {task.workspaceName}
          </span>
          <span
            className="ml-auto inline-flex items-center gap-1 text-[10px]"
            style={{ color: overdue ? colors.error : colors.textLight }}
          >
            <Clock size={11} />
            {new Date(task.deadline).getDate()}/
            {new Date(task.deadline).getMonth() + 1}
          </span>
          <Avatar name={task.assigneeName} size={18} />
        </div>
      </div>
    );
  },
);

KanbanTaskCard.displayName = 'KanbanTaskCard';

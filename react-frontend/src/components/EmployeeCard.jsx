import { KeyRound, Mail, Trash2 } from 'lucide-react';
import { roleDisplayName } from '@/types';
import { colors } from '@/utils/theme';
import { Avatar } from './Avatar.jsx';

// Props:
// - user, tasks, onClick: as before
// - onDelete (optional): when passed, shows a trash icon. Receives no args;
//   parent owns the confirm dialog + actual API call.
// - onResetPassword (optional): when passed, shows a key icon. Same pattern.
export const EmployeeCard = ({
  user,
  tasks = [],
  onClick,
  onDelete,
  onResetPassword,
}) => {
  const total = tasks.length;
  const counts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'inProgress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };
  const completionPct = total > 0 ? Math.round((counts.done / total) * 100) : 0;
  const hasActions = Boolean(onDelete || onResetPassword);

  const handleActivate = () => {
    if (onClick) onClick();
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? handleActivate : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleActivate();
        }
      }}
      className={`card-base group/card w-full p-4 text-left transition hover:shadow-card-hover ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{ borderLeft: `3px solid ${colors.primary}` }}
    >
      <div className="flex items-start gap-3">
        <Avatar name={user.name} url={user.avatarUrl} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-ink">
            {user.name}
          </h3>
          <p className="truncate text-xs text-ink-light">{user.designation}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-light">
            <Mail size={11} /> {user.email}
          </p>
        </div>
        {/* Action icons + role chip share the same flex slot so they never
            overlap. Icons fade in on hover; the chip stays put. */}
        <div className="flex items-center gap-1">
          {hasActions && (
            <div className="flex items-center gap-0.5 opacity-0 transition group-hover/card:opacity-100 focus-within:opacity-100">
              {onResetPassword && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetPassword();
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-jira text-ink-light transition hover:bg-primary/10 hover:text-primary"
                  title="Reset password"
                  aria-label={`Reset password for ${user.name}`}
                >
                  <KeyRound size={13} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-jira text-ink-light transition hover:bg-error/10 hover:text-error"
                  title="Delete employee"
                  aria-label={`Delete ${user.name}`}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
          <span className="rounded-[3px] bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-secondary">
            {roleDisplayName(user.role)}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-divider pt-3">
        <StatusStat label="To Do" value={counts.todo} color={colors.todoGray} />
        <StatusStat
          label="Progress"
          value={counts.inProgress}
          color={colors.progressBlue}
        />
        <StatusStat
          label="Review"
          value={counts.review}
          color={colors.reviewPurple}
        />
        <StatusStat label="Done" value={counts.done} color={colors.doneGreen} />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-medium uppercase tracking-wide text-ink-light">
            Completion
          </span>
          <span
            className="font-semibold"
            style={{ color: completionPct > 0 ? colors.doneGreen : colors.textLight }}
          >
            {completionPct}% · {counts.done}/{total}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${completionPct}%`,
              backgroundColor: colors.doneGreen,
            }}
          />
        </div>
      </div>

      {user.teamId && (
        <div className="mt-2 text-[11px] text-ink-light">
          Team: <span className="text-ink-secondary">{user.teamId}</span>
        </div>
      )}
    </div>
  );
};

const StatusStat = ({ label, value, color }) => (
  <div>
    <div className="text-[10px] font-medium uppercase tracking-wide text-ink-light">
      {label}
    </div>
    <div className="text-base font-bold" style={{ color }}>
      {value}
    </div>
  </div>
);

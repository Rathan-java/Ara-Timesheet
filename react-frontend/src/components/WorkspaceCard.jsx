import { ArrowLeft, ChevronDown, Folder, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { iconByName } from './iconRegistry.js';
import { Avatar } from './Avatar.jsx';
import { workspaceCompletion } from '@/types';
import { withAlpha, colors } from '@/utils/theme';

// Props:
// - workspace (required)
// - onClick (optional): fired when the card body is activated (navigate to detail)
// - members (optional): resolved User objects. When passed, the "N members"
//   text becomes a dropdown listing names.
// - onMemberClick (optional): called with userId when a member's row is picked.
// - canEditMembers (optional): when true, shows + and × controls in the dropdown.
// - nonMembers (optional): User objects available to add. Required if canEditMembers.
// - onAddMember (optional): async (userId) => void.  Required if canEditMembers.
// - onRemoveMember (optional): async (userId) => void. Required if canEditMembers.
export const WorkspaceCard = ({
  workspace,
  onClick,
  members,
  onMemberClick,
  canEditMembers = false,
  nonMembers = [],
  onAddMember,
  onRemoveMember,
  onDelete,
}) => {
  const Icon = iconByName(workspace.icon) ?? Folder;
  const pct = Math.round(workspaceCompletion(workspace) * 100);

  const [open, setOpen] = useState(false);
  // 'members' = list current members, 'add' = pick someone to add.
  const [mode, setMode] = useState('members');
  const [busy, setBusy] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside of it. Also reset mode on close
  // so reopening the dropdown starts back on the member list.
  useEffect(() => {
    if (!open) {
      setMode('members');
      return undefined;
    }
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const memberCount = members?.length ?? workspace.memberIds.length;
  const showDropdown = Array.isArray(members) && members.length > 0;

  const handleCardActivate = () => {
    if (open || !onClick) return;
    onClick();
  };

  const handleAdd = async (uid) => {
    if (!onAddMember || busy) return;
    setBusy(true);
    try {
      await onAddMember(uid);
      setMode('members');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (uid) => {
    if (!onRemoveMember || busy) return;
    setBusy(true);
    try {
      await onRemoveMember(uid);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleCardActivate}
      onKeyDown={(e) => {
        if (onClick && !open && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`card-base group/wscard relative w-full p-4 text-left transition hover:shadow-card-hover ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{ borderLeft: `3px solid ${workspace.color}` }}
    >
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-jira text-ink-light opacity-0 transition hover:bg-error/10 hover:text-error group-hover/wscard:opacity-100 focus:opacity-100"
          title="Delete workspace"
          aria-label={`Delete ${workspace.name}`}
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className="flex items-start gap-3">
        <span
          className="inline-flex items-center justify-center rounded-jira-lg p-2.5"
          style={{ backgroundColor: withAlpha(workspace.color, 0.15) }}
        >
          <Icon size={22} color={workspace.color} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-ink">
              {workspace.name}
            </h3>
            <span
              className="rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: withAlpha(workspace.color, 0.15),
                color: workspace.color,
              }}
            >
              {workspace.projectCode}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-secondary">
            {workspace.description}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-ink-secondary">Progress</span>
          <span className="font-semibold" style={{ color: workspace.color }}>
            {pct}% · {workspace.completedTasks}/{workspace.totalTasks}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: workspace.color,
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-light">
        {/* Members trigger + dropdown */}
        <div className="relative" ref={dropdownRef}>
          {showDropdown ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
              className="inline-flex items-center gap-1 rounded-jira px-1.5 py-0.5 transition hover:bg-surface hover:text-ink-secondary"
              aria-expanded={open}
              aria-haspopup="listbox"
            >
              {memberCount} members
              <ChevronDown
                size={11}
                className={`transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
          ) : (
            <span>{memberCount} members</span>
          )}

          {open && showDropdown && (
            <div
              role="listbox"
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full z-20 mt-1 max-h-72 w-64 overflow-auto rounded-jira border border-divider bg-card shadow-card-hover"
            >
              {mode === 'members' ? (
                <>
                  <div className="flex items-center justify-between border-b border-divider px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-light">
                      Members ({members.length})
                    </p>
                    {canEditMembers && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode('add');
                        }}
                        className="inline-flex items-center justify-center rounded-jira p-1 text-ink-secondary transition hover:bg-surface hover:text-primary"
                        title="Add member"
                        aria-label="Add member"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  {members.map((m) => (
                    <MemberRow
                      key={m.id}
                      user={m}
                      canRemove={canEditMembers}
                      busy={busy}
                      onClick={
                        typeof onMemberClick === 'function'
                          ? () => {
                              setOpen(false);
                              onMemberClick(m.id);
                            }
                          : undefined
                      }
                      onRemove={() => handleRemove(m.id)}
                    />
                  ))}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1 border-b border-divider px-2 py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMode('members');
                      }}
                      className="inline-flex items-center justify-center rounded-jira p-1 text-ink-secondary transition hover:bg-surface"
                      title="Back"
                      aria-label="Back to member list"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-light">
                      Add member
                    </p>
                  </div>

                  {nonMembers.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-ink-light">
                      Everyone is already a member of this workspace.
                    </p>
                  ) : (
                    nonMembers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        disabled={busy}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(u.id);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-surface disabled:opacity-50"
                      >
                        <Avatar name={u.name} size={22} url={u.avatarUrl} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">
                            {u.name}
                          </span>
                          <span className="block truncate text-[10px] text-ink-light">
                            {u.designation}
                          </span>
                        </span>
                        <Plus size={12} className="text-ink-light" />
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <span style={{ color: colors.textLight }}>
          Next: {workspace.projectCode}-{workspace.nextIssueNumber}
        </span>
      </div>
    </div>
  );
};

// Member row with optional inline remove button on hover.
const MemberRow = ({ user, canRemove, busy, onClick, onRemove }) => {
  const content = (
    <>
      <Avatar name={user.name} size={22} url={user.avatarUrl} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{user.name}</span>
        <span className="block truncate text-[10px] text-ink-light">
          {user.designation}
        </span>
      </span>
    </>
  );

  return (
    <div className="group/row relative flex items-stretch">
      {onClick ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="flex flex-1 items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-surface"
        >
          {content}
        </button>
      ) : (
        <div className="flex flex-1 items-center gap-2 px-3 py-2 text-xs">
          {content}
        </div>
      )}

      {canRemove && (
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-jira text-ink-light opacity-0 transition group-hover/row:opacity-100 hover:bg-error/10 hover:text-error disabled:opacity-30"
          title={`Remove ${user.name}`}
          aria-label={`Remove ${user.name}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

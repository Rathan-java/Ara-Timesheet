import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  Clock,
  Folder,
  Pencil,
  Tag,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { Avatar } from '@/components/Avatar.jsx';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog.jsx';
import { IssueTypeIcon } from '@/components/IssueTypeIcon.jsx';
import { PriorityIcon, PrioritySelector } from '@/components/PriorityIcon.jsx';
import { StatusChip, StatusSelector } from '@/components/StatusChip.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { issueKey } from '@/types';
import { colors, withAlpha } from '@/utils/theme';
import { formatLongDate, toDateInput } from '@/utils/date';

export const TaskDetailPage = () => {
  const { id } = useParams();
  const { tasks, updateTask, updateTaskStatus, deleteTask } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const task = tasks.find((t) => t.id === id);

  // Delete dialog state. Only mgmt + TL see the trigger.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const canDelete =
    user?.role === 'management' || user?.role === 'teamLead';

  const handleDelete = async () => {
    if (!task) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTask(task.id);
      // Navigate away once the task is gone — going back to the previous list.
      navigate(-1);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete task.');
      setDeleting(false);
    }
  };

  // Inline-edit state. We keep one toggle per editable field.
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [saving, setSaving] = useState(false);
  // When Escape/Enter triggers a programmatic close, the input loses focus and
  // would fire onBlur. This ref tells the blur handler "we already handled it,
  // skip the save". Reset on next blur attempt.
  const skipBlurSaveRef = useRef(false);

  if (!task) {
    return (
      <AppLayout title="Task not found">
        <div className="p-6 text-sm text-ink-secondary">
          We couldn’t find that task. It may have been deleted.
          <div className="mt-3">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <ArrowLeft size={16} /> Go back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const canEdit =
    user?.id === task.assigneeId ||
    user?.role === 'teamLead' ||
    user?.role === 'management';

  const progressPct =
    task.estimatedHours > 0
      ? Math.min(100, Math.round((task.loggedHours / task.estimatedHours) * 100))
      : 0;

  const startTitleEdit = () => {
    skipBlurSaveRef.current = false;
    setTitleDraft(task.title);
    setEditingTitle(true);
  };

  const saveTitle = async () => {
    // Whatever closed us (Enter / blur / programmatic), suppress the next blur
    // so we don't try to save twice.
    skipBlurSaveRef.current = true;
    const next = titleDraft.trim();
    if (!next || next === task.title) {
      setEditingTitle(false);
      return;
    }
    setSaving(true);
    try {
      await updateTask(task.id, { title: next });
      setEditingTitle(false);
    } finally {
      setSaving(false);
    }
  };

  const cancelTitleEdit = () => {
    // Discard the draft and close without saving.
    skipBlurSaveRef.current = true;
    setEditingTitle(false);
  };

  const handleTitleBlur = () => {
    if (skipBlurSaveRef.current) {
      skipBlurSaveRef.current = false;
      return;
    }
    saveTitle();
  };

  const changePriority = async (p) => {
    if (p === task.priority) {
      setEditingPriority(false);
      return;
    }
    setSaving(true);
    try {
      await updateTask(task.id, { priority: p });
      setEditingPriority(false);
    } finally {
      setSaving(false);
    }
  };

  const changeDeadline = async (e) => {
    const v = e.target.value;
    if (!v) return;
    const iso = new Date(v).toISOString();
    if (iso === task.deadline) {
      setEditingDeadline(false);
      return;
    }
    setSaving(true);
    try {
      await updateTask(task.id, { deadline: iso });
      setEditingDeadline(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title={issueKey(task)}>
      <div className="mx-auto max-w-5xl p-4 lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft size={16} /> Back
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="btn-danger"
              title="Delete this task"
            >
              <Trash2 size={16} /> Delete task
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card-base p-5">
              <div className="flex items-center gap-2">
                <IssueTypeIcon type="task" size={16} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: colors.primary }}
                >
                  {issueKey(task)}
                </span>
                {/* Priority — click to edit (inline selector) */}
                <span className="ml-auto">
                  {editingPriority ? (
                    <span className="inline-flex items-center gap-2">
                      <PrioritySelector
                        value={task.priority}
                        onChange={changePriority}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingPriority(false)}
                        className="rounded-jira p-1 text-ink-light hover:bg-surface"
                        aria-label="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => canEdit && setEditingPriority(true)}
                      disabled={!canEdit}
                      className={`inline-flex items-center gap-1 rounded-jira px-2 py-1 transition ${
                        canEdit ? 'hover:bg-surface' : 'cursor-default'
                      }`}
                      title={canEdit ? 'Click to change priority' : ''}
                    >
                      <PriorityIcon
                        priority={task.priority}
                        size={20}
                        showLabel
                      />
                      {canEdit && (
                        <Pencil size={11} className="text-ink-light" />
                      )}
                    </button>
                  )}
                </span>
              </div>

              {/* Title — click to edit, blur to save, Esc to cancel */}
              {editingTitle ? (
                <input
                  autoFocus
                  disabled={saving}
                  className="input-base mt-2 w-full !text-lg font-semibold"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveTitle();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelTitleEdit();
                    }
                  }}
                />
              ) : canEdit ? (
                // Click anywhere on the title to enter edit mode.
                <button
                  type="button"
                  onClick={startTitleEdit}
                  title="Click to edit"
                  className="group/title -mx-2 mt-2 flex w-full items-start gap-2 rounded-jira px-2 py-1 text-left transition hover:bg-surface"
                >
                  <span className="flex-1 text-xl font-semibold text-ink">
                    {task.title}
                  </span>
                  <Pencil
                    size={14}
                    className="mt-1.5 text-ink-light opacity-0 transition group-hover/title:opacity-100"
                  />
                </button>
              ) : (
                <h1 className="mt-2 text-xl font-semibold text-ink">
                  {task.title}
                </h1>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusChip status={task.status} />
                <span className="inline-flex items-center gap-1 rounded-jira bg-surface px-2 py-1 text-xs text-ink-secondary">
                  <Folder size={12} /> {task.workspaceName}
                </span>
              </div>

              {task.labels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {task.labels.map((l) => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-1 rounded-jira px-2 py-0.5 text-[11px] font-medium text-ink-secondary"
                      style={{ backgroundColor: withAlpha(colors.labelBlue, 0.15) }}
                    >
                      <Tag size={10} /> {l}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card-base p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-secondary">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {canEdit && (
              <div className="card-base p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                  Update Status
                </h2>
                <div className="mt-3">
                  <StatusSelector
                    value={task.status}
                    onChange={(s) => updateTaskStatus(task.id, s)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card-base p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                Details
              </h2>
              <DetailRow
                icon={<UserIcon size={14} />}
                label="Assignee"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={task.assigneeName} size={20} /> {task.assigneeName}
                  </span>
                }
              />
              {task.assignedByName && (
                <DetailRow
                  icon={<UserIcon size={14} />}
                  label="Assigned by"
                  value={task.assignedByName}
                />
              )}
              <DetailRow
                icon={<CalendarDays size={14} />}
                label="Created"
                value={formatLongDate(task.createdAt)}
              />
              {/* Deadline — click to edit */}
              <div className="group flex items-start gap-3 border-b border-divider/70 py-2 last:border-b-0">
                <span className="text-ink-light">
                  <CalendarClock size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase text-ink-light">Due</p>
                  {editingDeadline ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        autoFocus
                        type="date"
                        defaultValue={toDateInput(task.deadline)}
                        onChange={changeDeadline}
                        onBlur={() =>
                          // Close on blur if user clicks away without changing
                          setEditingDeadline(false)
                        }
                        className="input-base !py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingDeadline(false)}
                        className="rounded-jira p-1 text-ink-light hover:bg-surface"
                        aria-label="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : canEdit ? (
                    // Click the date to open the editor.
                    <button
                      type="button"
                      onClick={() => setEditingDeadline(true)}
                      title="Click to edit"
                      className="group/deadline -mx-1 mt-0.5 flex w-full items-center gap-2 rounded-jira px-1 text-left transition hover:bg-surface"
                    >
                      <span className="truncate text-sm text-ink">
                        {formatLongDate(task.deadline)}
                      </span>
                      <Pencil
                        size={12}
                        className="text-ink-light opacity-0 transition group-hover/deadline:opacity-100"
                      />
                    </button>
                  ) : (
                    <span className="mt-0.5 block truncate text-sm text-ink">
                      {formatLongDate(task.deadline)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="card-base p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                Time tracking
              </h2>
              <div className="flex items-center justify-between text-xs text-ink-secondary">
                <span>
                  <Clock size={12} className="-mt-0.5 mr-1 inline" />
                  {task.loggedHours}h logged · {task.estimatedHours}h estimated
                </span>
                <span className="font-semibold text-primary">{progressPct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete task?"
        itemLabel={`${issueKey(task)} — ${task.title}`}
        busy={deleting}
        error={deleteError}
        onCancel={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setDeleteError(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 border-b border-divider/70 py-2 last:border-b-0">
    <span className="text-ink-light">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] uppercase text-ink-light">{label}</p>
      <div className="mt-0.5 truncate text-sm text-ink">{value}</div>
    </div>
  </div>
);

import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { PrioritySelector } from '@/components/PriorityIcon.jsx';
import { StatusSelector } from '@/components/StatusChip.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';

export const CreateTaskPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaces, loading, createTask } = useData();

  // Employees can only create tasks in workspaces they're a member of.
  // TLs / management can use any workspace.
  const myWorkspaces = useMemo(() => {
    if (!user) return [];
    if (user.role === 'employee') {
      return workspaces.filter((w) => w.memberIds.includes(user.id));
    }
    return workspaces;
  }, [workspaces, user]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  // Auto-select the first available workspace once the list resolves. Re-runs
  // if the user gets added to a workspace mid-session.
  useEffect(() => {
    if (!workspaceId && myWorkspaces.length > 0) {
      setWorkspaceId(myWorkspaces[0].id);
    }
  }, [myWorkspaces, workspaceId]);
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [estimatedHours, setEstimatedHours] = useState('8');
  const [labels, setLabels] = useState([]);
  const [labelDraft, setLabelDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addLabel = () => {
    const v = labelDraft.trim();
    if (!v) return;
    if (!labels.includes(v)) setLabels([...labels, v]);
    setLabelDraft('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!workspaceId) {
      setError('Pick a workspace.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        workspaceId,
        assigneeId: user.id,
        priority,
        status,
        deadline: new Date(deadline).toISOString(),
        estimatedHours: Number(estimatedHours) || 0,
        labels,
        assignedById: user.id,
      });
      // After creation, jump to the board so the user sees the new card
      // land in whichever column matches the status they picked.
      navigate('/employee/board');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Task">
      <div className="mx-auto max-w-2xl p-4 lg:p-6">
        <form onSubmit={onSubmit} className="card-base space-y-4 p-5">
          <Field label="Title">
            <input
              className="input-base"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              className="input-base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, acceptance criteria, links…"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Workspace">
              {loading && myWorkspaces.length === 0 ? (
                <p className="rounded-jira border border-divider bg-surface px-3 py-2 text-xs text-ink-light">
                  Loading workspaces…
                </p>
              ) : myWorkspaces.length === 0 ? (
                <p className="rounded-jira border border-divider bg-error/10 px-3 py-2 text-xs text-error">
                  You're not a member of any workspace yet. Ask management or
                  your team lead to add you to one.
                </p>
              ) : (
                <select
                  className="input-base"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                >
                  {myWorkspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.projectCode})
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Deadline">
              <input
                type="date"
                className="input-base"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Field>
            <Field label="Estimated hours">
              <input
                type="number"
                min={0}
                className="input-base"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Priority">
            <PrioritySelector value={priority} onChange={setPriority} />
          </Field>

          <Field label="Status">
            <StatusSelector value={status} onChange={setStatus} />
          </Field>

          <Field label="Labels">
            <div className="flex gap-2">
              <input
                className="input-base flex-1"
                placeholder="Add a label (e.g. backend) and press +"
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLabel();
                  }
                }}
              />
              <button
                type="button"
                onClick={addLabel}
                className="btn-secondary"
                aria-label="Add label"
              >
                <Plus size={14} />
              </button>
            </div>
            {labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {labels.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1 rounded-jira bg-surface px-2 py-0.5 text-xs text-ink-secondary"
                  >
                    {l}
                    <button
                      type="button"
                      onClick={() => setLabels(labels.filter((x) => x !== l))}
                      aria-label={`Remove ${l}`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          {error && (
            <p className="rounded-jira bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

const Field = ({ label, children }) => (
  <div>
    <p className="label-base">{label}</p>
    {children}
  </div>
);

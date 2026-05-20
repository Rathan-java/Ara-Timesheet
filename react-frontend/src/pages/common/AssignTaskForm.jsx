import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrioritySelector } from '@/components/PriorityIcon.jsx';
import { StatusSelector } from '@/components/StatusChip.jsx';
import { useData } from '@/context/TasksContext.jsx';

export const AssignTaskForm = ({ assignees, assignedById, returnTo }) => {
  const navigate = useNavigate();
  const { workspaces, createTask } = useData();

  const [assigneeId, setAssigneeId] = useState(assignees[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? '');
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
    setError(null);
    if (!assigneeId) {
      setError('Pick an assignee.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        workspaceId,
        assigneeId,
        priority,
        status,
        deadline: new Date(deadline).toISOString(),
        estimatedHours: Number(estimatedHours) || 0,
        labels,
        assignedById,
      });
      navigate(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card-base space-y-4 p-5">
      <Field label="Assign to">
        <select
          className="input-base"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          {assignees.length === 0 && <option value="">No one available</option>}
          {assignees.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — {u.designation}
            </option>
          ))}
        </select>
      </Field>

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
          placeholder="Add context, acceptance criteria…"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Workspace">
          <select
            className="input-base"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.projectCode})
              </option>
            ))}
          </select>
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
            placeholder="Add a label and press +"
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
          {submitting ? 'Assigning…' : 'Assign task'}
        </button>
      </div>
    </form>
  );
};

const Field = ({ label, children }) => (
  <div>
    <p className="label-base">{label}</p>
    {children}
  </div>
);

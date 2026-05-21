import { Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { workspaceIconOptions } from '@/components/iconRegistry.js';
import { useData } from '@/context/TasksContext.jsx';

const COLOR_OPTIONS = [
  '#0052CC',
  '#00875A',
  '#FF991F',
  '#6554C0',
  '#DE350B',
  '#0065FF',
  '#36B37E',
  '#FFAB00',
];

export const CreateWorkspacePage = () => {
  const navigate = useNavigate();
  const { users, createWorkspace } = useData();
  const employees = users.filter((u) => u.role === 'employee');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [iconName, setIconName] = useState(workspaceIconOptions[0].name);
  const [memberIds, setMemberIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleMember = (id) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !projectCode.trim()) {
      setError('Name and project code are required.');
      return;
    }
    if (projectCode.length > 5) {
      setError('Project code should be 2–5 characters (e.g. SCH, CRM).');
      return;
    }
    setSubmitting(true);
    try {
      await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        projectCode: projectCode.trim().toUpperCase(),
        color,
        icon: iconName,
        memberIds,
      });
      navigate('/management/workspaces');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create workspace.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Workspace">
      <div className="mx-auto max-w-3xl p-4 lg:p-6">
        <form onSubmit={onSubmit} className="card-base space-y-4 p-5">
          <Field label="Name">
            <input
              className="input-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Schoolmate"
              required
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              className="input-base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
            />
          </Field>

          <Field label="Project code (used in issue keys, e.g. SCH-101)">
            <input
              className="input-base uppercase"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
              placeholder="SCH"
              maxLength={5}
              required
            />
          </Field>

          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="relative h-8 w-8 rounded-full ring-offset-2 transition"
                  style={{
                    backgroundColor: c,
                    outline:
                      color === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: 2,
                  }}
                  aria-label={c}
                >
                  {color === c && (
                    <Check
                      size={14}
                      color="white"
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  )}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Icon">
            <div className="flex flex-wrap gap-2">
              {workspaceIconOptions.map(({ name: n, icon: Icon }) => {
                const selected = iconName === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setIconName(n)}
                    className="inline-flex items-center justify-center rounded-jira border p-2 transition"
                    style={{
                      borderColor: selected ? color : '#DFE1E6',
                      backgroundColor: selected ? color : '#fff',
                      color: selected ? 'white' : '#333',
                    }}
                    title={n}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label={`Team members (${memberIds.length} selected)`}>
            <div className="max-h-56 overflow-y-auto rounded-jira border border-divider bg-card p-2">
              {employees.length === 0 && (
                <p className="p-2 text-xs text-ink-light">No employees.</p>
              )}
              {employees.map((u) => {
                const selected = memberIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleMember(u.id)}
                      className="accent-primary"
                    />
                    <span className="flex-1">
                      <span className="font-medium text-ink">{u.name}</span>
                      <span className="ml-2 text-xs text-ink-light">
                        {u.designation}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
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
              {submitting ? 'Creating…' : 'Create workspace'}
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

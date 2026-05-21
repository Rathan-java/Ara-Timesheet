import { Camera, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { Avatar } from '@/components/Avatar.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { roleDisplayName } from '@/types';

const ROLES = ['employee', 'teamLead', 'management'];

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const { createUser, teams } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('employee');
  const [teamId, setTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Default to the first team once the teams list loads.
  useEffect(() => {
    if (!teamId && teams.length > 0) setTeamId(teams[0].id);
  }, [teams, teamId]);

  const requiresTeam = role === 'employee' || role === 'teamLead';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !designation.trim()) {
      setError('Name, email and designation are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await createUser({
        name: name.trim(),
        email: email.trim(),
        designation: designation.trim(),
        password,
        role,
        teamId: requiresTeam ? teamId : undefined,
      });
      navigate('/management/employees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Employee">
      <div className="mx-auto max-w-2xl p-4 lg:p-6">
        <form onSubmit={onSubmit} className="card-base space-y-4 p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={name || '?'} size={72} />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full border border-divider bg-card p-1.5 text-ink-secondary hover:bg-surface"
                title="Photo upload (UI placeholder)"
              >
                <Camera size={14} />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Profile photo</p>
              <p className="text-xs text-ink-light">
                Avatar upload is a placeholder for now.
              </p>
            </div>
          </div>

          <Field label="Full name">
            <input
              className="input-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              className="input-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.doe@company.com"
              required
            />
          </Field>

          <Field label="Designation">
            <input
              className="input-base"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Backend Developer"
              required
            />
          </Field>

          <Field label="Initial password">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-base pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-secondary"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-light">
              Share this with the user so they can sign in. They can change it later.
            </p>
          </Field>

          <Field label="Role">
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-jira px-3 py-1.5 text-xs font-semibold transition ${
                    role === r
                      ? 'bg-primary text-white'
                      : 'bg-card border border-divider text-ink-secondary hover:bg-surface'
                  }`}
                >
                  {roleDisplayName(r)}
                </button>
              ))}
            </div>
          </Field>

          {requiresTeam && (
            <Field label="Team">
              {teams.length === 0 ? (
                <p className="text-xs text-ink-light">Loading teams…</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teams.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTeamId(t.id)}
                      className={`rounded-jira px-3 py-1.5 text-xs font-semibold transition ${
                        teamId === t.id
                          ? 'bg-primary text-white'
                          : 'bg-card border border-divider text-ink-secondary hover:bg-surface'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </Field>
          )}

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
              {submitting ? 'Creating…' : 'Create user'}
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

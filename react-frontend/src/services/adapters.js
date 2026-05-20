// Field-by-field mappers between the React frontend shape (camelCase, string
// IDs, enum values like 'teamLead'/'inProgress') and the backend shape
// (snake_case, integer IDs, enum values like 'team_lead'/'in_progress').
//
// All UI code keeps using the frontend shape. Services call these at the
// boundary in/out so the rest of the app never sees snake_case.

const toStrId = (v) => (v === null || v === undefined ? undefined : String(v));

// ---- Role ----
const ROLE_TO_BACKEND = { teamLead: 'team_lead' };
const ROLE_TO_FRONTEND = { team_lead: 'teamLead' };
export const roleToBackend = (r) => ROLE_TO_BACKEND[r] ?? r;
export const roleToFrontend = (r) => ROLE_TO_FRONTEND[r] ?? r;

// ---- Status ----
const STATUS_TO_BACKEND = { inProgress: 'in_progress' };
const STATUS_TO_FRONTEND = { in_progress: 'inProgress' };
export const statusToBackend = (s) => STATUS_TO_BACKEND[s] ?? s;
export const statusToFrontend = (s) => STATUS_TO_FRONTEND[s] ?? s;

// ---- User ----
export const userFromBackend = (u) => {
  if (!u) return u;
  return {
    id: toStrId(u.id),
    name: u.name,
    email: u.email,
    role: roleToFrontend(u.role),
    teamId: toStrId(u.team_id),
    designation: u.designation ?? '',
    avatarUrl: u.avatar_url ?? undefined,
    joinedDate: u.joined_date,
  };
};

export const userCreateToBackend = (p) => ({
  name: p.name,
  email: p.email,
  password: p.password,
  role: roleToBackend(p.role),
  designation: p.designation,
  team_id: p.teamId ? Number(p.teamId) : undefined,
  phone: p.phone,
});

export const userUpdateToBackend = (p) => ({
  name: p.name,
  designation: p.designation,
  team_id: p.teamId ? Number(p.teamId) : undefined,
  phone: p.phone,
});

// ---- Task ----
export const taskFromBackend = (t) => {
  if (!t) return t;
  return {
    id: toStrId(t.id),
    title: t.title,
    description: t.description ?? '',
    status: statusToFrontend(t.status),
    priority: t.priority,
    assigneeId: toStrId(t.assignee_id),
    assigneeName: t.assignee_name ?? '',
    workspaceId: toStrId(t.workspace_id),
    workspaceName: t.workspace_name ?? '',
    createdAt: t.created_at,
    deadline: t.deadline,
    assignedById: toStrId(t.assigned_by_id),
    assignedByName: t.assigned_by_name ?? '',
    estimatedHours: Number(t.estimated_hours) || 0,
    loggedHours: Number(t.logged_hours) || 0,
    projectCode: t.project_code,
    issueNumber: t.issue_number,
    // Backend doesn't model labels on tasks yet; default to empty so UI is happy.
    labels: t.labels ?? [],
  };
};

export const taskCreateToBackend = (p) => ({
  title: p.title,
  description: p.description,
  status: p.status ? statusToBackend(p.status) : undefined,
  priority: p.priority,
  workspace_id: p.workspaceId ? Number(p.workspaceId) : undefined,
  assignee_id: p.assigneeId ? Number(p.assigneeId) : undefined,
  estimated_hours: p.estimatedHours ?? 0,
  deadline: p.deadline,
});

export const taskUpdateToBackend = (patch) => {
  const out = {};
  if (patch.title !== undefined) out.title = patch.title;
  if (patch.description !== undefined) out.description = patch.description;
  if (patch.status !== undefined) out.status = statusToBackend(patch.status);
  if (patch.priority !== undefined) out.priority = patch.priority;
  if (patch.estimatedHours !== undefined) out.estimated_hours = patch.estimatedHours;
  if (patch.deadline !== undefined) out.deadline = patch.deadline;
  return out;
};

// ---- Workspace ----
export const workspaceFromBackend = (w) => {
  if (!w) return w;
  const memberIds = Array.isArray(w.member_ids)
    ? w.member_ids.map(toStrId)
    : Array.isArray(w.members)
      ? w.members.map((m) => toStrId(m.id ?? m))
      : [];
  return {
    id: toStrId(w.id),
    name: w.name,
    description: w.description ?? '',
    color: w.color,
    icon: w.icon,
    totalTasks: Number(w.total_tasks) || 0,
    completedTasks: Number(w.completed_tasks) || 0,
    memberIds,
    projectCode: w.project_code,
    nextIssueNumber: w.next_issue_number,
  };
};

export const workspaceCreateToBackend = (p) => ({
  name: p.name,
  description: p.description,
  project_code: (p.projectCode || '').toUpperCase(),
  color: p.color,
  icon: p.icon,
  member_ids: Array.isArray(p.memberIds)
    ? p.memberIds.map((id) => Number(id))
    : [],
});

// Role-aware URL helpers so deep links land inside the right protected area.
// Each role has its own /<role>/tasks/:id route guarded by ProtectedRoute.

export const taskDetailPath = (role, taskId) => {
  switch (role) {
    case 'teamLead':
      return `/team-lead/tasks/${taskId}`;
    case 'management':
      return `/management/tasks/${taskId}`;
    case 'employee':
    default:
      return `/employee/tasks/${taskId}`;
  }
};

export const workspacesPath = (role) => {
  switch (role) {
    case 'teamLead':
      return '/team-lead/workspaces';
    case 'management':
      return '/management/workspaces';
    case 'employee':
    default:
      return '/employee/workspaces';
  }
};

export const workspaceDetailPath = (role, workspaceId) =>
  `${workspacesPath(role)}/${workspaceId}`;

// Per-employee detail page. Only Mgmt + TL have one — employees viewing each
// other isn't useful and the route doesn't exist for that role.
export const userDetailPath = (role, userId) => {
  switch (role) {
    case 'teamLead':
      return `/team-lead/employees/${userId}`;
    case 'management':
      return `/management/employees/${userId}`;
    default:
      return null;
  }
};

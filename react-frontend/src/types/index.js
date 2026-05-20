// Domain helpers shared across the app. In JS we don't carry types; the values
// below act as the contract for what the data should look like. Keep services
// and components agreeing on these shapes:
//
//   User       { id, name, email, role, teamId?, avatarUrl?, designation, joinedDate }
//   Task       { id, title, description, status, priority, assigneeId, assigneeName,
//                workspaceId, workspaceName, createdAt, deadline,
//                assignedById?, assignedByName?, estimatedHours, loggedHours,
//                projectCode, issueNumber, labels }
//   Workspace  { id, name, description, color, icon, totalTasks, completedTasks,
//                memberIds, projectCode, nextIssueNumber }
//
// role:     'employee' | 'teamLead' | 'management'
// status:   'todo' | 'inProgress' | 'review' | 'done'
// priority: 'low' | 'medium' | 'high' | 'highest'

export const issueKey = (t) => `${t.projectCode}-${t.issueNumber}`;

export const isOverdue = (t) =>
  new Date(t.deadline).getTime() < Date.now() && t.status !== 'done';

export const workspaceCompletion = (w) =>
  w.totalTasks > 0 ? w.completedTasks / w.totalTasks : 0;

export const roleDisplayName = (role) => {
  switch (role) {
    case 'employee':
      return 'Employee';
    case 'teamLead':
      return 'Team Lead';
    case 'management':
      return 'Management';
    default:
      return role ?? '';
  }
};

export const statusDisplayName = (s) => {
  switch (s) {
    case 'todo':
      return 'TO DO';
    case 'inProgress':
      return 'IN PROGRESS';
    case 'review':
      return 'IN REVIEW';
    case 'done':
      return 'DONE';
    default:
      return s ?? '';
  }
};

export const priorityDisplayName = (p) => {
  switch (p) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'highest':
      return 'Highest';
    default:
      return p ?? '';
  }
};

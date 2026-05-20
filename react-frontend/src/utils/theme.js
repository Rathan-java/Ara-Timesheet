// Jira-style design tokens — mirrors lib/utils/app_colors.dart.
// Tailwind also reads these (see tailwind.config.js); use this module when you
// need a hex value in JS (e.g., for inline SVG / chart fills).

export const colors = {
  primary: '#0052CC',
  primaryLight: '#4C9AFF',
  primaryDark: '#0747A6',
  navyDark: '#172B4D',
  navyLight: '#253858',
  secondary: '#00875A',
  secondaryLight: '#36B37E',
  background: '#F4F5F7',
  cardBackground: '#FFFFFF',
  surfaceLight: '#EBECF0',
  kanbanBackground: '#F4F5F7',
  textPrimary: '#000000',
  textSecondary: '#333333',
  textLight: '#666666',
  divider: '#DFE1E6',
  error: '#DE350B',
  success: '#00875A',
  warning: '#FF991F',
  info: '#0065FF',

  todoGray: '#97A0AF',
  progressBlue: '#0065FF',
  progressOrange: '#FF991F',
  doneGreen: '#00875A',
  // Review status — maroon (kept the legacy `reviewPurple` name so existing
  // imports keep working).
  reviewPurple: '#800000',

  priorityHighest: '#CD1316',
  priorityHigh: '#E97F33',
  priorityMedium: '#FFAB00',
  priorityLow: '#0065FF',
  priorityLowest: '#57D9A3',

  workspaceSchoolate: '#0052CC',
  workspaceCRM: '#00875A',
  workspaceHRMS: '#FF991F',
  workspaceInventory: '#6554C0',

  columnTodo: '#97A0AF',
  columnInProgress: '#0052CC',
  columnDone: '#00875A',
  columnReview: '#800000',

  labelBlue: '#4C9AFF',
};

export const statusColor = (s) => {
  switch (s) {
    case 'todo':
      return colors.todoGray;
    case 'inProgress':
      return colors.progressBlue;
    case 'review':
      return colors.reviewPurple;
    case 'done':
      return colors.doneGreen;
    default:
      return colors.todoGray;
  }
};

export const priorityColor = (p) => {
  switch (p) {
    case 'highest':
      return colors.priorityHighest;
    case 'high':
      return colors.priorityHigh;
    case 'medium':
      return colors.priorityMedium;
    case 'low':
      return colors.priorityLow;
    case 'lowest':
      return colors.priorityLowest;
    default:
      return colors.priorityMedium;
  }
};

// A muted palette used to give EmployeeCards (and any "no inherent color" card)
// a stable, deterministic accent so neighbours in a grid look subtly different.
// Pick by id with `pastelForId(id)`.
export const pastelPalette = [
  '#0052CC', // blue
  '#00875A', // green
  '#FF991F', // orange
  '#800000', // maroon
  '#6554C0', // purple
  '#0065FF', // info
  '#36B37E', // soft green
  '#FFAB00', // amber
  '#DE350B', // muted red
  '#4C9AFF', // light blue
];

// Cheap deterministic hash → stable index into pastelPalette.
export const pastelForId = (id) => {
  let h = 0;
  const str = String(id ?? '');
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return pastelPalette[h % pastelPalette.length];
};

// Add transparency to a hex color (#RRGGBB) — returns rgba string.
export const withAlpha = (hex, alpha) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

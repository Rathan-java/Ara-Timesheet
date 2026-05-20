# Ara Timesheet — React Frontend

A web frontend that mirrors the Flutter mobile app (`../lib`) feature-for-feature: role-based dashboards (Employee, Team Lead, Management), Jira-style Kanban with drag-and-drop, task / workspace / employee management, and an API-ready service layer that runs against mock data today and a real backend tomorrow.

## Stack
- React 18 (plain JavaScript / JSX)
- Vite
- React Router v6
- Tailwind CSS (Jira-style design tokens in `tailwind.config.js`)
- lucide-react (icons)
- recharts (charts)
- @dnd-kit (Kanban drag & drop)

## Run

```bash
cd react-frontend
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

## Mock login

The login screen shows a role picker (Employee / Team Lead / Management). Any email / password is accepted — the selected role decides which dashboard you land on.

| Role         | Lands on                  |
| ------------ | ------------------------- |
| Employee     | `/employee/dashboard`     |
| Team Lead    | `/team-lead/dashboard`    |
| Management   | `/management/dashboard`   |

## Switching from mock to a real backend

All HTTP traffic flows through `src/services/apiClient.ts`. Each domain service (`authService`, `taskService`, `userService`, `workspaceService`) has a `useMock` switch driven by `VITE_USE_MOCK`.

To point at a real backend:

1. Copy `.env.example` → `.env` (or edit the existing `.env`).
2. Set:
   ```
   VITE_API_BASE_URL=https://your-api.example.com/api
   VITE_USE_MOCK=false
   ```
3. Restart `npm run dev`.

No UI code needs to change — only the services.

## Project structure

```
src/
  components/      Shared UI (StatCard, TaskCard, KanbanBoard, StatusChip, …)
  context/         AuthContext, TasksContext
  data/            Mock data ported from lib/data/mock_data.dart
  pages/
    auth/          login, register
    employee/      dashboard, task list, task detail, create task
    team-lead/     dashboard, team tasks, assign task
    management/    dashboard, employees, workspaces, assign/create
  services/        apiClient + domain services (mock + real branches)
  types/           Domain models (User, Task, Workspace)
  utils/           Theme tokens, date helpers, role helpers
```

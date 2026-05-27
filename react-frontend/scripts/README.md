# Bulk import: Excel → Ara Timesheet

One-off script to migrate historical data (users, workspaces, tasks) from
Excel/Sheets into the deployed backend.

## When to use this

You have an existing spreadsheet of employees and/or tasks and want them
loaded into the live app without typing each one through the UI. Sweet spot:
20-500 records total.

## Prerequisites

- Node.js 18+ (the script uses native `fetch`)
- Admin credentials for the deployed backend (management role)

## Step 1 — Prepare your CSVs

Three files, in this order:

```
scripts/data/employees.csv
scripts/data/workspaces.csv
scripts/data/tasks.csv
```

Templates with column headers and sample rows are in
`scripts/data/templates/`. Copy each template into `scripts/data/`, open it
in Excel/Sheets, paste your data, save as CSV.

### employees.csv columns

| Column | Required | Notes |
|---|---|---|
| `name` | yes | Display name |
| `email` | yes | Unique. Used as login + as the link key everywhere else |
| `role` | no | `employee` (default), `team_lead`, or `management` |
| `designation` | no | Job title |
| `team` | no | Team **name** (e.g. `Development`). Must exist in the backend already — the script doesn't create teams |
| `password` | no | Initial password. If blank, uses `ARA_DEFAULT_USER_PASSWORD` env var or `changeme123` |
| `phone` | no | |

### workspaces.csv columns

| Column | Required | Notes |
|---|---|---|
| `name` | yes | Workspace display name |
| `project_code` | yes | Short uppercase code (2-5 chars), e.g. `SCH`. Issue keys will look like `SCH-1`. Must be unique |
| `description` | no | |
| `color` | no | Hex like `#0052CC`. Defaults to blue |
| `icon` | no | One of: `folder`, `GraduationCap`, `Users`, `Briefcase`, `Package`, `Code`, `BarChart` |
| `member_emails` | no | Semicolon-separated emails, e.g. `alice@x.com;bob@x.com`. Each email must exist in employees.csv (or already in the DB) |

### tasks.csv columns

| Column | Required | Notes |
|---|---|---|
| `title` | yes | |
| `assignee_email` | yes | Email of an existing user (from employees.csv or the DB) |
| `project_code` | yes | Matches a workspace's `project_code` |
| `description` | no | |
| `status` | no | `todo` (default), `in_progress`, `review`, or `done` |
| `priority` | no | `low`, `medium` (default), `high`, or `highest` |
| `estimated_hours` | no | Integer |
| `deadline` | no | Any date format JavaScript's `Date` can parse — script normalises to `YYYY-MM-DD` |

## Step 2 — Run the import

Set three environment variables and run the script.

**Linux / macOS / Git Bash:**

```bash
cd react-frontend
ARA_API_URL=https://ara-timesheet-fmgddqakc6enhcfj.canadacentral-01.azurewebsites.net/api \
ARA_ADMIN_EMAIL=you@example.com \
ARA_ADMIN_PASSWORD='your-password' \
node scripts/import-data.js
```

**Windows cmd:**

```cmd
cd react-frontend
set ARA_API_URL=https://ara-timesheet-fmgddqakc6enhcfj.canadacentral-01.azurewebsites.net/api
set ARA_ADMIN_EMAIL=you@example.com
set ARA_ADMIN_PASSWORD=your-password
node scripts/import-data.js
```

**Windows PowerShell:**

```powershell
cd react-frontend
$env:ARA_API_URL = "https://ara-timesheet-fmgddqakc6enhcfj.canadacentral-01.azurewebsites.net/api"
$env:ARA_ADMIN_EMAIL = "you@example.com"
$env:ARA_ADMIN_PASSWORD = "your-password"
node scripts/import-data.js
```

You'll see output like:

```
Importing into https://...azurewebsites.net/api

Logged in as you@example.com (management)

=== Users ===
Found 47 row(s) in employees.csv
  + Alice Johnson <alice@example.com> [employee]
  + Bob Smith <bob@example.com> [employee]
  - carol@example.com already exists, skipping
  ...
Users: 45 created, 2 skipped, 0 failed

=== Workspaces ===
Found 6 row(s) in workspaces.csv
  + Schoolmate (SCH) with 4 member(s)
  ...
Workspaces: 6 created, 0 skipped, 0 failed

=== Tasks ===
Found 230 row(s) in tasks.csv
  + "Implement login flow" -> Alice Johnson [done]
  ...
Tasks: 228 created, 2 failed
```

## Idempotency

- **Users**: matched by email. If a user with the same email already exists,
  the row is skipped (existing user is NOT updated).
- **Workspaces**: matched by `project_code`. Existing codes are skipped.
- **Tasks**: NOT deduped. Re-running this script will create duplicate tasks.
  Run on a fresh DB, or delete tasks first via the UI.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Required env vars: ARA_API_URL, ARA_ADMIN_EMAIL, ARA_ADMIN_PASSWORD` | Set all three in the same command as `node scripts/import-data.js` |
| `/auth/login -> 401: Invalid email or password` | Double-check the admin credentials |
| `/users -> 400: Email already exists` | This row was already imported; the script normally catches it but if your CSV has it twice the second attempt fails. Safe to ignore |
| `! "task X": no workspace found for project_code "Y"` | Workspace Y isn't in workspaces.csv or wasn't created. Add it, or fix the task's project_code |
| `! "task X": no user found for assignee_email "y@z"` | Same as above but for users |
| Date format issues | Use ISO `2026-05-15` if in doubt. The parser accepts most formats but Excel "5/15/2026" can be locale-dependent |

## Don't commit your data

The `.gitignore` excludes `scripts/data/*.csv` (so your real data stays
local). Only the templates in `scripts/data/templates/` get tracked.

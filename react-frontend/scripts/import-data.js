#!/usr/bin/env node
// Bulk-import users, workspaces, and tasks into the Ara Timesheet backend
// from three CSV files. Designed for a one-off migration from Excel/Sheets.
//
// USAGE
// -----
//   cd react-frontend
//
//   # 1. Copy each template and fill in your data
//   cp scripts/data/templates/employees.template.csv scripts/data/employees.csv
//   cp scripts/data/templates/workspaces.template.csv scripts/data/workspaces.csv
//   cp scripts/data/templates/tasks.template.csv scripts/data/tasks.csv
//
//   # 2. Open each in Excel/Sheets, paste your data, save as CSV.
//   #    See scripts/README.md for the exact column rules.
//
//   # 3. Run the importer with admin credentials.
//   #    Linux/macOS:
//   ARA_API_URL=https://your-backend.azurewebsites.net/api \
//   ARA_ADMIN_EMAIL=admin@example.com \
//   ARA_ADMIN_PASSWORD='your-password' \
//   node scripts/import-data.js
//
//   #    Windows (cmd):
//   set ARA_API_URL=https://your-backend.azurewebsites.net/api
//   set ARA_ADMIN_EMAIL=admin@example.com
//   set ARA_ADMIN_PASSWORD=your-password
//   node scripts/import-data.js
//
// IDEMPOTENCY
// -----------
//   - Users: matched by email. Existing emails are skipped (not updated).
//   - Workspaces: matched by project_code. Existing codes are skipped.
//   - Tasks: NOT deduped — re-running this script after edits will create
//     duplicate tasks. Run this on a fresh DB, or delete tasks first.

const fs = require('node:fs');
const path = require('node:path');

// ---- Config ----------------------------------------------------------------
const API_URL = process.env.ARA_API_URL;
const ADMIN_EMAIL = process.env.ARA_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ARA_ADMIN_PASSWORD;
const DEFAULT_USER_PASSWORD =
  process.env.ARA_DEFAULT_USER_PASSWORD || 'changeme123';

if (!API_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Required env vars: ARA_API_URL, ARA_ADMIN_EMAIL, ARA_ADMIN_PASSWORD',
  );
  console.error('See the comment block at the top of this file for usage.');
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, 'data');

// ---- Tiny CSV parser (quoted fields with embedded commas supported) --------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (ch === '\r') {
      i += 1;
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c.trim().length))
    .map((r) =>
      Object.fromEntries(
        headers.map((h, j) => [h, (r[j] ?? '').trim()]),
      ),
    );
}

function readCSV(name) {
  const filepath = path.join(DATA_DIR, name);
  if (!fs.existsSync(filepath)) {
    console.log(`  (no file at ${filepath} — skipping)`);
    return [];
  }
  return parseCSV(fs.readFileSync(filepath, 'utf8'));
}

// ---- API client (uses native fetch, requires Node 18+) ---------------------
let TOKEN = null;

async function api(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON */
  }
  if (!res.ok) {
    const msg = body?.message || res.statusText || `HTTP ${res.status}`;
    throw new Error(`${endpoint} -> ${res.status}: ${msg}`);
  }
  if (body && typeof body === 'object' && 'success' in body) return body.data;
  return body;
}

async function login() {
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  TOKEN = res.token;
  console.log(`Logged in as ${res.user.email} (${res.user.role})`);
}

// ---- Helpers ---------------------------------------------------------------
function normaliseRole(raw) {
  const r = (raw || 'employee').toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (r === 'team_lead' || r === 'teamlead' || r === 'lead') return 'team_lead';
  if (r === 'management' || r === 'manager' || r === 'mgmt') return 'management';
  return 'employee';
}

function normaliseStatus(raw) {
  const s = (raw || 'todo').toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (s === 'in_progress' || s === 'inprogress' || s === 'progress')
    return 'in_progress';
  if (s === 'review' || s === 'in_review') return 'review';
  if (s === 'done' || s === 'completed' || s === 'complete') return 'done';
  return 'todo';
}

function normalisePriority(raw) {
  const p = (raw || 'medium').toLowerCase().trim();
  if (['low', 'medium', 'high', 'highest'].includes(p)) return p;
  if (p === 'critical' || p === 'urgent') return 'highest'; // legacy aliases
  return 'medium';
}

function normaliseDate(raw) {
  if (!raw) return undefined;
  // Already YYYY-MM-DD?
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---- Import users ----------------------------------------------------------
async function importUsers() {
  console.log('\n=== Users ===');
  const rows = readCSV('employees.csv');
  if (rows.length === 0) return new Map();
  console.log(`Found ${rows.length} row(s) in employees.csv`);

  const teams = await api('/teams');
  const teamByName = new Map(
    teams.map((t) => [t.name.toLowerCase(), t.id]),
  );

  const existing = await api('/users');
  const byEmail = new Map(existing.map((u) => [u.email.toLowerCase(), u]));

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of rows) {
    const email = r.email?.toLowerCase();
    if (!email) {
      console.warn(`  ! skipping row with no email: ${JSON.stringify(r)}`);
      failed += 1;
      continue;
    }
    if (byEmail.has(email)) {
      console.log(`  - ${email} already exists, skipping`);
      skipped += 1;
      continue;
    }
    const team_id = r.team
      ? teamByName.get(r.team.toLowerCase()) ?? undefined
      : undefined;
    try {
      const userPayload = {
        name: r.name || r.email,
        email: r.email,
        password: r.password || DEFAULT_USER_PASSWORD,
        role: normaliseRole(r.role),
        designation: r.designation || '',
      };
      if (team_id) userPayload.team_id = team_id;
      if (r.phone) userPayload.phone = r.phone;

      const user = await api('/users', {
        method: 'POST',
        body: JSON.stringify(userPayload),
      });
      byEmail.set(email, user);
      created += 1;
      console.log(`  + ${user.name} <${user.email}> [${user.role}]`);
    } catch (e) {
      failed += 1;
      console.warn(`  ! ${r.email}: ${e.message}`);
    }
  }

  console.log(`Users: ${created} created, ${skipped} skipped, ${failed} failed`);
  return byEmail;
}

// ---- Import workspaces -----------------------------------------------------
async function importWorkspaces(usersByEmail) {
  console.log('\n=== Workspaces ===');
  const rows = readCSV('workspaces.csv');
  if (rows.length === 0) return new Map();
  console.log(`Found ${rows.length} row(s) in workspaces.csv`);

  const existing = await api('/workspaces');
  const byCode = new Map(
    existing.map((w) => [w.project_code.toUpperCase(), w]),
  );

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of rows) {
    const code = (r.project_code || '').toUpperCase();
    if (!code) {
      console.warn(`  ! row missing project_code: ${JSON.stringify(r)}`);
      failed += 1;
      continue;
    }
    if (byCode.has(code)) {
      console.log(`  - workspace ${code} already exists, skipping`);
      skipped += 1;
      continue;
    }
    const memberEmails = (r.member_emails || '')
      .split(/[;,]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const member_ids = memberEmails
      .map((email) => usersByEmail.get(email))
      .filter(Boolean)
      .map((u) => u.id);
    const missing = memberEmails.filter((e) => !usersByEmail.has(e));
    if (missing.length) {
      console.warn(
        `    note: ${code} has unresolved members: ${missing.join(', ')}`,
      );
    }
    try {
      const ws = await api('/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: r.name || code,
          description: r.description || '',
          project_code: code,
          color: r.color || '#0052CC',
          icon: r.icon || 'folder',
          member_ids,
        }),
      });
      byCode.set(code, ws);
      created += 1;
      console.log(
        `  + ${ws.name} (${code}) with ${member_ids.length} member(s)`,
      );
    } catch (e) {
      failed += 1;
      console.warn(`  ! ${code}: ${e.message}`);
    }
  }

  console.log(
    `Workspaces: ${created} created, ${skipped} skipped, ${failed} failed`,
  );
  // Refetch so caller sees member_ids on each.
  const refreshed = await api('/workspaces');
  return new Map(refreshed.map((w) => [w.project_code.toUpperCase(), w]));
}

// ---- Import tasks ----------------------------------------------------------
async function importTasks(usersByEmail, workspacesByCode) {
  console.log('\n=== Tasks ===');
  const rows = readCSV('tasks.csv');
  if (rows.length === 0) return;
  console.log(`Found ${rows.length} row(s) in tasks.csv`);

  let created = 0;
  let failed = 0;

  for (const r of rows) {
    const assignee = usersByEmail.get((r.assignee_email || '').toLowerCase());
    const ws = workspacesByCode.get((r.project_code || '').toUpperCase());
    if (!assignee) {
      console.warn(
        `  ! "${r.title}": no user found for assignee_email "${r.assignee_email}"`,
      );
      failed += 1;
      continue;
    }
    if (!ws) {
      console.warn(
        `  ! "${r.title}": no workspace found for project_code "${r.project_code}"`,
      );
      failed += 1;
      continue;
    }
    const status = normaliseStatus(r.status);
    const priority = normalisePriority(r.priority);
    const deadline = normaliseDate(r.deadline);
    const estimated_hours = Number(r.estimated_hours) || 0;

    try {
      const task = await api('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: r.title,
          description: r.description || '',
          priority,
          workspace_id: ws.id,
          assignee_id: assignee.id,
          estimated_hours,
          ...(deadline ? { deadline } : {}),
        }),
      });

      // Backend ignores status on POST — patch if needed.
      if (status !== 'todo' && task.status !== status) {
        try {
          await api(`/tasks/${task.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
          });
        } catch (e) {
          console.warn(`    ${r.title}: status patch failed: ${e.message}`);
        }
      }

      created += 1;
      console.log(`  + "${r.title}" -> ${assignee.name} [${status}]`);
    } catch (e) {
      failed += 1;
      console.warn(`  ! "${r.title}": ${e.message}`);
    }
  }

  console.log(`Tasks: ${created} created, ${failed} failed`);
}

// ---- Main ------------------------------------------------------------------
(async function main() {
  console.log(`Importing into ${API_URL}\n`);
  await login();
  const usersByEmail = await importUsers();
  const workspacesByCode = await importWorkspaces(usersByEmail);
  await importTasks(usersByEmail, workspacesByCode);
  console.log('\nAll done.');
})().catch((err) => {
  console.error('\nImport failed:', err.message);
  process.exit(1);
});

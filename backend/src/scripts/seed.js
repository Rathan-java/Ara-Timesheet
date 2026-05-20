// Idempotent seed script. Wipes timesheet tables and re-inserts a small,
// realistic dataset so the frontend has something meaningful to render.
//
// Usage:  npm run seed
//
// Test logins (all use password "password123"):
//   - mgmt@ara.dev        (management)
//   - lead.dev@ara.dev    (team lead, Development team)
//   - lead.qa@ara.dev     (team lead, QA team)
//   - alice@ara.dev       (employee, Development)
//   - bob@ara.dev         (employee, Development)
//   - carol@ara.dev       (employee, QA)
//   - dan@ara.dev         (employee, QA)

const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const COMMON_PASSWORD = 'password123';

const TEAMS = [
  { name: 'Development', description: 'Software Development Team' },
  { name: 'QA', description: 'Quality Assurance Team' },
  { name: 'Design', description: 'UI/UX Design Team' },
];

const WORKSPACES = [
  {
    name: 'Schoolate',
    description: 'School management system',
    project_code: 'SCH',
    color: '#0052CC',
    icon: 'GraduationCap',
  },
  {
    name: 'CRM',
    description: 'Customer relationship management platform',
    project_code: 'CRM',
    color: '#00875A',
    icon: 'Users',
  },
  {
    name: 'HRMS',
    description: 'Human resources management system',
    project_code: 'HRM',
    color: '#FF8B00',
    icon: 'Briefcase',
  },
  {
    name: 'Inventory',
    description: 'Stock and warehouse tracking',
    project_code: 'INV',
    color: '#6554C0',
    icon: 'Package',
  },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Wiping existing data...');
    await client.query(
      `TRUNCATE TABLE
         time_logs, task_comments, task_labels, labels,
         tasks, workspace_members, workspaces, users, teams
       RESTART IDENTITY CASCADE`,
    );

    console.log('Inserting teams...');
    const teamIds = {};
    for (const t of TEAMS) {
      const { rows } = await client.query(
        'INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING id',
        [t.name, t.description],
      );
      teamIds[t.name] = rows[0].id;
    }

    console.log('Inserting users...');
    const hash = await bcrypt.hash(COMMON_PASSWORD, 10);
    const users = [
      {
        name: 'Maria Chen',
        email: 'mgmt@ara.dev',
        role: 'management',
        designation: 'Head of Engineering',
        team_id: null,
      },
      {
        name: 'Robert Taylor',
        email: 'lead.dev@ara.dev',
        role: 'team_lead',
        designation: 'Dev Team Lead',
        team_id: teamIds.Development,
      },
      {
        name: 'Priya Sharma',
        email: 'lead.qa@ara.dev',
        role: 'team_lead',
        designation: 'QA Team Lead',
        team_id: teamIds.QA,
      },
      {
        name: 'Alice Johnson',
        email: 'alice@ara.dev',
        role: 'employee',
        designation: 'Senior Software Engineer',
        team_id: teamIds.Development,
      },
      {
        name: 'Bob Patel',
        email: 'bob@ara.dev',
        role: 'employee',
        designation: 'Backend Engineer',
        team_id: teamIds.Development,
      },
      {
        name: 'Carol Diaz',
        email: 'carol@ara.dev',
        role: 'employee',
        designation: 'QA Engineer',
        team_id: teamIds.QA,
      },
      {
        name: 'Dan Lee',
        email: 'dan@ara.dev',
        role: 'employee',
        designation: 'QA Engineer',
        team_id: teamIds.QA,
      },
    ];

    const userIds = {};
    for (const u of users) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password, role, designation, team_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [u.name, u.email, hash, u.role, u.designation, u.team_id],
      );
      userIds[u.email] = rows[0].id;
    }

    console.log('Inserting workspaces...');
    const workspaceIds = {};
    for (const w of WORKSPACES) {
      const { rows } = await client.query(
        `INSERT INTO workspaces (name, description, project_code, color, icon, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          w.name,
          w.description,
          w.project_code,
          w.color,
          w.icon,
          userIds['mgmt@ara.dev'],
        ],
      );
      workspaceIds[w.project_code] = rows[0].id;
    }

    console.log('Adding workspace members...');
    const members = [
      ['SCH', 'alice@ara.dev'],
      ['SCH', 'bob@ara.dev'],
      ['SCH', 'carol@ara.dev'],
      ['CRM', 'alice@ara.dev'],
      ['CRM', 'dan@ara.dev'],
      ['HRM', 'bob@ara.dev'],
      ['HRM', 'carol@ara.dev'],
      ['INV', 'dan@ara.dev'],
    ];
    for (const [code, email] of members) {
      await client.query(
        `INSERT INTO workspace_members (workspace_id, user_id)
         VALUES ($1, $2)`,
        [workspaceIds[code], userIds[email]],
      );
    }

    console.log('Inserting tasks...');
    // [project_code, title, description, status, priority, assignee_email, est_hours, logged_hours, days_until_deadline]
    const tasks = [
      ['SCH', 'Implement student login flow', 'JWT-based auth with refresh tokens.', 'done', 'high', 'alice@ara.dev', 16, 14, -2],
      ['SCH', 'Design report card PDF template', 'Match the existing print layout pixel-for-pixel.', 'in_progress', 'medium', 'bob@ara.dev', 12, 6, 5],
      ['SCH', 'Bug: timetable overlaps on Mondays', 'Two periods rendering in the same slot for grade 8.', 'review', 'highest', 'alice@ara.dev', 4, 3, 1],
      ['SCH', 'Add bulk import for student roster', 'CSV upload with validation and dry-run preview.', 'todo', 'medium', 'bob@ara.dev', 20, 0, 14],
      ['SCH', 'QA pass on attendance module', 'Full regression including edge cases for half-days.', 'in_progress', 'medium', 'carol@ara.dev', 8, 4, 3],

      ['CRM', 'Lead scoring algorithm v2', 'Replace naive bayes with gradient boosting.', 'in_progress', 'high', 'alice@ara.dev', 24, 10, 10],
      ['CRM', 'Email campaign analytics dashboard', 'Open rate, CTR, conversion funnel.', 'todo', 'medium', 'dan@ara.dev', 16, 0, 21],
      ['CRM', 'Fix duplicate contact merge', 'Soft-delete strategy with audit log.', 'done', 'high', 'dan@ara.dev', 6, 7, -5],

      ['HRM', 'Leave approval workflow', 'Multi-level approval with delegation.', 'in_progress', 'high', 'bob@ara.dev', 18, 8, 7],
      ['HRM', 'Payroll export to bank format', 'Generate NEFT-compatible CSV.', 'todo', 'medium', 'carol@ara.dev', 10, 0, 30],

      ['INV', 'Barcode scanner integration', 'USB + camera-based scanning.', 'review', 'medium', 'dan@ara.dev', 14, 12, 2],
      ['INV', 'Low-stock alert emails', 'Threshold per SKU, daily digest.', 'todo', 'low', 'dan@ara.dev', 6, 0, 14],
    ];

    for (const [code, title, desc, status, priority, email, est, logged, deadlineDays] of tasks) {
      const wsId = workspaceIds[code];
      const assigneeId = userIds[email];
      const assignedById = userIds['mgmt@ara.dev'];

      const wsRow = await client.query(
        'SELECT next_issue_number FROM workspaces WHERE id = $1',
        [wsId],
      );
      const issueNumber = wsRow.rows[0].next_issue_number;

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + deadlineDays);

      const completedAt = status === 'done' ? new Date() : null;

      await client.query(
        `INSERT INTO tasks (
           title, description, status, priority, workspace_id, project_code,
           issue_number, assignee_id, assigned_by_id, estimated_hours, logged_hours,
           deadline, completed_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          title, desc, status, priority, wsId, code,
          issueNumber, assigneeId, assignedById, est, logged,
          deadline.toISOString().slice(0, 10), completedAt,
        ],
      );

      await client.query(
        'UPDATE workspaces SET next_issue_number = next_issue_number + 1 WHERE id = $1',
        [wsId],
      );
    }

    await client.query('COMMIT');
    console.log('\nSeed complete.');
    console.log(`\nLogin with any of the seeded emails using password: ${COMMON_PASSWORD}`);
    console.log('  - mgmt@ara.dev        (management)');
    console.log('  - lead.dev@ara.dev    (team lead)');
    console.log('  - lead.qa@ara.dev     (team lead)');
    console.log('  - alice@ara.dev       (employee)');
    console.log('  - bob@ara.dev         (employee)');
    console.log('  - carol@ara.dev       (employee)');
    console.log('  - dan@ara.dev         (employee)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();

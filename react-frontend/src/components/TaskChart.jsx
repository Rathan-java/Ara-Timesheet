import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { colors } from '@/utils/theme';

const COUNTS_ORDER = [
  { status: 'todo', label: 'To Do', color: colors.todoGray },
  { status: 'inProgress', label: 'In Progress', color: colors.progressBlue },
  { status: 'review', label: 'In Review', color: colors.reviewPurple },
  { status: 'done', label: 'Done', color: colors.doneGreen },
];

export const TaskStatusPieChart = ({ tasks }) => {
  const data = COUNTS_ORDER.map((s) => ({
    name: s.label,
    value: tasks.filter((t) => t.status === s.status).length,
    color: s.color,
  })).filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-light">
        No tasks
      </div>
    );
  }

  return (
    <div className="flex h-full items-center gap-4">
      <div className="flex-1" style={{ minHeight: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              labelLine={false}
              label={({ value }) => value}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-ink-secondary">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            {d.name} ({d.value})
          </li>
        ))}
      </ul>
    </div>
  );
};

export const WeeklyBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: colors.textSecondary }} />
        <YAxis tick={{ fontSize: 10, fill: colors.textLight }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="completed"
          name="Completed"
          fill={colors.doneGreen}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="assigned"
          name="Assigned"
          fill={colors.primaryLight}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const MonthlyLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: colors.textSecondary }} />
        <YAxis tick={{ fontSize: 10, fill: colors.textLight }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke={colors.doneGreen}
          strokeWidth={3}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Total"
          stroke={colors.primary}
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

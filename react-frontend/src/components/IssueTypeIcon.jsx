import { Bolt, Bug, BookOpen, CheckSquare, CornerDownRight } from 'lucide-react';
import { colors } from '@/utils/theme';

const iconFor = (t) => {
  switch (t) {
    case 'bug':
      return Bug;
    case 'story':
      return BookOpen;
    case 'epic':
      return Bolt;
    case 'subtask':
      return CornerDownRight;
    default:
      return CheckSquare;
  }
};

const colorFor = (t) => {
  switch (t) {
    case 'bug':
      return '#DE350B';
    case 'story':
      return '#36B37E';
    case 'epic':
      return '#6554C0';
    default:
      return colors.primaryLight;
  }
};

export const IssueTypeIcon = ({ type = 'task', size = 14 }) => {
  const Icon = iconFor(type);
  const color = colorFor(type);
  const box = size + 4;
  return (
    <span
      className="inline-flex items-center justify-center rounded-[2px]"
      style={{ width: box, height: box, backgroundColor: color }}
    >
      <Icon size={size - 2} color="white" strokeWidth={2.5} />
    </span>
  );
};

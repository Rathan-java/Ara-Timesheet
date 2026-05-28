// Jira-style Kanban with four columns: To Do · In Progress · In Review · Done.
// Drag/drop is powered by @dnd-kit. We track active drag locally so the
// DragOverlay renders a clone that follows the cursor.

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { colors, withAlpha } from '@/utils/theme';
import { KanbanTaskCard } from './KanbanTaskCard.jsx';

const COLUMNS = [
  { status: 'todo', label: 'TO DO', color: colors.columnTodo },
  { status: 'inProgress', label: 'IN PROGRESS', color: colors.columnInProgress },
  { status: 'review', label: 'IN REVIEW', color: colors.columnReview },
  { status: 'done', label: 'DONE', color: colors.columnDone },
];

// Sentence-case labels for the small header summary chips above the board.
const HEADER_CHIPS = [
  { status: 'todo', label: 'To Do', color: colors.columnTodo },
  { status: 'inProgress', label: 'In Progress', color: colors.columnInProgress },
  { status: 'review', label: 'In Review', color: colors.columnReview },
  { status: 'done', label: 'Done', color: colors.columnDone },
];

const DraggableCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      // Stop drag from firing onClick — only click when not dragging.
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className="touch-none"
    >
      <KanbanTaskCard task={task} isDragging={isDragging} />
    </div>
  );
};

const Column = ({ status, label, color, tasks, onTaskClick, onAdd }) => {
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <div
      className="flex h-full w-72 flex-shrink-0 flex-col rounded-jira-lg bg-surface/70"
      ref={setNodeRef}
    >
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-jira-lg bg-surface px-3 py-2.5">
        <span
          className="inline-block h-3.5 w-1 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
          {label}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: withAlpha(color, 0.15), color }}
        >
          {tasks.length}
        </span>
        {status === 'todo' && onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="ml-auto rounded-jira bg-card p-1 text-ink-secondary hover:text-primary"
            aria-label="Add task"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Drop area — independent vertical scroll per column so a long Done
          column doesn't clip its tail. min-h-0 lets flex-1 shrink to the
          parent so overflow-y-auto can engage. */}
      <div
        className={`min-h-0 flex-1 space-y-2 overflow-y-auto rounded-b-jira-lg p-2 transition ${
          isOver ? 'ring-2 ring-primary/40' : ''
        }`}
        style={
          isOver ? { backgroundColor: withAlpha(colors.primary, 0.05) } : undefined
        }
      >
        {tasks.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-jira border border-dashed border-divider text-xs text-ink-light/70">
            No tasks
          </div>
        ) : (
          tasks.map((t) => (
            <DraggableCard key={t.id} task={t} onClick={() => onTaskClick(t)} />
          ))
        )}
      </div>
    </div>
  );
};

export const KanbanBoard = ({ tasks, onTaskClick, onStatusChange, onAdd }) => {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const byStatus = useMemo(() => {
    const map = { todo: [], inProgress: [], review: [], done: [] };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  const activeTask = useMemo(
    () => (activeId ? tasks.find((t) => t.id === activeId) ?? null : null),
    [activeId, tasks],
  );

  const handleDragStart = (e) => setActiveId(String(e.active.id));

  const handleDragEnd = (e) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = over.id;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;
    void onStatusChange(task.id, newStatus);
  };

  const total = tasks.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 px-4 pt-2 lg:px-6">
        <span className="text-sm font-semibold text-ink">{total} tasks</span>
        {HEADER_CHIPS.map(({ status, label, color }) => (
          <span
            key={status}
            className="inline-flex items-center gap-1.5 rounded-jira px-2 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: withAlpha(color, 0.12),
              color,
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {byStatus[status].length} {label}
          </span>
        ))}
      </div>

      <div className="kanban-scroll mt-3 flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4 lg:px-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex h-full min-w-max gap-3">
            {COLUMNS.map((col) => (
              <Column
                key={col.status}
                status={col.status}
                label={col.label}
                color={col.color}
                tasks={byStatus[col.status]}
                onTaskClick={onTaskClick}
                onAdd={col.status === 'todo' ? onAdd : undefined}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="w-64">
                <KanbanTaskCard task={activeTask} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export const MiniKanbanBoard = ({ tasks, onTaskClick }) => {
  const byStatus = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === 'todo'),
      inProgress: tasks.filter((t) => t.status === 'inProgress'),
      review: tasks.filter((t) => t.status === 'review'),
    }),
    [tasks],
  );

  const mini = (label, list, color) => (
    <div className="w-60 flex-shrink-0 rounded-jira-lg bg-surface p-2.5">
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-block h-3 w-1 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary">
          {label}
        </span>
        <span
          className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: withAlpha(color, 0.15), color }}
        >
          {list.length}
        </span>
      </div>
      {list.length === 0 ? (
        <p className="px-1 text-[11px] text-ink-light/70">No tasks</p>
      ) : (
        <div className="space-y-1.5">
          {list.slice(0, 3).map((t) => (
            <button
              key={t.id}
              onClick={() => onTaskClick(t)}
              className="w-full rounded-jira border border-divider bg-card p-2 text-left hover:shadow-card-hover"
            >
              <div className="line-clamp-1 text-[11px] font-medium text-ink">
                {t.title}
              </div>
              <div className="mt-1.5 flex items-center text-[9px]">
                <span style={{ color: colors.primary }} className="font-medium">
                  {t.projectCode}-{t.issueNumber}
                </span>
              </div>
            </button>
          ))}
          {list.length > 3 && (
            <p className="text-[10px] font-medium text-ink-light">
              +{list.length - 3} more
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="kanban-scroll flex gap-3 overflow-x-auto pb-1">
      {mini('TO DO', byStatus.todo, colors.columnTodo)}
      {mini('IN PROGRESS', byStatus.inProgress, colors.columnInProgress)}
      {mini('IN REVIEW', byStatus.review, colors.columnReview)}
    </div>
  );
};

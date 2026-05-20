import 'package:flutter/material.dart';
import '../../models/task_model.dart';
import '../../utils/app_colors.dart';
import '../task_card.dart';

/// Kanban column header with status info
class KanbanColumnHeader extends StatelessWidget {
  final TaskStatus status;
  final int count;
  final VoidCallback? onAddTap;

  const KanbanColumnHeader({
    super.key,
    required this.status,
    required this.count,
    this.onAddTap,
  });

  Color get statusColor {
    switch (status) {
      case TaskStatus.todo:
        return AppColors.columnTodo;
      case TaskStatus.inProgress:
        return AppColors.columnInProgress;
      case TaskStatus.done:
        return AppColors.columnDone;
      case TaskStatus.review:
        return AppColors.columnReview;
    }
  }

  String get statusLabel {
    switch (status) {
      case TaskStatus.todo:
        return 'TO DO';
      case TaskStatus.inProgress:
        return 'IN PROGRESS';
      case TaskStatus.done:
        return 'DONE';
      case TaskStatus.review:
        return 'IN REVIEW';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 16,
            decoration: BoxDecoration(
              color: statusColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            statusLabel,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '$count',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: statusColor,
              ),
            ),
          ),
          const Spacer(),
          if (onAddTap != null)
            GestureDetector(
              onTap: onAddTap,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Icon(
                  Icons.add,
                  size: 16,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Single Kanban column with cards
class KanbanColumn extends StatelessWidget {
  final TaskStatus status;
  final List<Task> tasks;
  final Function(Task) onTaskTap;
  final Function(Task, TaskStatus) onTaskDrop;
  final VoidCallback? onAddTap;
  final VoidCallback? onDragStarted;
  final VoidCallback? onDragEnded;
  final double width;

  const KanbanColumn({
    super.key,
    required this.status,
    required this.tasks,
    required this.onTaskTap,
    required this.onTaskDrop,
    this.onAddTap,
    this.onDragStarted,
    this.onDragEnded,
    this.width = 280,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: AppColors.kanbanBackground,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          // Header
          KanbanColumnHeader(
            status: status,
            count: tasks.length,
            onAddTap: onAddTap,
          ),

          // Cards list
          Expanded(
            child: DragTarget<Task>(
              onWillAcceptWithDetails: (details) =>
                  details.data.status != status,
              onAcceptWithDetails: (details) =>
                  onTaskDrop(details.data, status),
              builder: (context, candidateData, rejectedData) {
                final isHovering = candidateData.isNotEmpty;

                return Container(
                  decoration: BoxDecoration(
                    color: isHovering
                        ? AppColors.primary.withOpacity(0.05)
                        : Colors.transparent,
                    borderRadius: const BorderRadius.vertical(
                      bottom: Radius.circular(8),
                    ),
                    border: isHovering
                        ? Border.all(
                            color: AppColors.primary.withOpacity(0.3),
                            width: 2,
                          )
                        : null,
                  ),
                  child: tasks.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.all(8),
                          itemCount: tasks.length,
                          itemBuilder: (context, index) {
                            return DraggableTaskCard(
                              task: tasks[index],
                              onTap: () => onTaskTap(tasks[index]),
                              onDragStarted: onDragStarted,
                              onDragEnded: onDragEnded,
                            );
                          },
                        ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inbox_outlined,
              size: 40,
              color: AppColors.textLight.withOpacity(0.5),
            ),
            const SizedBox(height: 8),
            Text(
              'No tasks',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textLight.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Draggable wrapper for Kanban task cards
class DraggableTaskCard extends StatefulWidget {
  final Task task;
  final VoidCallback onTap;
  final VoidCallback? onDragStarted;
  final VoidCallback? onDragEnded;

  const DraggableTaskCard({
    super.key,
    required this.task,
    required this.onTap,
    this.onDragStarted,
    this.onDragEnded,
  });

  @override
  State<DraggableTaskCard> createState() => _DraggableTaskCardState();
}

class _DraggableTaskCardState extends State<DraggableTaskCard> {
  bool _isDragging = false;

  @override
  Widget build(BuildContext context) {
    return LongPressDraggable<Task>(
      data: widget.task,
      delay: const Duration(milliseconds: 150),
      onDragStarted: () {
        setState(() => _isDragging = true);
        widget.onDragStarted?.call();
      },
      onDragEnd: (details) {
        setState(() => _isDragging = false);
        widget.onDragEnded?.call();
      },
      onDraggableCanceled: (velocity, offset) {
        setState(() => _isDragging = false);
        widget.onDragEnded?.call();
      },
      feedback: Material(
        elevation: 8,
        borderRadius: BorderRadius.circular(4),
        child: SizedBox(
          width: 260,
          child: KanbanTaskCard(task: widget.task, isDragging: true),
        ),
      ),
      childWhenDragging: Opacity(
        opacity: 0.4,
        child: KanbanTaskCard(task: widget.task),
      ),
      child: KanbanTaskCard(
        task: widget.task,
        onTap: widget.onTap,
        isDragging: _isDragging,
      ),
    );
  }
}

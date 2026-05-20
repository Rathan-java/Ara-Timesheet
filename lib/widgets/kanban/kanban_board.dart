import 'package:flutter/material.dart';
import '../../models/task_model.dart';
import '../../data/mock_data.dart';
import '../../utils/app_colors.dart';
import 'kanban_column.dart';

/// Main Kanban Board widget with horizontal scrolling columns
class KanbanBoard extends StatefulWidget {
  final List<Task> tasks;
  final Function(Task) onTaskTap;
  final Function(Task, TaskStatus) onTaskStatusChanged;
  final VoidCallback? onAddTaskTap;
  final String? filterByAssignee;
  final String? filterByWorkspace;

  const KanbanBoard({
    super.key,
    required this.tasks,
    required this.onTaskTap,
    required this.onTaskStatusChanged,
    this.onAddTaskTap,
    this.filterByAssignee,
    this.filterByWorkspace,
  });

  @override
  State<KanbanBoard> createState() => _KanbanBoardState();
}

class _KanbanBoardState extends State<KanbanBoard> {
  final ScrollController _scrollController = ScrollController();
  bool _isDragging = false;
  double _dragPositionX = 0;
  static const double _scrollEdgeWidth =
      60; // Width of edge zone for auto-scroll
  static const double _scrollSpeed = 8; // Pixels to scroll per frame

  List<Task> get filteredTasks {
    var tasks = widget.tasks;

    if (widget.filterByAssignee != null) {
      tasks = tasks
          .where((t) => t.assigneeId == widget.filterByAssignee)
          .toList();
    }

    if (widget.filterByWorkspace != null) {
      tasks = tasks
          .where((t) => t.workspaceId == widget.filterByWorkspace)
          .toList();
    }

    return tasks;
  }

  Map<TaskStatus, List<Task>> get tasksByStatus {
    final map = <TaskStatus, List<Task>>{
      TaskStatus.todo: [],
      TaskStatus.inProgress: [],
      TaskStatus.review: [],
      TaskStatus.done: [],
    };

    for (final task in filteredTasks) {
      map[task.status]!.add(task);
    }

    return map;
  }

  void _handleTaskDrop(Task task, TaskStatus newStatus) {
    _isDragging = false;
    widget.onTaskStatusChanged(task, newStatus);
  }

  void _onDragStarted() {
    _isDragging = true;
    _startAutoScroll();
  }

  void _onDragEnded() {
    _isDragging = false;
  }

  void _onDragUpdate(double globalX) {
    _dragPositionX = globalX;
  }

  void _startAutoScroll() {
    Future.doWhile(() async {
      if (!_isDragging) return false;

      await Future.delayed(const Duration(milliseconds: 16)); // ~60fps

      if (!mounted || !_isDragging) return false;

      final screenWidth = MediaQuery.of(context).size.width;

      // Scroll right when near right edge
      if (_dragPositionX > screenWidth - _scrollEdgeWidth) {
        final scrollAmount =
            _scrollSpeed *
            ((_dragPositionX - (screenWidth - _scrollEdgeWidth)) /
                _scrollEdgeWidth);
        _scrollController.jumpTo(
          (_scrollController.offset + scrollAmount).clamp(
            0.0,
            _scrollController.position.maxScrollExtent,
          ),
        );
      }
      // Scroll left when near left edge
      else if (_dragPositionX < _scrollEdgeWidth) {
        final scrollAmount =
            _scrollSpeed *
            ((_scrollEdgeWidth - _dragPositionX) / _scrollEdgeWidth);
        _scrollController.jumpTo(
          (_scrollController.offset - scrollAmount).clamp(
            0.0,
            _scrollController.position.maxScrollExtent,
          ),
        );
      }

      return _isDragging;
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final columns = tasksByStatus;

    return Column(
      children: [
        // Board header with stats
        _buildBoardHeader(),
        const SizedBox(height: 12),

        // Kanban columns with auto-scroll listener
        Expanded(
          child: Listener(
            onPointerMove: (event) {
              if (_isDragging) {
                _onDragUpdate(event.position.dx);
              }
            },
            child: Scrollbar(
              controller: _scrollController,
              thumbVisibility: true,
              child: SingleChildScrollView(
                controller: _scrollController,
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    KanbanColumn(
                      status: TaskStatus.todo,
                      tasks: columns[TaskStatus.todo]!,
                      onTaskTap: widget.onTaskTap,
                      onTaskDrop: _handleTaskDrop,
                      onAddTap: widget.onAddTaskTap,
                      onDragStarted: _onDragStarted,
                      onDragEnded: _onDragEnded,
                    ),
                    KanbanColumn(
                      status: TaskStatus.inProgress,
                      tasks: columns[TaskStatus.inProgress]!,
                      onTaskTap: widget.onTaskTap,
                      onTaskDrop: _handleTaskDrop,
                      onDragStarted: _onDragStarted,
                      onDragEnded: _onDragEnded,
                    ),
                    KanbanColumn(
                      status: TaskStatus.review,
                      tasks: columns[TaskStatus.review]!,
                      onTaskTap: widget.onTaskTap,
                      onTaskDrop: _handleTaskDrop,
                      onDragStarted: _onDragStarted,
                      onDragEnded: _onDragEnded,
                    ),
                    KanbanColumn(
                      status: TaskStatus.done,
                      tasks: columns[TaskStatus.done]!,
                      onTaskTap: widget.onTaskTap,
                      onTaskDrop: _handleTaskDrop,
                      onDragStarted: _onDragStarted,
                      onDragEnded: _onDragEnded,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBoardHeader() {
    final total = filteredTasks.length;
    final done = tasksByStatus[TaskStatus.done]!.length;
    final inProgress = tasksByStatus[TaskStatus.inProgress]!.length;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Text(
            '$total tasks',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 16),
          _buildStatChip('In Progress', inProgress, AppColors.progressBlue),
          const SizedBox(width: 8),
          _buildStatChip('Done', done, AppColors.doneGreen),
          const Spacer(),
          // Quick filters could go here
        ],
      ),
    );
  }

  Widget _buildStatChip(String label, int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            '$count $label',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

/// Compact Kanban board for dashboard views
class MiniKanbanBoard extends StatelessWidget {
  final List<Task> tasks;
  final Function(Task) onTaskTap;

  const MiniKanbanBoard({
    super.key,
    required this.tasks,
    required this.onTaskTap,
  });

  @override
  Widget build(BuildContext context) {
    final todoTasks = tasks.where((t) => t.status == TaskStatus.todo).toList();
    final inProgressTasks = tasks
        .where((t) => t.status == TaskStatus.inProgress)
        .toList();
    final reviewTasks = tasks
        .where((t) => t.status == TaskStatus.review)
        .toList();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildMiniColumn('TO DO', todoTasks, AppColors.columnTodo),
          const SizedBox(width: 12),
          _buildMiniColumn(
            'IN PROGRESS',
            inProgressTasks,
            AppColors.columnInProgress,
          ),
          const SizedBox(width: 12),
          _buildMiniColumn('IN REVIEW', reviewTasks, AppColors.columnReview),
        ],
      ),
    );
  }

  Widget _buildMiniColumn(String title, List<Task> tasks, Color color) {
    return Container(
      width: 200,
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              children: [
                Container(
                  width: 3,
                  height: 14,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 5,
                    vertical: 1,
                  ),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${tasks.length}',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: color,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (tasks.isEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(
                'No tasks',
                style: TextStyle(
                  fontSize: 11,
                  color: AppColors.textLight.withOpacity(0.7),
                ),
              ),
            )
          else
            ...tasks.take(3).map((task) => _buildMiniCard(task)),
          if (tasks.length > 3)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                '+${tasks.length - 3} more',
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMiniCard(Task task) {
    return GestureDetector(
      onTap: () => onTaskTap(task),
      child: Container(
        margin: const EdgeInsets.fromLTRB(8, 0, 8, 8),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              task.title,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Text(
                  task.issueKey,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primary,
                  ),
                ),
                const Spacer(),
                CircleAvatar(
                  radius: 8,
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: Text(
                    task.assigneeName.substring(0, 1),
                    style: const TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

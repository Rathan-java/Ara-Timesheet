import 'package:flutter/material.dart';
import '../models/task_model.dart';
import '../utils/app_colors.dart';
import 'status_chip.dart';
import 'priority_icon.dart';

/// Jira-style task card for list views
class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback? onTap;
  final bool showAssignee;
  final bool showWorkspace;

  const TaskCard({
    super.key,
    required this.task,
    this.onTap,
    this.showAssignee = true,
    this.showWorkspace = true,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: AppColors.divider),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Issue Key and Priority Row
            Row(
              children: [
                IssueTypeIcon(type: 'task', size: 14),
                const SizedBox(width: 8),
                Text(
                  task.issueKey,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
                const Spacer(),
                PriorityIcon(priority: task.priority, size: 18),
              ],
            ),
            const SizedBox(height: 8),

            // Title
            Text(
              task.title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),

            // Status and Workspace Row
            Row(
              children: [
                StatusChip(status: task.status, isSmall: true),
                const SizedBox(width: 8),
                if (showWorkspace) _buildWorkspaceTag(),
                const Spacer(),
              ],
            ),
            const SizedBox(height: 12),

            // Assignee and Deadline Row
            Row(
              children: [
                if (showAssignee) ...[
                  _buildAssigneeAvatar(),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      task.assigneeName,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
                _buildDeadlineChip(),
              ],
            ),

            // Labels
            if (task.labels.isNotEmpty) ...[
              const SizedBox(height: 10),
              Wrap(
                spacing: 4,
                runSpacing: 4,
                children: task.labels.take(3).map((label) => _buildLabel(label)).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildWorkspaceTag() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(
        task.workspaceName,
        style: const TextStyle(
          fontSize: 11,
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildAssigneeAvatar() {
    return CircleAvatar(
      radius: 12,
      backgroundColor: AppColors.primary.withOpacity(0.15),
      child: Text(
        task.assigneeName.substring(0, 1).toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: AppColors.primary,
        ),
      ),
    );
  }

  Widget _buildDeadlineChip() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.schedule,
          size: 12,
          color: task.isOverdue ? AppColors.error : AppColors.textLight,
        ),
        const SizedBox(width: 4),
        Text(
          _formatDate(task.deadline),
          style: TextStyle(
            fontSize: 11,
            color: task.isOverdue ? AppColors.error : AppColors.textLight,
            fontWeight: task.isOverdue ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildLabel(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.labelBlue.withOpacity(0.15),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now).inDays;

    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Tomorrow';
    } else if (difference == -1) {
      return 'Yesterday';
    } else if (difference < 0) {
      return '${-difference}d ago';
    } else {
      return '${date.day}/${date.month}';
    }
  }
}

/// Compact Jira-style card for Kanban boards
class KanbanTaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback? onTap;
  final bool isDragging;

  const KanbanTaskCard({
    super.key,
    required this.task,
    this.onTap,
    this.isDragging = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDragging
              ? AppColors.primary.withOpacity(0.05)
              : AppColors.cardBackground,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: isDragging ? AppColors.primary : AppColors.divider,
            width: isDragging ? 2 : 1,
          ),
          boxShadow: isDragging
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title (2 lines max)
            Text(
              task.title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 10),

            // Issue Key + Priority Row
            Row(
              children: [
                IssueTypeIcon(type: 'task', size: 12),
                const SizedBox(width: 4),
                Text(
                  task.issueKey,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primary,
                  ),
                ),
                const Spacer(),
                PriorityIcon(priority: task.priority, size: 14),
              ],
            ),
            const SizedBox(height: 10),

            // Bottom Row: Workspace, Assignee, Deadline
            Row(
              children: [
                // Workspace tag
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: Text(
                    task.workspaceName,
                    style: const TextStyle(
                      fontSize: 9,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const Spacer(),
                // Deadline
                Icon(
                  Icons.schedule,
                  size: 11,
                  color: task.isOverdue ? AppColors.error : AppColors.textLight,
                ),
                const SizedBox(width: 2),
                Text(
                  '${task.deadline.day}/${task.deadline.month}',
                  style: TextStyle(
                    fontSize: 10,
                    color: task.isOverdue ? AppColors.error : AppColors.textLight,
                  ),
                ),
                const SizedBox(width: 8),
                // Assignee avatar
                CircleAvatar(
                  radius: 10,
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: Text(
                    task.assigneeName.substring(0, 1),
                    style: const TextStyle(
                      fontSize: 9,
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

/// Large task card for detail views
class TaskDetailCard extends StatelessWidget {
  final Task task;

  const TaskDetailCard({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Issue Key + Priority
          Row(
            children: [
              IssueTypeIcon(type: 'task', size: 18),
              const SizedBox(width: 8),
              Text(
                task.issueKey,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
              const Spacer(),
              PriorityIcon(priority: task.priority, size: 20, showLabel: true),
            ],
          ),
          const SizedBox(height: 16),

          // Title
          Text(
            task.title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),

          // Status
          Row(
            children: [
              StatusChip(status: task.status),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.folder_outlined, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      task.workspaceName,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Labels
          if (task.labels.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: task.labels.map((label) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.labelBlue.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    label,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

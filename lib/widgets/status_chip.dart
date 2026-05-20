import 'package:flutter/material.dart';
import '../models/task_model.dart';
import '../utils/app_colors.dart';

/// Jira-style status lozenge (uppercase, compact, subtle backgrounds)
class StatusChip extends StatelessWidget {
  final TaskStatus status;
  final bool isSmall;

  const StatusChip({
    super.key,
    required this.status,
    this.isSmall = false,
  });

  Color get backgroundColor {
    switch (status) {
      case TaskStatus.todo:
        return AppColors.todoGray.withOpacity(0.15);
      case TaskStatus.inProgress:
        return AppColors.progressBlue.withOpacity(0.15);
      case TaskStatus.done:
        return AppColors.doneGreen.withOpacity(0.15);
      case TaskStatus.review:
        return AppColors.reviewPurple.withOpacity(0.15);
    }
  }

  Color get textColor {
    switch (status) {
      case TaskStatus.todo:
        return AppColors.todoGray;
      case TaskStatus.inProgress:
        return AppColors.progressBlue;
      case TaskStatus.done:
        return AppColors.doneGreen;
      case TaskStatus.review:
        return AppColors.reviewPurple;
    }
  }

  String get label {
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
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 6 : 8,
        vertical: isSmall ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: isSmall ? 10 : 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

/// Compact status indicator for Kanban cards
class StatusDot extends StatelessWidget {
  final TaskStatus status;
  final double size;

  const StatusDot({
    super.key,
    required this.status,
    this.size = 8,
  });

  Color get color {
    switch (status) {
      case TaskStatus.todo:
        return AppColors.todoGray;
      case TaskStatus.inProgress:
        return AppColors.progressBlue;
      case TaskStatus.done:
        return AppColors.doneGreen;
      case TaskStatus.review:
        return AppColors.reviewPurple;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}

/// Status selector for task forms
class StatusSelector extends StatelessWidget {
  final TaskStatus selectedStatus;
  final ValueChanged<TaskStatus> onChanged;

  const StatusSelector({
    super.key,
    required this.selectedStatus,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: TaskStatus.values.map((status) {
        final isSelected = selectedStatus == status;
        final color = _getStatusColor(status);

        return GestureDetector(
          onTap: () => onChanged(status),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? color : color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(
                color: color,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Text(
              _getStatusLabel(status),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : color,
                letterSpacing: 0.5,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Color _getStatusColor(TaskStatus status) {
    switch (status) {
      case TaskStatus.todo:
        return AppColors.todoGray;
      case TaskStatus.inProgress:
        return AppColors.progressBlue;
      case TaskStatus.done:
        return AppColors.doneGreen;
      case TaskStatus.review:
        return AppColors.reviewPurple;
    }
  }

  String _getStatusLabel(TaskStatus status) {
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
}

/// Issue type icon (like Jira's story, bug, task icons)
class IssueTypeIcon extends StatelessWidget {
  final String type;
  final double size;

  const IssueTypeIcon({
    super.key,
    this.type = 'task',
    this.size = 16,
  });

  IconData get icon {
    switch (type.toLowerCase()) {
      case 'bug':
        return Icons.bug_report;
      case 'story':
        return Icons.auto_stories;
      case 'epic':
        return Icons.bolt;
      case 'subtask':
        return Icons.subdirectory_arrow_right;
      default:
        return Icons.check_box_outlined;
    }
  }

  Color get color {
    switch (type.toLowerCase()) {
      case 'bug':
        return AppColors.issueBug;
      case 'story':
        return AppColors.issueStory;
      case 'epic':
        return AppColors.issueEpic;
      default:
        return AppColors.issueTask;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size + 4,
      height: size + 4,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(2),
      ),
      child: Icon(
        icon,
        color: Colors.white,
        size: size - 2,
      ),
    );
  }
}

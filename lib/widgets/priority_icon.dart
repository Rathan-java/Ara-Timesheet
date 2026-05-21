import 'package:flutter/material.dart';
import '../models/task_model.dart';
import '../utils/app_colors.dart';

/// Jira-style priority icons with colored arrows
class PriorityIcon extends StatelessWidget {
  final TaskPriority priority;
  final double size;
  final bool showLabel;

  const PriorityIcon({
    super.key,
    required this.priority,
    this.size = 16,
    this.showLabel = false,
  });

  Color get color {
    switch (priority) {
      case TaskPriority.highest:
        return AppColors.priorityHighest;
      case TaskPriority.high:
        return AppColors.priorityHigh;
      case TaskPriority.medium:
        return AppColors.priorityMedium;
      case TaskPriority.low:
        return AppColors.priorityLow;
      case TaskPriority.lowest:
        return AppColors.priorityLowest;
    }
  }

  IconData get icon {
    switch (priority) {
      case TaskPriority.highest:
        return Icons.keyboard_double_arrow_up;
      case TaskPriority.high:
        return Icons.keyboard_arrow_up;
      case TaskPriority.medium:
        return Icons.remove;
      case TaskPriority.low:
        return Icons.keyboard_arrow_down;
      case TaskPriority.lowest:
        return Icons.keyboard_double_arrow_down;
    }
  }

  String get label {
    switch (priority) {
      case TaskPriority.highest:
        return 'Highest';
      case TaskPriority.high:
        return 'High';
      case TaskPriority.medium:
        return 'Medium';
      case TaskPriority.low:
        return 'Low';
      case TaskPriority.lowest:
        return 'Lowest';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (showLabel) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: size),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: size * 0.75,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      );
    }

    return Tooltip(
      message: label,
      child: Icon(icon, color: color, size: size),
    );
  }
}

/// Priority selector for forms - Jira style
class PrioritySelector extends StatelessWidget {
  final TaskPriority selectedPriority;
  final ValueChanged<TaskPriority> onChanged;

  const PrioritySelector({
    super.key,
    required this.selectedPriority,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: TaskPriority.values.map((priority) {
        final isSelected = selectedPriority == priority;
        final color = _getPriorityColor(priority);

        return GestureDetector(
          onTap: () => onChanged(priority),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? color.withOpacity(0.15) : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(
                color: isSelected ? color : AppColors.divider,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getPriorityIcon(priority),
                  color: color,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text(
                  _getPriorityLabel(priority),
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    color: isSelected ? color : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Color _getPriorityColor(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.highest:
        return AppColors.priorityHighest;
      case TaskPriority.high:
        return AppColors.priorityHigh;
      case TaskPriority.medium:
        return AppColors.priorityMedium;
      case TaskPriority.low:
        return AppColors.priorityLow;
      case TaskPriority.lowest:
        return AppColors.priorityLowest;
    }
  }

  IconData _getPriorityIcon(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.highest:
        return Icons.keyboard_double_arrow_up;
      case TaskPriority.high:
        return Icons.keyboard_arrow_up;
      case TaskPriority.medium:
        return Icons.remove;
      case TaskPriority.low:
        return Icons.keyboard_arrow_down;
      case TaskPriority.lowest:
        return Icons.keyboard_double_arrow_down;
    }
  }

  String _getPriorityLabel(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.highest:
        return 'Highest';
      case TaskPriority.high:
        return 'High';
      case TaskPriority.medium:
        return 'Medium';
      case TaskPriority.low:
        return 'Low';
      case TaskPriority.lowest:
        return 'Lowest';
    }
  }
}

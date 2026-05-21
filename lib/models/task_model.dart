enum TaskStatus { todo, inProgress, done, review }

enum TaskPriority { lowest, low, medium, high, highest }

class Task {
  final String id;
  final String title;
  final String description;
  final TaskStatus status;
  final TaskPriority priority;
  final String assigneeId;
  final String assigneeName;
  final String workspaceId;
  final String workspaceName;
  final DateTime createdAt;
  final DateTime deadline;
  final String? assignedById;
  final String? assignedByName;
  final int estimatedHours;
  final int loggedHours;

  // Jira-style issue key fields
  final String projectCode; // "SCH", "CRM", "HRMS", "INV"
  final int issueNumber; // 101, 45, etc.
  final List<String> labels; // Tags like "frontend", "backend", "bug"

  // Auto-generated issue key
  String get issueKey => '$projectCode-$issueNumber';

  Task({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.priority,
    required this.assigneeId,
    required this.assigneeName,
    required this.workspaceId,
    required this.workspaceName,
    required this.createdAt,
    required this.deadline,
    this.assignedById,
    this.assignedByName,
    required this.estimatedHours,
    required this.loggedHours,
    required this.projectCode,
    required this.issueNumber,
    this.labels = const [],
  });

  String get statusDisplayName {
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

  String get priorityDisplayName {
    switch (priority) {
      case TaskPriority.lowest:
        return 'Lowest';
      case TaskPriority.low:
        return 'Low';
      case TaskPriority.medium:
        return 'Medium';
      case TaskPriority.high:
        return 'High';
      case TaskPriority.highest:
        return 'Highest';
    }
  }

  bool get isOverdue =>
      DateTime.now().isAfter(deadline) && status != TaskStatus.done;

  Task copyWith({
    String? id,
    String? title,
    String? description,
    TaskStatus? status,
    TaskPriority? priority,
    String? assigneeId,
    String? assigneeName,
    String? workspaceId,
    String? workspaceName,
    DateTime? createdAt,
    DateTime? deadline,
    String? assignedById,
    String? assignedByName,
    int? estimatedHours,
    int? loggedHours,
    String? projectCode,
    int? issueNumber,
    List<String>? labels,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      assigneeId: assigneeId ?? this.assigneeId,
      assigneeName: assigneeName ?? this.assigneeName,
      workspaceId: workspaceId ?? this.workspaceId,
      workspaceName: workspaceName ?? this.workspaceName,
      createdAt: createdAt ?? this.createdAt,
      deadline: deadline ?? this.deadline,
      assignedById: assignedById ?? this.assignedById,
      assignedByName: assignedByName ?? this.assignedByName,
      estimatedHours: estimatedHours ?? this.estimatedHours,
      loggedHours: loggedHours ?? this.loggedHours,
      projectCode: projectCode ?? this.projectCode,
      issueNumber: issueNumber ?? this.issueNumber,
      labels: labels ?? this.labels,
    );
  }
}

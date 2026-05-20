// Field-by-field mappers between Flutter model classes (camelCase, Color/IconData,
// string IDs, enums like TaskStatus.inProgress) and the backend's JSON shape
// (snake_case, hex strings, integer IDs, enums like 'in_progress').

import 'package:flutter/material.dart';

import '../models/task_model.dart';
import '../models/user_model.dart';
import '../models/workspace_model.dart';

// ---- Role -------------------------------------------------------------------
UserRole _roleFromString(String? s) {
  switch (s) {
    case 'team_lead':
    case 'teamLead':
      return UserRole.teamLead;
    case 'management':
      return UserRole.management;
    default:
      return UserRole.employee;
  }
}

String roleToBackend(UserRole r) {
  switch (r) {
    case UserRole.teamLead:
      return 'team_lead';
    case UserRole.management:
      return 'management';
    case UserRole.employee:
      return 'employee';
  }
}

// ---- Status -----------------------------------------------------------------
TaskStatus _statusFromString(String? s) {
  switch (s) {
    case 'in_progress':
    case 'inProgress':
      return TaskStatus.inProgress;
    case 'review':
      return TaskStatus.review;
    case 'done':
      return TaskStatus.done;
    default:
      return TaskStatus.todo;
  }
}

String statusToBackend(TaskStatus s) {
  switch (s) {
    case TaskStatus.todo:
      return 'todo';
    case TaskStatus.inProgress:
      return 'in_progress';
    case TaskStatus.review:
      return 'review';
    case TaskStatus.done:
      return 'done';
  }
}

// ---- Priority ---------------------------------------------------------------
TaskPriority _priorityFromString(String? s) {
  switch (s) {
    case 'highest':
      return TaskPriority.highest;
    case 'high':
      return TaskPriority.high;
    case 'low':
      return TaskPriority.low;
    default:
      return TaskPriority.medium;
  }
}

String priorityToBackend(TaskPriority p) {
  switch (p) {
    case TaskPriority.highest:
      return 'highest';
    case TaskPriority.high:
      return 'high';
    case TaskPriority.medium:
      return 'medium';
    case TaskPriority.low:
      return 'low';
  }
}

// ---- Helpers ----------------------------------------------------------------
String _toStrId(dynamic v) => v == null ? '' : v.toString();

int? _tryParseInt(dynamic v) {
  if (v == null) return null;
  if (v is int) return v;
  return int.tryParse(v.toString());
}

DateTime _toDate(dynamic v) {
  if (v == null) return DateTime.now();
  if (v is DateTime) return v;
  return DateTime.tryParse(v.toString()) ?? DateTime.now();
}

Color _colorFromHex(String? hex) {
  if (hex == null || hex.isEmpty) return const Color(0xFF0052CC);
  final cleaned = hex.replaceFirst('#', '');
  final v = int.tryParse(cleaned, radix: 16);
  if (v == null) return const Color(0xFF0052CC);
  // Backend stores RRGGBB; default alpha to 0xFF.
  return Color(0xFF000000 | v);
}

IconData _iconFromName(String? name) {
  switch (name) {
    case 'GraduationCap':
    case 'school':
      return Icons.school;
    case 'Users':
    case 'people':
      return Icons.people;
    case 'Briefcase':
    case 'business':
      return Icons.business;
    case 'Package':
    case 'inventory_2':
      return Icons.inventory_2;
    case 'Code':
      return Icons.code;
    case 'BarChart':
      return Icons.bar_chart;
    default:
      return Icons.folder;
  }
}

// ---- User -------------------------------------------------------------------
User userFromBackend(Map<String, dynamic> j) {
  return User(
    id: _toStrId(j['id']),
    name: (j['name'] ?? '') as String,
    email: (j['email'] ?? '') as String,
    role: _roleFromString(j['role'] as String?),
    teamId: j['team_id'] == null ? null : _toStrId(j['team_id']),
    avatarUrl: j['avatar_url'] as String?,
    designation: (j['designation'] ?? '') as String,
    joinedDate: _toDate(j['joined_date']),
  );
}

Map<String, dynamic> userCreateToBackend({
  required String name,
  required String email,
  required String password,
  required UserRole role,
  String? designation,
  String? teamId,
  String? phone,
}) =>
    {
      'name': name,
      'email': email,
      'password': password,
      'role': roleToBackend(role),
      if (designation != null) 'designation': designation,
      if (teamId != null) 'team_id': _tryParseInt(teamId),
      if (phone != null) 'phone': phone,
    };

// ---- Task -------------------------------------------------------------------
Task taskFromBackend(Map<String, dynamic> j) {
  return Task(
    id: _toStrId(j['id']),
    title: (j['title'] ?? '') as String,
    description: (j['description'] ?? '') as String,
    status: _statusFromString(j['status'] as String?),
    priority: _priorityFromString(j['priority'] as String?),
    assigneeId: _toStrId(j['assignee_id']),
    assigneeName: (j['assignee_name'] ?? '') as String,
    workspaceId: _toStrId(j['workspace_id']),
    workspaceName: (j['workspace_name'] ?? '') as String,
    createdAt: _toDate(j['created_at']),
    deadline: _toDate(j['deadline']),
    assignedById: j['assigned_by_id'] == null
        ? null
        : _toStrId(j['assigned_by_id']),
    assignedByName: j['assigned_by_name'] as String?,
    estimatedHours: _tryParseInt(j['estimated_hours']) ?? 0,
    loggedHours: _tryParseInt(j['logged_hours']) ?? 0,
    projectCode: (j['project_code'] ?? '') as String,
    issueNumber: _tryParseInt(j['issue_number']) ?? 0,
    labels: const [],
  );
}

Map<String, dynamic> taskCreateToBackend({
  required String title,
  String? description,
  TaskStatus? status,
  required TaskPriority priority,
  required String workspaceId,
  required String assigneeId,
  int? estimatedHours,
  DateTime? deadline,
}) =>
    {
      'title': title,
      if (description != null) 'description': description,
      if (status != null) 'status': statusToBackend(status),
      'priority': priorityToBackend(priority),
      'workspace_id': _tryParseInt(workspaceId),
      'assignee_id': _tryParseInt(assigneeId),
      if (estimatedHours != null) 'estimated_hours': estimatedHours,
      if (deadline != null)
        'deadline': deadline.toIso8601String().substring(0, 10),
    };

Map<String, dynamic> taskUpdateToBackend({
  String? title,
  String? description,
  TaskStatus? status,
  TaskPriority? priority,
  int? estimatedHours,
  DateTime? deadline,
}) {
  final out = <String, dynamic>{};
  if (title != null) out['title'] = title;
  if (description != null) out['description'] = description;
  if (status != null) out['status'] = statusToBackend(status);
  if (priority != null) out['priority'] = priorityToBackend(priority);
  if (estimatedHours != null) out['estimated_hours'] = estimatedHours;
  if (deadline != null) {
    out['deadline'] = deadline.toIso8601String().substring(0, 10);
  }
  return out;
}

// ---- Workspace --------------------------------------------------------------
Workspace workspaceFromBackend(Map<String, dynamic> j) {
  List<String> memberIds = const [];
  if (j['member_ids'] is List) {
    memberIds = (j['member_ids'] as List).map(_toStrId).toList();
  } else if (j['members'] is List) {
    memberIds = (j['members'] as List)
        .map((m) => _toStrId(m is Map ? m['id'] : m))
        .toList();
  }
  return Workspace(
    id: _toStrId(j['id']),
    name: (j['name'] ?? '') as String,
    description: (j['description'] ?? '') as String,
    color: _colorFromHex(j['color'] as String?),
    icon: _iconFromName(j['icon'] as String?),
    totalTasks: _tryParseInt(j['total_tasks']) ?? 0,
    completedTasks: _tryParseInt(j['completed_tasks']) ?? 0,
    memberIds: memberIds,
    projectCode: (j['project_code'] ?? '') as String,
    nextIssueNumber: _tryParseInt(j['next_issue_number']) ?? 1,
  );
}

Map<String, dynamic> workspaceCreateToBackend({
  required String name,
  String? description,
  required String projectCode,
  String? colorHex,
  String? icon,
  List<String> memberIds = const [],
}) =>
    {
      'name': name,
      if (description != null) 'description': description,
      'project_code': projectCode.toUpperCase(),
      if (colorHex != null) 'color': colorHex,
      if (icon != null) 'icon': icon,
      'member_ids': memberIds.map((id) => _tryParseInt(id)).whereType<int>().toList(),
    };

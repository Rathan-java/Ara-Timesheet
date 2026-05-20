import 'package:flutter/material.dart';

class Workspace {
  final String id;
  final String name;
  final String description;
  final Color color;
  final IconData icon;
  final int totalTasks;
  final int completedTasks;
  final List<String> memberIds;

  // Jira-style project code
  final String projectCode;  // "SCH", "CRM", "HRMS", "INV"
  int nextIssueNumber;       // Auto-increment for next issue

  Workspace({
    required this.id,
    required this.name,
    required this.description,
    required this.color,
    required this.icon,
    required this.totalTasks,
    required this.completedTasks,
    required this.memberIds,
    required this.projectCode,
    this.nextIssueNumber = 1,
  });

  double get completionRate => totalTasks > 0 ? completedTasks / totalTasks : 0;

  // Generate next issue key and increment counter
  String getNextIssueKey() {
    final key = '$projectCode-$nextIssueNumber';
    nextIssueNumber++;
    return key;
  }

  Workspace copyWith({
    String? id,
    String? name,
    String? description,
    Color? color,
    IconData? icon,
    int? totalTasks,
    int? completedTasks,
    List<String>? memberIds,
    String? projectCode,
    int? nextIssueNumber,
  }) {
    return Workspace(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      color: color ?? this.color,
      icon: icon ?? this.icon,
      totalTasks: totalTasks ?? this.totalTasks,
      completedTasks: completedTasks ?? this.completedTasks,
      memberIds: memberIds ?? this.memberIds,
      projectCode: projectCode ?? this.projectCode,
      nextIssueNumber: nextIssueNumber ?? this.nextIssueNumber,
    );
  }
}

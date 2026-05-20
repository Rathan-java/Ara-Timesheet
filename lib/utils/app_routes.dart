class AppRoutes {
  // Auth routes
  static const String login = '/login';
  static const String register = '/register';

  // Employee routes
  static const String employeeDashboard = '/employee/dashboard';
  static const String taskList = '/employee/tasks';
  static const String taskDetail = '/employee/task-detail';
  static const String createTask = '/employee/create-task';
  static const String profile = '/employee/profile';

  // Team Lead routes
  static const String tlDashboard = '/team-lead/dashboard';
  static const String teamTasks = '/team-lead/team-tasks';
  static const String assignTask = '/team-lead/assign-task';
  static const String reviewTasks = '/team-lead/review-tasks';

  // Management routes
  static const String managementDashboard = '/management/dashboard';
  static const String allEmployees = '/management/employees';
  static const String createEmployee = '/management/create-employee';
  static const String workspaces = '/management/workspaces';
  static const String createWorkspace = '/management/create-workspace';
  static const String managementAssignTask = '/management/assign-task';
  static const String reports = '/management/reports';
}

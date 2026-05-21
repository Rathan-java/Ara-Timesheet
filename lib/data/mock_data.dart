import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/task_model.dart';
import '../models/workspace_model.dart';
import '../utils/app_colors.dart';

class MockData {
  // Current logged in user (can be changed for testing different roles)
  static User currentUser = employees[0];

  // Workspaces with Jira-style project codes
  static List<Workspace> workspaces = [
    Workspace(
      id: 'ws1',
      name: 'Schoolate',
      description: 'School management system',
      color: AppColors.workspaceSchoolate,
      icon: Icons.school,
      totalTasks: 45,
      completedTasks: 32,
      memberIds: ['emp1', 'emp2', 'emp3', 'emp4'],
      projectCode: 'SCH',
      nextIssueNumber: 105,
    ),
    Workspace(
      id: 'ws2',
      name: 'CRM',
      description: 'Customer relationship management',
      color: AppColors.workspaceCRM,
      icon: Icons.people,
      totalTasks: 38,
      completedTasks: 25,
      memberIds: ['emp2', 'emp5', 'emp6'],
      projectCode: 'CRM',
      nextIssueNumber: 78,
    ),
    Workspace(
      id: 'ws3',
      name: 'HRMS',
      description: 'Human resource management system',
      color: AppColors.workspaceHRMS,
      icon: Icons.business,
      totalTasks: 28,
      completedTasks: 20,
      memberIds: ['emp1', 'emp4', 'emp7'],
      projectCode: 'HRM',
      nextIssueNumber: 56,
    ),
    Workspace(
      id: 'ws4',
      name: 'Inventory',
      description: 'Inventory management system',
      color: AppColors.workspaceInventory,
      icon: Icons.inventory_2,
      totalTasks: 22,
      completedTasks: 18,
      memberIds: ['emp3', 'emp5', 'emp8'],
      projectCode: 'INV',
      nextIssueNumber: 34,
    ),
  ];

  // Employees
  static List<User> employees = [
    User(
      id: 'emp1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: UserRole.employee,
      teamId: 'team1',
      designation: 'Software Developer',
      joinedDate: DateTime(2023, 3, 15),
    ),
    User(
      id: 'emp2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: UserRole.employee,
      teamId: 'team1',
      designation: 'UI/UX Designer',
      joinedDate: DateTime(2023, 5, 20),
    ),
    User(
      id: 'emp3',
      name: 'Mike Johnson',
      email: 'mike.j@company.com',
      role: UserRole.employee,
      teamId: 'team1',
      designation: 'Backend Developer',
      joinedDate: DateTime(2022, 11, 10),
    ),
    User(
      id: 'emp4',
      name: 'Sarah Wilson',
      email: 'sarah.w@company.com',
      role: UserRole.employee,
      teamId: 'team2',
      designation: 'QA Engineer',
      joinedDate: DateTime(2023, 7, 8),
    ),
    User(
      id: 'emp5',
      name: 'David Brown',
      email: 'david.b@company.com',
      role: UserRole.employee,
      teamId: 'team2',
      designation: 'Frontend Developer',
      joinedDate: DateTime(2023, 1, 25),
    ),
    User(
      id: 'emp6',
      name: 'Emily Davis',
      email: 'emily.d@company.com',
      role: UserRole.employee,
      teamId: 'team1',
      designation: 'DevOps Engineer',
      joinedDate: DateTime(2022, 9, 5),
    ),
    User(
      id: 'emp7',
      name: 'Chris Lee',
      email: 'chris.l@company.com',
      role: UserRole.employee,
      teamId: 'team2',
      designation: 'Mobile Developer',
      joinedDate: DateTime(2023, 4, 12),
    ),
    User(
      id: 'emp8',
      name: 'Anna Martinez',
      email: 'anna.m@company.com',
      role: UserRole.employee,
      teamId: 'team2',
      designation: 'Data Analyst',
      joinedDate: DateTime(2023, 6, 30),
    ),
  ];

  // Team Leads
  static List<User> teamLeads = [
    User(
      id: 'tl1',
      name: 'Robert Taylor',
      email: 'robert.t@company.com',
      role: UserRole.teamLead,
      teamId: 'team1',
      designation: 'Team Lead - Development',
      joinedDate: DateTime(2021, 6, 1),
    ),
    User(
      id: 'tl2',
      name: 'Lisa Anderson',
      email: 'lisa.a@company.com',
      role: UserRole.teamLead,
      teamId: 'team2',
      designation: 'Team Lead - QA',
      joinedDate: DateTime(2021, 8, 15),
    ),
  ];

  // Management
  static List<User> management = [
    User(
      id: 'mgmt1',
      name: 'James Wilson',
      email: 'james.w@company.com',
      role: UserRole.management,
      designation: 'Project Manager',
      joinedDate: DateTime(2020, 1, 10),
    ),
    User(
      id: 'mgmt2',
      name: 'Patricia Moore',
      email: 'patricia.m@company.com',
      role: UserRole.management,
      designation: 'CTO',
      joinedDate: DateTime(2019, 6, 20),
    ),
  ];

  // All users
  static List<User> get allUsers => [...employees, ...teamLeads, ...management];

  // Tasks with Jira-style issue keys
  static List<Task> tasks = [
    Task(
      id: 't1',
      title: 'Implement user authentication',
      description:
          'Add login and registration functionality with JWT tokens and session management.',
      status: TaskStatus.done,
      priority: TaskPriority.high,
      assigneeId: 'emp1',
      assigneeName: 'John Doe',
      workspaceId: 'ws1',
      workspaceName: 'Schoolate',
      createdAt: DateTime.now().subtract(const Duration(days: 10)),
      deadline: DateTime.now().subtract(const Duration(days: 2)),
      assignedById: 'tl1',
      assignedByName: 'Robert Taylor',
      estimatedHours: 16,
      loggedHours: 14,
      projectCode: 'SCH',
      issueNumber: 101,
      labels: ['backend', 'security'],
    ),
    Task(
      id: 't2',
      title: 'Design dashboard UI',
      description:
          'Create wireframes and mockups for the main dashboard screen with statistics cards.',
      status: TaskStatus.inProgress,
      priority: TaskPriority.medium,
      assigneeId: 'emp2',
      assigneeName: 'Jane Smith',
      workspaceId: 'ws1',
      workspaceName: 'Schoolate',
      createdAt: DateTime.now().subtract(const Duration(days: 5)),
      deadline: DateTime.now().add(const Duration(days: 3)),
      assignedById: 'tl1',
      assignedByName: 'Robert Taylor',
      estimatedHours: 12,
      loggedHours: 6,
      projectCode: 'SCH',
      issueNumber: 102,
      labels: ['design', 'frontend'],
    ),
    Task(
      id: 't3',
      title: 'Setup CI/CD pipeline',
      description:
          'Configure GitHub Actions for automated testing and deployment to staging server.',
      status: TaskStatus.review,
      priority: TaskPriority.high,
      assigneeId: 'emp6',
      assigneeName: 'Emily Davis',
      workspaceId: 'ws1',
      workspaceName: 'Schoolate',
      createdAt: DateTime.now().subtract(const Duration(days: 7)),
      deadline: DateTime.now().add(const Duration(days: 1)),
      assignedById: 'tl1',
      assignedByName: 'Robert Taylor',
      estimatedHours: 8,
      loggedHours: 9,
      projectCode: 'SCH',
      issueNumber: 103,
      labels: ['devops', 'infrastructure'],
    ),
    Task(
      id: 't4',
      title: 'Create API documentation',
      description:
          'Document all REST endpoints using Swagger/OpenAPI specification.',
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      assigneeId: 'emp3',
      assigneeName: 'Mike Johnson',
      workspaceId: 'ws2',
      workspaceName: 'CRM',
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
      deadline: DateTime.now().add(const Duration(days: 7)),
      assignedById: 'mgmt1',
      assignedByName: 'James Wilson',
      estimatedHours: 6,
      loggedHours: 0,
      projectCode: 'CRM',
      issueNumber: 45,
      labels: ['documentation'],
    ),
    Task(
      id: 't5',
      title: 'Fix payment gateway bug',
      description:
          'Resolve the issue with failed transactions not being properly logged.',
      status: TaskStatus.inProgress,
      priority: TaskPriority.highest,
      assigneeId: 'emp1',
      assigneeName: 'John Doe',
      workspaceId: 'ws2',
      workspaceName: 'CRM',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      deadline: DateTime.now().add(const Duration(days: 1)),
      assignedById: 'tl1',
      assignedByName: 'Robert Taylor',
      estimatedHours: 4,
      loggedHours: 2,
      projectCode: 'CRM',
      issueNumber: 72,
      labels: ['bug', 'critical', 'payments'],
    ),
    Task(
      id: 't6',
      title: 'Implement employee onboarding flow',
      description:
          'Create multi-step form for new employee registration with document upload.',
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      assigneeId: 'emp5',
      assigneeName: 'David Brown',
      workspaceId: 'ws3',
      workspaceName: 'HRMS',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      deadline: DateTime.now().add(const Duration(days: 10)),
      assignedById: 'tl2',
      assignedByName: 'Lisa Anderson',
      estimatedHours: 20,
      loggedHours: 0,
      projectCode: 'HRM',
      issueNumber: 51,
      labels: ['feature', 'frontend'],
    ),
    Task(
      id: 't7',
      title: 'Write unit tests for inventory module',
      description:
          'Achieve 80% code coverage for the inventory management module.',
      status: TaskStatus.inProgress,
      priority: TaskPriority.medium,
      assigneeId: 'emp4',
      assigneeName: 'Sarah Wilson',
      workspaceId: 'ws4',
      workspaceName: 'Inventory',
      createdAt: DateTime.now().subtract(const Duration(days: 4)),
      deadline: DateTime.now().add(const Duration(days: 5)),
      assignedById: 'tl2',
      assignedByName: 'Lisa Anderson',
      estimatedHours: 12,
      loggedHours: 5,
      projectCode: 'INV',
      issueNumber: 28,
      labels: ['testing', 'quality'],
    ),
    Task(
      id: 't8',
      title: 'Optimize database queries',
      description:
          'Identify and fix slow database queries in the reporting module.',
      status: TaskStatus.review,
      priority: TaskPriority.high,
      assigneeId: 'emp3',
      assigneeName: 'Mike Johnson',
      workspaceId: 'ws1',
      workspaceName: 'Schoolate',
      createdAt: DateTime.now().subtract(const Duration(days: 6)),
      deadline: DateTime.now().add(const Duration(days: 2)),
      assignedById: 'mgmt1',
      assignedByName: 'James Wilson',
      estimatedHours: 10,
      loggedHours: 8,
      projectCode: 'SCH',
      issueNumber: 98,
      labels: ['performance', 'backend'],
    ),
    Task(
      id: 't9',
      title: 'Mobile app push notifications',
      description: 'Integrate Firebase Cloud Messaging for push notifications.',
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      assigneeId: 'emp7',
      assigneeName: 'Chris Lee',
      workspaceId: 'ws2',
      workspaceName: 'CRM',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      deadline: DateTime.now().add(const Duration(days: 8)),
      assignedById: 'tl1',
      assignedByName: 'Robert Taylor',
      estimatedHours: 8,
      loggedHours: 0,
      projectCode: 'CRM',
      issueNumber: 73,
      labels: ['mobile', 'feature'],
    ),
    Task(
      id: 't10',
      title: 'Create data visualization dashboard',
      description: 'Build interactive charts and graphs for sales analytics.',
      status: TaskStatus.done,
      priority: TaskPriority.high,
      assigneeId: 'emp8',
      assigneeName: 'Anna Martinez',
      workspaceId: 'ws2',
      workspaceName: 'CRM',
      createdAt: DateTime.now().subtract(const Duration(days: 14)),
      deadline: DateTime.now().subtract(const Duration(days: 5)),
      assignedById: 'mgmt2',
      assignedByName: 'Patricia Moore',
      estimatedHours: 24,
      loggedHours: 22,
      projectCode: 'CRM',
      issueNumber: 68,
      labels: ['analytics', 'frontend'],
    ),
    Task(
      id: 't11',
      title: 'Implement leave management',
      description:
          'Build leave request and approval workflow with calendar integration.',
      status: TaskStatus.inProgress,
      priority: TaskPriority.medium,
      assigneeId: 'emp5',
      assigneeName: 'David Brown',
      workspaceId: 'ws3',
      workspaceName: 'HRMS',
      createdAt: DateTime.now().subtract(const Duration(days: 8)),
      deadline: DateTime.now().add(const Duration(days: 4)),
      assignedById: 'tl2',
      assignedByName: 'Lisa Anderson',
      estimatedHours: 16,
      loggedHours: 10,
      projectCode: 'HRM',
      issueNumber: 48,
      labels: ['feature', 'workflow'],
    ),
    Task(
      id: 't12',
      title: 'Stock alert system',
      description: 'Create automated alerts for low stock items.',
      status: TaskStatus.done,
      priority: TaskPriority.high,
      assigneeId: 'emp3',
      assigneeName: 'Mike Johnson',
      workspaceId: 'ws4',
      workspaceName: 'Inventory',
      createdAt: DateTime.now().subtract(const Duration(days: 12)),
      deadline: DateTime.now().subtract(const Duration(days: 3)),
      assignedById: 'mgmt1',
      assignedByName: 'James Wilson',
      estimatedHours: 10,
      loggedHours: 11,
      projectCode: 'INV',
      issueNumber: 25,
      labels: ['feature', 'automation'],
    ),
  ];

  // Helper methods
  static List<Task> getTasksByUser(String userId) {
    return tasks.where((task) => task.assigneeId == userId).toList();
  }

  static List<Task> getTasksByWorkspace(String workspaceId) {
    return tasks.where((task) => task.workspaceId == workspaceId).toList();
  }

  static List<Task> getTasksByStatus(TaskStatus status) {
    return tasks.where((task) => task.status == status).toList();
  }

  static List<Task> getTasksByTeam(String teamId) {
    final teamMemberIds = employees
        .where((emp) => emp.teamId == teamId)
        .map((emp) => emp.id)
        .toList();
    return tasks
        .where((task) => teamMemberIds.contains(task.assigneeId))
        .toList();
  }

  static Map<TaskStatus, int> getTaskCountsByStatus() {
    return {
      TaskStatus.todo: tasks.where((t) => t.status == TaskStatus.todo).length,
      TaskStatus.inProgress: tasks
          .where((t) => t.status == TaskStatus.inProgress)
          .length,
      TaskStatus.done: tasks.where((t) => t.status == TaskStatus.done).length,
      TaskStatus.review: tasks
          .where((t) => t.status == TaskStatus.review)
          .length,
    };
  }

  static List<User> getTeamMembers(String teamId) {
    return employees.where((emp) => emp.teamId == teamId).toList();
  }

  // Get workspace by project code
  static Workspace? getWorkspaceByCode(String projectCode) {
    try {
      return workspaces.firstWhere((ws) => ws.projectCode == projectCode);
    } catch (e) {
      return null;
    }
  }

  // Get next issue number for a workspace
  static int getNextIssueNumber(String workspaceId) {
    final workspace = workspaces.firstWhere((ws) => ws.id == workspaceId);
    return workspace.nextIssueNumber;
  }

  // Add a new task
  static void addTask(Task task) {
    tasks.add(task);
    // Update workspace next issue number
    final wsIndex = workspaces.indexWhere((ws) => ws.id == task.workspaceId);
    if (wsIndex != -1) {
      workspaces[wsIndex].nextIssueNumber = task.issueNumber + 1;
    }
  }

  // Update task status
  static void updateTaskStatus(String taskId, TaskStatus newStatus) {
    final index = tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      tasks[index] = tasks[index].copyWith(status: newStatus);
    }
  }

  // Weekly task completion data for charts
  static List<Map<String, dynamic>> weeklyTaskData = [
    {'day': 'Mon', 'completed': 5, 'assigned': 8},
    {'day': 'Tue', 'completed': 7, 'assigned': 6},
    {'day': 'Wed', 'completed': 4, 'assigned': 9},
    {'day': 'Thu', 'completed': 8, 'assigned': 7},
    {'day': 'Fri', 'completed': 6, 'assigned': 5},
    {'day': 'Sat', 'completed': 2, 'assigned': 2},
    {'day': 'Sun', 'completed': 1, 'assigned': 1},
  ];

  // Monthly task data
  static List<Map<String, dynamic>> monthlyTaskData = [
    {'month': 'Jan', 'completed': 45, 'total': 52},
    {'month': 'Feb', 'completed': 38, 'total': 48},
    {'month': 'Mar', 'completed': 52, 'total': 58},
    {'month': 'Apr', 'completed': 48, 'total': 55},
    {'month': 'May', 'completed': 55, 'total': 60},
  ];
}

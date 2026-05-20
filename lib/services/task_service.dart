import '../models/task_model.dart';
import 'adapters.dart';
import 'api_client.dart';

class TaskService {
  static Future<List<Task>> getAll() async {
    final rows = await ApiClient.get('/tasks') as List;
    return rows.map((r) => taskFromBackend(r as Map<String, dynamic>)).toList();
  }

  static Future<List<Task>> getByWorkspace(String workspaceId) async {
    final rows = await ApiClient.get(
      '/tasks',
      query: {'workspace_id': workspaceId},
    ) as List;
    return rows.map((r) => taskFromBackend(r as Map<String, dynamic>)).toList();
  }

  static Future<Task> getById(String id) async {
    final j = await ApiClient.get('/tasks/$id') as Map<String, dynamic>;
    return taskFromBackend(j);
  }

  static Future<Task> create({
    required String title,
    String? description,
    TaskStatus? status,
    required TaskPriority priority,
    required String workspaceId,
    required String assigneeId,
    int? estimatedHours,
    DateTime? deadline,
  }) async {
    final j = await ApiClient.post(
      '/tasks',
      body: taskCreateToBackend(
        title: title,
        description: description,
        status: status,
        priority: priority,
        workspaceId: workspaceId,
        assigneeId: assigneeId,
        estimatedHours: estimatedHours,
        deadline: deadline,
      ),
    ) as Map<String, dynamic>;
    return taskFromBackend(j);
  }

  static Future<Task> update(
    String taskId, {
    String? title,
    String? description,
    TaskStatus? status,
    TaskPriority? priority,
    int? estimatedHours,
    DateTime? deadline,
  }) async {
    final j = await ApiClient.put(
      '/tasks/$taskId',
      body: taskUpdateToBackend(
        title: title,
        description: description,
        status: status,
        priority: priority,
        estimatedHours: estimatedHours,
        deadline: deadline,
      ),
    ) as Map<String, dynamic>;
    return taskFromBackend(j);
  }

  static Future<Task> updateStatus(String taskId, TaskStatus status) async {
    final j = await ApiClient.patch(
      '/tasks/$taskId/status',
      body: {'status': statusToBackend(status)},
    ) as Map<String, dynamic>;
    return taskFromBackend(j);
  }
}

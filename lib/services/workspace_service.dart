import '../models/workspace_model.dart';
import 'adapters.dart';
import 'api_client.dart';

class WorkspaceService {
  static Future<List<Workspace>> getAll() async {
    final rows = await ApiClient.get('/workspaces') as List;
    return rows
        .map((r) => workspaceFromBackend(r as Map<String, dynamic>))
        .toList();
  }

  static Future<Workspace> getById(String id) async {
    final j = await ApiClient.get('/workspaces/$id') as Map<String, dynamic>;
    return workspaceFromBackend(j);
  }

  static Future<Workspace> create({
    required String name,
    String? description,
    required String projectCode,
    String? colorHex,
    String? icon,
    List<String> memberIds = const [],
  }) async {
    final created = await ApiClient.post(
      '/workspaces',
      body: workspaceCreateToBackend(
        name: name,
        description: description,
        projectCode: projectCode,
        colorHex: colorHex,
        icon: icon,
        memberIds: memberIds,
      ),
    ) as Map<String, dynamic>;
    // Re-fetch so member_ids comes back populated in the response.
    return getById(created['id'].toString());
  }

  static Future<Workspace> addMember(String workspaceId, String userId) async {
    await ApiClient.post(
      '/workspaces/$workspaceId/members',
      body: {'user_id': int.parse(userId)},
    );
    return getById(workspaceId);
  }

  static Future<Workspace> removeMember(
    String workspaceId,
    String userId,
  ) async {
    await ApiClient.delete('/workspaces/$workspaceId/members/$userId');
    return getById(workspaceId);
  }
}

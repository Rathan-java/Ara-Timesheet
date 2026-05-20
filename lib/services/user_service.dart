import '../models/user_model.dart';
import 'adapters.dart';
import 'api_client.dart';

class UserService {
  static Future<List<User>> getAll() async {
    final rows = await ApiClient.get('/users') as List;
    return rows.map((r) => userFromBackend(r as Map<String, dynamic>)).toList();
  }

  static Future<List<User>> getByRole(UserRole role) async {
    final rows = await ApiClient.get(
      '/users',
      query: {'role': roleToBackend(role)},
    ) as List;
    return rows.map((r) => userFromBackend(r as Map<String, dynamic>)).toList();
  }

  static Future<User> getById(String id) async {
    final j = await ApiClient.get('/users/$id') as Map<String, dynamic>;
    return userFromBackend(j);
  }

  static Future<User> create({
    required String name,
    required String email,
    required String password,
    required UserRole role,
    String? designation,
    String? teamId,
    String? phone,
  }) async {
    final j = await ApiClient.post(
      '/users',
      body: userCreateToBackend(
        name: name,
        email: email,
        password: password,
        role: role,
        designation: designation,
        teamId: teamId,
        phone: phone,
      ),
    ) as Map<String, dynamic>;
    return userFromBackend(j);
  }
}

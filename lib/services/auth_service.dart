import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_model.dart';
import 'adapters.dart';
import 'api_client.dart';

class AuthService {
  static const _userKey = 'auth_user';

  /// Logs in with email + password against the backend. Persists the JWT and
  /// the resolved user. Returns the user so the caller can route based on role.
  static Future<User> login({
    required String email,
    required String password,
  }) async {
    // Backend returns { user: {...}, token: '...' } inside the standard envelope.
    final data = await ApiClient.post(
      '/auth/login',
      body: {'email': email, 'password': password},
    ) as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = userFromBackend(data['user'] as Map<String, dynamic>);

    await ApiClient.setToken(token);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, _encodeUser(user));
    return user;
  }

  static Future<User?> currentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userKey);
    if (raw == null) return null;
    try {
      return _decodeUser(raw);
    } catch (_) {
      return null;
    }
  }

  static Future<void> logout() async {
    await ApiClient.clearToken();
  }
}

String _encodeUser(User u) => jsonEncode({
      'id': u.id,
      'name': u.name,
      'email': u.email,
      'role': roleToBackend(u.role),
      'team_id': u.teamId,
      'avatar_url': u.avatarUrl,
      'designation': u.designation,
      'joined_date': u.joinedDate.toIso8601String(),
    });

User _decodeUser(String raw) {
  final m = jsonDecode(raw) as Map<String, dynamic>;
  return userFromBackend(m);
}

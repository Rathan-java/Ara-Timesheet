// Thin http wrapper. Reads the JWT from shared_preferences, attaches it as a
// Bearer header, unwraps the backend's { success, message, data } envelope
// and turns non-2xx responses into ApiException with the backend's message.

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'api_config.dart';

class ApiException implements Exception {
  final int? status;
  final String message;
  ApiException(this.message, {this.status});
  @override
  String toString() => 'ApiException($status): $message';
}

class ApiClient {
  static const _tokenKey = 'auth_token';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove('auth_user');
  }

  static Uri _buildUri(String path, [Map<String, dynamic>? query]) {
    final base = Uri.parse(ApiConfig.apiBaseUrl);
    final full = path.startsWith('http')
        ? Uri.parse(path)
        : Uri.parse('${ApiConfig.apiBaseUrl}$path');
    if (query == null || query.isEmpty) return full;
    final qp = <String, String>{};
    query.forEach((k, v) {
      if (v != null) qp[k] = v.toString();
    });
    return full.replace(queryParameters: {
      ...full.queryParameters,
      ...qp,
    });
  }

  static Future<Map<String, String>> _headers({bool jsonBody = false}) async {
    final token = await getToken();
    return {
      if (jsonBody) 'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static dynamic _unwrap(http.Response res) {
    if (res.statusCode == 204) return null;
    dynamic body;
    try {
      body = res.body.isEmpty ? null : jsonDecode(res.body);
    } catch (_) {
      body = null;
    }
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (body is Map && body.containsKey('success')) {
        return body['data'];
      }
      return body;
    }
    final msg = (body is Map && body['message'] is String)
        ? body['message'] as String
        : 'HTTP ${res.statusCode}';
    throw ApiException(msg, status: res.statusCode);
  }

  static Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    final res = await http.get(_buildUri(path, query), headers: await _headers());
    return _unwrap(res);
  }

  static Future<dynamic> post(String path, {Object? body}) async {
    final res = await http.post(
      _buildUri(path),
      headers: await _headers(jsonBody: body != null),
      body: body == null ? null : jsonEncode(body),
    );
    return _unwrap(res);
  }

  static Future<dynamic> put(String path, {Object? body}) async {
    final res = await http.put(
      _buildUri(path),
      headers: await _headers(jsonBody: body != null),
      body: body == null ? null : jsonEncode(body),
    );
    return _unwrap(res);
  }

  static Future<dynamic> patch(String path, {Object? body}) async {
    final res = await http.patch(
      _buildUri(path),
      headers: await _headers(jsonBody: body != null),
      body: body == null ? null : jsonEncode(body),
    );
    return _unwrap(res);
  }

  static Future<dynamic> delete(String path) async {
    final res = await http.delete(
      _buildUri(path),
      headers: await _headers(),
    );
    return _unwrap(res);
  }
}

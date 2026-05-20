// Compile-time configuration for the API layer.
//
//   flutter run --dart-define=USE_MOCK=false \
//               --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
//
// USE_MOCK defaults to true so the app boots against the in-memory data set
// without any backend running. Setting it false routes every read/write
// through the HTTP services in lib/services/.
//
// API_BASE_URL must point at the Express backend's /api prefix. On Android
// emulator use 10.0.2.2; on iOS simulator use 127.0.0.1; on a physical device
// use the host machine's LAN IP.

class ApiConfig {
  static const bool useMock = bool.fromEnvironment(
    'USE_MOCK',
    defaultValue: true,
  );

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );
}

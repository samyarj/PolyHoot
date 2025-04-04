import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/backend-communication-services/environment_prod.dart';
import 'package:flutter/foundation.dart';

class EnvironmentConfig {
  static String get serverUrl {
    if (kReleaseMode) {
      return EnvironmentProd.serverUrl; // Use production in release mode
    }
    return Environment.serverUrl; // Use development in debug mode
  }

  static String get serverUrlSocket {
    if (kReleaseMode) {
      return EnvironmentProd.serverUrlSocket; // Use production in release mode
    }
    return Environment.serverUrlSocket; // Use development in debug mode
  }
}

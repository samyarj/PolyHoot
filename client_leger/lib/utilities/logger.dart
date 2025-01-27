import 'package:logger/logger.dart';

class AppLogger {
  static final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 2,
      errorMethodCount: 8,
      lineLength: 80,
      colors: true,
      printEmojis: true,
    ),
  );

  // Debug log
  static void d(String message) {
    _logger.d(message);
  }

  // Info log
  static void i(String message) {
    _logger.i(message);
  }

  // Warning log
  static void w(String message) {
    _logger.w(message);
  }

  // Error log
  static void e(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e(message, error: error, stackTrace: stackTrace);
  }
}

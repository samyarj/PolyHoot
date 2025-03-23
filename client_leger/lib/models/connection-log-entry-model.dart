class ConnectionLogEntry {
  final String timestamp;
  final String action;

  ConnectionLogEntry({
    required this.timestamp,
    required this.action,
  });

  factory ConnectionLogEntry.fromJson(Map<String, dynamic> json) {
    // The timestamp is already pre-formatted in the database as "dd/MM/yyyy HH:mm:ss"
    // So we just need to extract it directly
    String formattedTimestamp;

    try {
      final timestamp = json['timestamp'];

      // If it's already a properly formatted string, use it directly
      if (timestamp is String &&
          timestamp.contains('/') &&
          timestamp.contains(':')) {
        formattedTimestamp = timestamp;
      } else {
        formattedTimestamp = 'Format inconnu';
      }
    } catch (e) {
      formattedTimestamp = 'Format inconnu';
    }

    return ConnectionLogEntry(
      timestamp: formattedTimestamp,
      action: json['action'] ?? 'unknown',
    );
  }
}

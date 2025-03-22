class GameLogEntry {
  final String? gameName;
  final String? startTime;
  final String? endTime;
  final String? status;
  final String? result;

  GameLogEntry({
    this.gameName,
    this.startTime,
    this.endTime,
    this.status,
    this.result,
  });

  factory GameLogEntry.fromJson(Map<String, dynamic> json) {
    // Function to handle date fields that are already formatted in the database
    String handleDateField(dynamic field) {
      if (field == null) return '--';

      try {
        // If it's already a properly formatted string like "21/03/2025 05:55:06"
        if (field is String && field.contains('/') && field.contains(':')) {
          return field;
        }

        // If it's in the format "dd/MM/yyyy HH:mm:ss" but needs quotes removed
        if (field is String && field.startsWith('"') && field.endsWith('"')) {
          return field.substring(1, field.length - 1);
        }

        return field.toString();
      } catch (e) {
        return '--';
      }
    }

    return GameLogEntry(
      gameName: json['gameName'] as String?,
      startTime: handleDateField(json['startTime']),
      endTime: handleDateField(json['endTime']),
      status: json['status'] as String?,
      result: json['result'] as String?,
    );
  }
}

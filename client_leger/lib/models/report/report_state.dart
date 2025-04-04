class ReportState {
  final String message;
  final bool isBanned;

  ReportState({
    required this.message,
    required this.isBanned,
  });

  factory ReportState.fromJson(Map<String, dynamic> json) {
    return ReportState(
      message: json['message'] as String,
      isBanned: json['isBanned'] as bool,
    );
  }
}
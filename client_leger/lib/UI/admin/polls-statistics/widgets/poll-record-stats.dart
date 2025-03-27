import 'package:client_leger/UI/admin/polls-statistics/widgets/poll-stats-chart.dart';
import 'package:client_leger/models/polls/published-poll-model.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:flutter/material.dart';

class PollRecordStats extends StatelessWidget {
  final PublishedPoll poll;
  final int currentQuestionIndex;
  final VoidCallback onPreviousQuestion;
  final VoidCallback onNextQuestion;

  const PollRecordStats({
    Key? key,
    required this.poll,
    required this.currentQuestionIndex,
    required this.onPreviousQuestion,
    required this.onNextQuestion,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currentQuestion = poll.questions[currentQuestionIndex];
    // Get screen size
    final screenSize = MediaQuery.of(context).size;
    // Calculate fixed container width (80% of screen width)
    final containerWidth = screenSize.width * 0.8;
    // Left column (30% of container)
    final leftColumnWidth = containerWidth * 0.3;

    final List<Color> chartColors = [
      Color(0xFF2E3A59), // dark indigo-blue
      Color(0xFF3A4D3F), // dark muted green
      Color(0xFF4B2E4C), // dark purple/magenta
      Color(0xFF4A1C1A), // dark wine red
    ];

    List<int> votes = [];
    if (poll.totalVotes.containsKey(currentQuestionIndex.toString())) {
      votes = poll.totalVotes[currentQuestionIndex.toString()] ?? [];
    } else {
      votes = List.generate(currentQuestion.choices?.length ?? 0, (index) => 0);
    }

    int totalResponses = 0;
    poll.totalVotes.forEach((key, votesList) {
      totalResponses += votesList.fold(0, (sum, count) => sum + count);
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          poll.title,
          style: TextStyle(
            color: colorScheme.onSurface,
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.left,
        ),
        SizedBox(height: 16),
        Divider(
            color: colorScheme.secondary.withValues(alpha: 0.8), thickness: 2),
        SizedBox(height: 16),
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: leftColumnWidth,
                child: Card(
                  color: colorScheme.surface.withOpacity(0.9),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: colorScheme.secondary.withOpacity(0.8),
                      width: 2,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: LayoutBuilder(builder: (context, constraints) {
                      return SingleChildScrollView(
                        child: ConstrainedBox(
                          constraints:
                              BoxConstraints(minHeight: constraints.maxHeight),
                          child: IntrinsicHeight(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Informations générales",
                                  style: TextStyle(
                                    color: colorScheme.tertiary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 16),
                                _buildInfoRow(
                                  context,
                                  "Date de fin:",
                                  formatDate(poll.endDate) ?? "Non spécifiée",
                                  Icons.calendar_today,
                                ),
                                SizedBox(height: 12),
                                _buildInfoRow(
                                  context,
                                  "Nombre de questions:",
                                  "${poll.questions.length}",
                                  Icons.format_list_numbered_outlined,
                                ),
                                SizedBox(height: 12),
                                _buildInfoRow(
                                  context,
                                  "Total des réponses:",
                                  "$totalResponses",
                                  Icons.how_to_vote_outlined,
                                ),
                                SizedBox(height: 16),
                                Divider(
                                    color:
                                        colorScheme.tertiary.withOpacity(0.5)),
                                SizedBox(height: 16),
                                Text(
                                  "Description",
                                  style: TextStyle(
                                    color: colorScheme.tertiary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 12),
                                Container(
                                  padding: EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: colorScheme.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color:
                                          colorScheme.tertiary.withOpacity(0.3),
                                    ),
                                  ),
                                  child: Text(
                                    poll.description,
                                    style: TextStyle(
                                      color: colorScheme.onSurface,
                                      fontSize: 14,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ),
                                Spacer(),
                                _buildQuestionProgressIndicator(
                                  colorScheme,
                                  leftColumnWidth - 32,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
              ),
              Container(
                width: 1,
                margin: EdgeInsets.symmetric(horizontal: 16),
                color: colorScheme.tertiary.withOpacity(0.5),
              ),
              Expanded(
                child: Card(
                  color: colorScheme.surface.withOpacity(0.9),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                        color: colorScheme.secondary.withOpacity(0.8),
                        width: 2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            // Previous Question Button
                            IconButton(
                              onPressed: currentQuestionIndex > 0
                                  ? onPreviousQuestion
                                  : null,
                              icon: Icon(
                                Icons.chevron_left,
                                size: 28,
                              ),
                              color: currentQuestionIndex > 0
                                  ? colorScheme.tertiary
                                  : colorScheme.onSurface.withOpacity(0.3),
                              tooltip: 'Question précédente',
                            ),

                            // Question Title
                            Expanded(
                              child: Container(
                                padding: EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: colorScheme.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      "Question ${currentQuestionIndex + 1}/${poll.questions.length}",
                                      style: TextStyle(
                                        color: colorScheme.tertiary,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                    SizedBox(height: 8),
                                    Text(
                                      currentQuestion.text,
                                      style: TextStyle(
                                        color: colorScheme.onSurface,
                                        fontSize: 18,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            // Next Question Button
                            IconButton(
                              onPressed: currentQuestionIndex <
                                      poll.questions.length - 1
                                  ? onNextQuestion
                                  : null,
                              icon: Icon(
                                Icons.chevron_right,
                                size: 28,
                              ),
                              color: currentQuestionIndex <
                                      poll.questions.length - 1
                                  ? colorScheme.tertiary
                                  : colorScheme.onSurface.withOpacity(0.3),
                              tooltip: 'Question suivante',
                            ),
                          ],
                        ),
                        SizedBox(height: 24),

                        // Pie Chart
                        if (currentQuestion.choices != null &&
                            currentQuestion.choices!.isNotEmpty)
                          Expanded(
                            child: Center(
                              child: Container(
                                height: 350,
                                width: 350,
                                child: PollStatsChart(
                                  question: currentQuestion,
                                  votes: votes,
                                  chartColors: chartColors,
                                ),
                              ),
                            ),
                          )
                        else
                          Expanded(
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.info_outline,
                                    size: 64,
                                    color:
                                        colorScheme.tertiary.withOpacity(0.6),
                                  ),
                                  SizedBox(height: 16),
                                  Text(
                                    "Cette question n'a pas de choix de réponses.",
                                    style: TextStyle(
                                      color: colorScheme.onSurface,
                                      fontSize: 18,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                        // Legend
                        if (currentQuestion.choices != null &&
                            currentQuestion.choices!.isNotEmpty)
                          Container(
                            margin: EdgeInsets.only(top: 16),
                            padding: EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: colorScheme.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Réponses:",
                                  style: TextStyle(
                                    color: colorScheme.tertiary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                SizedBox(height: 12),
                                Wrap(
                                  spacing: 20,
                                  runSpacing: 12,
                                  children: List.generate(
                                    currentQuestion.choices!.length,
                                    (i) {
                                      // Make sure the votes list is long enough
                                      final voteValue =
                                          i < votes.length ? votes[i] : 0;
                                      return _buildLegendItem(
                                        context,
                                        chartColors[i % chartColors.length],
                                        currentQuestion.choices![i].text,
                                        voteValue,
                                        votes.fold(
                                            0, (sum, count) => sum + count),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(
      BuildContext context, String label, String value, IconData icon) {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 22,
          color: colorScheme.tertiary,
        ),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: colorScheme.onSurface.withOpacity(0.7),
                  fontSize: 12,
                ),
              ),
              SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLegendItem(BuildContext context, Color color, String text,
      int votes, int totalVotes) {
    final colorScheme = Theme.of(context).colorScheme;
    final percentage =
        totalVotes > 0 ? (votes / totalVotes * 100).toStringAsFixed(1) : '0';

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        SizedBox(width: 8),
        Text(
          "$text: $votes ($percentage%)",
          style: TextStyle(
            color: colorScheme.onSurface,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildQuestionProgressIndicator(
      ColorScheme colorScheme, double availableWidth) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Progression des questions",
          style: TextStyle(
            color: colorScheme.tertiary,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 8),
        ClipRect(
          // This ensures no overflow occurs
          child: Container(
            height: 8,
            width: availableWidth,
            decoration: BoxDecoration(
              color: colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Stack(
              children: [
                Container(
                  width: ((currentQuestionIndex + 1) / poll.questions.length) *
                      availableWidth,
                  height: 8,
                  decoration: BoxDecoration(
                    color: colorScheme.secondary.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: 8),
        Text(
          "Question ${currentQuestionIndex + 1} sur ${poll.questions.length}",
          style: TextStyle(
            color: colorScheme.onSurface,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

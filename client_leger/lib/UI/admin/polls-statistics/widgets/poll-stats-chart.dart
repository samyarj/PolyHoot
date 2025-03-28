import 'package:client_leger/models/question.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class PollStatsChart extends StatefulWidget {
  final Question question;
  final List<int> votes;
  final List<Color> chartColors;

  const PollStatsChart({
    Key? key,
    required this.question,
    required this.votes,
    required this.chartColors,
  }) : super(key: key);

  @override
  State<PollStatsChart> createState() => _PollStatsChartState();
}

class _PollStatsChartState extends State<PollStatsChart>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  int? _touchedIndex;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOutCubicEmphasized,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final totalVotes = widget.votes.fold(0, (sum, votes) => sum + votes);

    // If no votes or no choices, show empty state
    if (totalVotes == 0 ||
        widget.question.choices == null ||
        widget.question.choices!.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.bar_chart_outlined,
              size: 64,
              color: colorScheme.tertiary.withOpacity(0.6),
            ),
            SizedBox(height: 16),
            Text(
              "Aucune réponse à cette question.",
              style: TextStyle(
                color: colorScheme.onSurface,
                fontSize: 18,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      );
    }

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, _) {
        return PieChart(
          PieChartData(
            pieTouchData: PieTouchData(
              touchCallback: (FlTouchEvent event, pieTouchResponse) {
                setState(() {
                  if (!event.isInterestedForInteractions ||
                      pieTouchResponse == null ||
                      pieTouchResponse.touchedSection == null) {
                    _touchedIndex = null;
                    return;
                  }
                  _touchedIndex =
                      pieTouchResponse.touchedSection!.touchedSectionIndex;
                });
              },
            ),
            sections: _getSections(),
            sectionsSpace: 5,
            centerSpaceRadius: 15,
            startDegreeOffset: -40,
          ),
          duration: Duration(milliseconds: 800),
          swapAnimationCurve: Curves.easeInOutQuint,
        );
      },
    );
  }

  List<PieChartSectionData> _getSections() {
    final totalVotes = widget.votes.fold(0, (sum, votes) => sum + votes);

    // Ensure there are choices to display
    if (widget.question.choices == null || widget.question.choices!.isEmpty) {
      return [];
    }

    return List.generate(
      widget.question.choices!.length,
      (i) {
        final isTouched = i == _touchedIndex;
        final radius =
            isTouched ? 90.0 * _animation.value : 80.0 * _animation.value;
        final fontSize = isTouched ? 20.0 : 16.0;
        final fontWeight = isTouched ? FontWeight.bold : FontWeight.normal;

        // Get vote value, ensuring we don't go out of bounds
        final voteValue = i < widget.votes.length ? widget.votes[i] : 0;

        // Calculate percentage
        final percentage = totalVotes > 0
            ? (voteValue / totalVotes * 100).toStringAsFixed(1)
            : '0';

        return PieChartSectionData(
          color: widget.chartColors[i % widget.chartColors.length],
          value: voteValue.toDouble(),
          title: '$percentage%',
          radius: radius,
          titleStyle: TextStyle(
            fontSize: fontSize,
            fontWeight: fontWeight,
            color: Colors.white,
            shadows: [
              Shadow(
                color: Colors.black.withOpacity(0.5),
                blurRadius: 3,
                offset: Offset(1, 1),
              ),
            ],
          ),
          badgeWidget: isTouched && i < widget.question.choices!.length
              ? _Badge(
                  text: widget.question.choices![i].text,
                  color: widget.chartColors[i % widget.chartColors.length],
                )
              : null,
          badgePositionPercentageOffset: 1.2,
        );
      },
    );
  }
}

class _Badge extends StatelessWidget {
  final String text;
  final Color color;

  const _Badge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        text,
        style: TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          shadows: [
            Shadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 2,
              offset: Offset(0.5, 0.5),
            ),
          ],
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }
}

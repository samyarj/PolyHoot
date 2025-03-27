import 'package:flutter/material.dart';

class EmptyPollState extends StatelessWidget {
  const EmptyPollState({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return SingleChildScrollView(
      child: Container(
        margin: EdgeInsets.all(16),
        padding: EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: colorScheme.surface.withOpacity(0.9),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: colorScheme.tertiary, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: Offset(0, 5),
            ),
          ],
        ),
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.8,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Animation or Icon
              SizedBox(
                height: 150,
                width: 150,
                child: _buildAnimation(colorScheme),
              ),
              SizedBox(height: 16),
              Text(
                "Aucun sondage sélectionné",
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12),
              Text(
                "Sélectionnez un sondage dans la liste pour afficher ses statistiques",
                style: TextStyle(
                  color: colorScheme.onSurface.withOpacity(0.7),
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 20),
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border:
                      Border.all(color: colorScheme.tertiary.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Center(
                      child: Text(
                        "Avec l'historique des sondages, vous pouvez:",
                        style: TextStyle(
                          color: colorScheme.tertiary,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: 12),
                    _buildFeatureRow(
                      context,
                      Icons.assessment,
                      "Visualiser les résultats des sondages expirés",
                    ),
                    SizedBox(height: 8),
                    _buildFeatureRow(
                      context,
                      Icons.insights,
                      "Analyser les tendances des réponses aux questions",
                    ),
                    SizedBox(height: 8),
                    _buildFeatureRow(
                      context,
                      Icons.delete_outline,
                      "Nettoyer l'historique lorsqu'il n'est plus nécessaire",
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAnimation(ColorScheme colorScheme) {
    // Simple animated icon
    return Center(
      child: TweenAnimationBuilder<double>(
        tween: Tween<double>(begin: 0.5, end: 1.0),
        duration: Duration(seconds: 2),
        curve: Curves.elasticOut,
        builder: (context, value, child) {
          return Transform.scale(
            scale: value,
            child: Icon(
              Icons.poll_outlined,
              size: 120,
              color: colorScheme.tertiary,
            ),
          );
        },
      ),
    );
  }

  Widget _buildFeatureRow(BuildContext context, IconData icon, String text) {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          color: colorScheme.tertiary,
          size: 20,
        ),
        SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: colorScheme.onSurface,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}

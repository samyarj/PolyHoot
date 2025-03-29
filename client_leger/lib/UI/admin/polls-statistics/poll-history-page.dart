import 'package:client_leger/UI/admin/polls-statistics/widgets/poll-record-stats.dart';
import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/backend-communication-services/polls/poll-history-service.dart';
import 'package:client_leger/models/polls/published-poll-model.dart';
import 'package:client_leger/utilities/confirmation_dialog.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';

class AdminPollHistoryPage extends StatefulWidget {
  const AdminPollHistoryPage({Key? key}) : super(key: key);

  @override
  _AdminPollHistoryPageState createState() => _AdminPollHistoryPageState();
}

class _AdminPollHistoryPageState extends State<AdminPollHistoryPage> {
  final PollHistoryService _pollHistoryService = PollHistoryService();
  PublishedPoll? _selectedPoll;
  bool _isClearingHistory = false;
  bool _showPollDetails = false;
  int _currentQuestionIndex = 0;

  @override
  void initState() {
    super.initState();
  }

  void _selectPoll(PublishedPoll poll) {
    setState(() {
      _selectedPoll = poll;
      _currentQuestionIndex = 0;
      _showPollDetails = true;
    });
  }

  void _closePollDetails() {
    setState(() {
      _showPollDetails = false;
    });
  }

  void _nextQuestion() {
    if (_selectedPoll != null &&
        _currentQuestionIndex < _selectedPoll!.questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
    }
  }

  Future<void> _confirmDeleteHistory() async {
    final bool result = await confirmDeleteHistoryDialog(context);
    if (result) {
      await _clearHistory();
    }
  }

  Future<void> _clearHistory() async {
    if (_isClearingHistory) return;

    setState(() {
      _isClearingHistory = true;
    });

    try {
      await _pollHistoryService.deleteAllExpiredPolls();

      if (mounted) {
        showToast(
          context,
          "Supprimé l'historique des sondages expirés avec succès.",
          type: ToastificationType.success,
        );

        setState(() {
          _selectedPoll = null;
          _showPollDetails = false;
        });
      }
    } catch (e) {
      if (mounted) {
        showToast(
          context,
          "Erreur lors de la suppression de l'historique: $e",
          type: ToastificationType.error,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isClearingHistory = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return AnimatedBuilder(
        animation: _pollHistoryService,
        builder: (context, _) {
          final expiredPolls = _pollHistoryService.expiredPolls;
          final isLoading = _pollHistoryService.isLoading;

          return Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [colorScheme.primary, colorScheme.secondary],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: Stack(
              children: [
                // Main Content
                Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 24.0),
                      child: AnimatedTitleWidget(
                        title: "HISTORIQUE DES SONDAGES",
                        fontSize: 42,
                      ),
                    ),
                    SizedBox(height: 24),
                    Expanded(
                      child: Column(
                        children: [
                          Expanded(
                            child: _buildPollsListContent(
                                colorScheme, expiredPolls, isLoading),
                          ),
                          SizedBox(height: 10),
                          Center(
                            child: ElevatedButton.icon(
                              onPressed:
                                  expiredPolls.isEmpty || _isClearingHistory
                                      ? null
                                      : _confirmDeleteHistory,
                              icon: Icon(
                                Icons.delete_outline,
                                color: colorScheme.onPrimary,
                              ),
                              label: Text(
                                "Supprimer l'historique",
                                style: TextStyle(
                                  color: colorScheme.onPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: colorScheme.primary,
                                foregroundColor: colorScheme.onPrimary,
                                disabledBackgroundColor:
                                    colorScheme.primary.withOpacity(0.5),
                                padding: EdgeInsets.symmetric(
                                    horizontal: 40, vertical: 14),
                                side: BorderSide(
                                  color: colorScheme.tertiary,
                                  width: 2,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30),
                                ),
                              ),
                            ),
                          ),
                          SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ],
                ),

                // Popup Poll Details
                if (_showPollDetails && _selectedPoll != null)
                  _buildPollDetailsPopup(colorScheme),
              ],
            ),
          );
        });
  }

  Widget _buildPollsListContent(ColorScheme colorScheme,
      List<PublishedPoll> publishedPolls, bool isLoading) {
    return Card(
      margin: EdgeInsets.all(16),
      color: colorScheme.surface.withOpacity(0.9),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: colorScheme.tertiary, width: 2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // List or Empty State
            Expanded(
              child: isLoading
                  ? Center(child: CircularProgressIndicator())
                  : publishedPolls.isEmpty
                      ? _buildEmptyState(colorScheme)
                      : _buildPollsList(colorScheme, publishedPolls),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(ColorScheme colorScheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.poll_outlined,
            size: 80,
            color: colorScheme.tertiary.withOpacity(0.6),
          ),
          SizedBox(height: 16),
          Text(
            "Aucun sondage dans l'historique.",
            style: TextStyle(
              color: colorScheme.onSurface,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8),
          Text(
            "Les sondages expirés apparaîtront ici",
            style: TextStyle(
              color: colorScheme.onSurface.withOpacity(0.7),
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPollsList(ColorScheme colorScheme, List<PublishedPoll> polls) {
    return ListView.separated(
      itemCount: polls.length,
      separatorBuilder: (context, index) => SizedBox(height: 8),
      itemBuilder: (context, index) {
        final poll = polls[index];

        return Container(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: colorScheme.secondary,
              width: 1.5,
            ),
          ),
          child: Material(
            color: Colors.transparent,
            child: ListTile(
              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              title: Text(
                poll.title,
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              subtitle: Text(
                "Date fin: ${formatDate(poll.endDate)}",
                style: TextStyle(
                  color: colorScheme.onSurface.withOpacity(0.7),
                  fontSize: 14,
                ),
              ),
              trailing: ElevatedButton(
                onPressed: () => _selectPoll(poll),
                style: ElevatedButton.styleFrom(
                  backgroundColor: colorScheme.secondary.withOpacity(0.9),
                  foregroundColor: colorScheme.onSecondary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text("Consulter"),
              ),
              onTap: () => _selectPoll(poll),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPollDetailsPopup(ColorScheme colorScheme) {
    // Check if keyboard is visible
    final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
    final isKeyboardVisible = keyboardHeight > 0;

    // Dynamic height based on keyboard visibility
    final containerHeight = isKeyboardVisible
        ? MediaQuery.of(context).size.height * 0.5
        : MediaQuery.of(context).size.height * 0.8;

    return Stack(
      children: [
        // Dark overlay background
        ModalBarrier(
          color: Colors.black.withOpacity(0.7),
          dismissible: true,
          onDismiss: _closePollDetails,
        ),

        // Dialog content
        Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: EdgeInsets.zero,
          child: Center(
            child: Material(
              color: colorScheme.surface,
              elevation: 24,
              clipBehavior: Clip.antiAlias,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: colorScheme.tertiary.withOpacity(0.5),
                  width: 2.0,
                ),
              ),
              child: Container(
                width: MediaQuery.of(context).size.width * 0.8,
                height: containerHeight,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // Close Button
                    Positioned(
                      top: 12,
                      right: 12,
                      child: IconButton(
                        onPressed: _closePollDetails,
                        icon: Icon(Icons.close),
                        color: colorScheme.onSurface,
                        tooltip: 'Fermer',
                      ),
                    ),

                    // Poll Details Content
                    Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: PollRecordStats(
                        poll: _selectedPoll!,
                        currentQuestionIndex: _currentQuestionIndex,
                        onPreviousQuestion: _previousQuestion,
                        onNextQuestion: _nextQuestion,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

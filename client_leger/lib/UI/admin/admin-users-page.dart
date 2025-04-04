import 'package:client_leger/UI/admin/admin-users-table.dart';
import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/providers/admin/admin-service.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AdminUsersPage extends ConsumerStatefulWidget {
  const AdminUsersPage({Key? key}) : super(key: key);

  @override
  ConsumerState<AdminUsersPage> createState() => _AdminUsersPageState();
}

class _AdminUsersPageState extends ConsumerState<AdminUsersPage> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminUsersProvider.notifier).startListening();
    });
    AppLogger.i("AdminUsersPage initialized");
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    AppLogger.i("AdminUsersPage disposed");
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final adminUsersState = ref.watch(adminUsersProvider);

    // Fixed height for container, similar to GameLogsPage
    final containerHeight = 450.0;

    return Scaffold(
      backgroundColor: colorScheme.primary,
      body: SafeArea(
        // This is the key difference from your original code - wrapping everything in SingleChildScrollView
        child: SingleChildScrollView(
          child: Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 24.0, vertical: 18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Center(
                  child: AnimatedTitleWidget(
                    title: 'Gestion des Utilisateurs',
                    fontSize: 42,
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  decoration: BoxDecoration(
                    color: colorScheme.surface,
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: colorScheme.tertiary, width: 2),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Row(
                    children: [
                      Icon(Icons.search, color: colorScheme.tertiary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          focusNode: _searchFocusNode,
                          decoration: InputDecoration(
                            hintText: 'Rechercher un joueur...',
                            border: InputBorder.none,
                            hintStyle: TextStyle(
                              color: colorScheme.onSurface.withOpacity(0.6),
                            ),
                          ),
                          style: TextStyle(color: colorScheme.onSurface),
                          onChanged: (value) {
                            ref
                                .read(adminUsersProvider.notifier)
                                .setSearchTerm(value);
                          },
                        ),
                      ),
                      if (_searchController.text.isNotEmpty)
                        IconButton(
                          icon: Icon(Icons.clear, color: colorScheme.tertiary),
                          onPressed: () {
                            _searchController.clear();
                            ref
                                .read(adminUsersProvider.notifier)
                                .setSearchTerm('');
                            _searchFocusNode.unfocus();
                          },
                        ),
                    ],
                  ),
                ),
                // Fixed height container similar to GameLogsPage
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: colorScheme.tertiary, width: 2),
                    borderRadius: BorderRadius.circular(8),
                    color: colorScheme.surface,
                  ),
                  height: containerHeight,
                  clipBehavior: Clip.antiAlias,
                  child: adminUsersState.isLoading
                      ? const Center(child: ThemedProgressIndicator())
                      : adminUsersState.errorMessage.isNotEmpty
                          ? Center(
                              child: Text(
                                'Erreur: ${adminUsersState.errorMessage}',
                                style: TextStyle(
                                  color: colorScheme.error,
                                  fontSize: 16,
                                ),
                              ),
                            )
                          : adminUsersState.users.isEmpty
                              ? Center(
                                  child: Text(
                                    'Aucun utilisateur trouvé',
                                    style: TextStyle(
                                      color: colorScheme.onSurface,
                                      fontSize: 16,
                                    ),
                                  ),
                                )
                              : Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Theme(
                                    data: Theme.of(context).copyWith(
                                      dividerColor: colorScheme.onSurface
                                          .withOpacity(0.1),
                                      cardColor: Colors.transparent,
                                      scaffoldBackgroundColor:
                                          Colors.transparent,
                                    ),
                                    child: AdminUsersTable(
                                      users: adminUsersState.users,
                                      onBanUser: (userId, durationInDays) {
                                        ref
                                            .read(adminUsersProvider.notifier)
                                            .banUser(userId, durationInDays);
                                      },
                                      onUnbanUser: (userId) {
                                        ref
                                            .read(adminUsersProvider.notifier)
                                            .unbanUser(userId);
                                      },
                                    ),
                                  ),
                                ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

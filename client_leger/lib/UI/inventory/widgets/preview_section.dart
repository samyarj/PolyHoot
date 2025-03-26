import 'package:client_leger/UI/inventory/widgets/avatar_preview.dart';
import 'package:client_leger/UI/inventory/widgets/theme_preview.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:flutter/material.dart';

class PreviewSection extends StatelessWidget {
  final AppTheme? currentTheme;
  final String? currentAvatar;
  final String? currentBanner;
  final String? equippedAvatar;
  final String? equippedBanner;
  final bool canEquip;
  final bool waitingForServerEquip;
  final VoidCallback onEquip;

  const PreviewSection({
    Key? key,
    required this.currentTheme,
    required this.currentAvatar,
    required this.currentBanner,
    required this.equippedAvatar,
    required this.equippedBanner,
    required this.canEquip,
    required this.waitingForServerEquip,
    required this.onEquip,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final size = MediaQuery.of(context).size;

    // Adjust preview size based on available height
    final isKeyboardVisible = MediaQuery.of(context).viewInsets.bottom > 0;
    final previewSize = isKeyboardVisible
        ? size.width * 0.12 // Smaller when keyboard is visible
        : size.width * 0.20;

    return Padding(
      padding: const EdgeInsets.all(20.0),
      // Make the column scrollable to handle overflow
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min, // Don't force expansion
          children: [
            // Preview container
            Container(
              width: previewSize,
              height: previewSize,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(previewSize),
                boxShadow: [
                  BoxShadow(
                    color: colorScheme.tertiary.withOpacity(0.3),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: _buildPreviewContent(context),
            ),

            const SizedBox(height: 16), // Consistent spacing

            // Message when nothing is selected
            if (!canEquip && !waitingForServerEquip)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Text(
                  'Veuillez sélectionner un avatar, une bordure d\'avatar ou bien un thème pour la prévoir avant de l\'équiper.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: colorScheme.onPrimary,
                    fontSize: isKeyboardVisible
                        ? 12
                        : 14, // Smaller text when keyboard is visible
                  ),
                ),
              ),

            // Message when waiting for server
            if (!canEquip && waitingForServerEquip)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Text(
                  'En attente de synchronisation des données avec le serveur.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: colorScheme.onPrimary,
                    fontSize: isKeyboardVisible ? 12 : 14,
                  ),
                ),
              ),

            const SizedBox(height: 16), // Consistent spacing

            // Equip button
            _buildEquipButton(context, isKeyboardVisible),
          ],
        ),
      ),
    );
  }

  Widget _buildPreviewContent(BuildContext context) {
    if (currentTheme != null) {
      return ThemePreview(theme: currentTheme!);
    } else if (currentAvatar != null || currentBanner != null) {
      return AvatarPreview(
        avatarUrl: currentAvatar,
        bannerUrl: currentBanner,
      );
    } else {
      return const SizedBox.shrink();
    }
  }

  Widget _buildEquipButton(BuildContext context, bool isKeyboardVisible) {
    final colorScheme = Theme.of(context).colorScheme;

    return ElevatedButton(
      onPressed: canEquip ? onEquip : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        // Adjust button size when keyboard is visible
        minimumSize:
            isKeyboardVisible ? const Size(150, 40) : const Size(200, 50),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(25),
          side: BorderSide(
            color: colorScheme.tertiary,
            width: 2,
          ),
        ),
        elevation: 5,
        shadowColor: colorScheme.tertiary.withOpacity(0.5),
      ),
      child: Text(
        !canEquip ? 'En attente de choix' : 'Équiper',
        style: TextStyle(
          fontSize: isKeyboardVisible ? 14 : 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

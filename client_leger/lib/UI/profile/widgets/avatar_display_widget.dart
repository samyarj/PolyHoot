import 'dart:io';

import 'package:flutter/material.dart';

enum AvatarSelectionType { none, predefined, file }

class AvatarDisplayWidget extends StatelessWidget {
  final String currentAvatarUrl;
  final String? selectedPredefinedAvatar;
  final File? selectedFile;
  final Function() onEquipAvatar;
  final Function() onUploadImage;
  final Function() onEditIconPressed;
  final bool isUploading;

  const AvatarDisplayWidget({
    Key? key,
    required this.currentAvatarUrl,
    required this.selectedPredefinedAvatar,
    required this.selectedFile,
    required this.onEquipAvatar,
    required this.onUploadImage,
    required this.onEditIconPressed,
    required this.isUploading,
  }) : super(key: key);

  AvatarSelectionType get selectionType {
    if (selectedFile != null) {
      return AvatarSelectionType.file;
    } else if (selectedPredefinedAvatar != null) {
      return AvatarSelectionType.predefined;
    } else {
      return AvatarSelectionType.none;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Calculate a smaller fixed size for the avatar - using small size to save space
    final double avatarSize = 80.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          'Mon avatar',
          style: TextStyle(
            color: colorScheme.onPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),

        // Current avatar display with edit icon overlay
        Stack(
          alignment: Alignment.center,
          children: [
            // Profile container with border and background
            GestureDetector(
              onTap: onEditIconPressed,
              child: Container(
                width: avatarSize,
                height: avatarSize,
                decoration: BoxDecoration(
                  color: colorScheme.primary, // Background color is primary
                  border: Border.all(
                    color: colorScheme.tertiary,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(40),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 6,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(40),
                  child: _buildAvatarImage(colorScheme),
                ),
              ),
            ),

            // Edit icon overlay - smaller pencil icon
            Positioned(
              top: 0,
              right: 0,
              child: GestureDetector(
                onTap: onEditIconPressed,
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: colorScheme.surface.withValues(alpha: 0.9),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Icon(
                      Icons.camera_alt,
                      color: colorScheme.onPrimary,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Action button (Apply or Upload based on selection type)
        // Replace the Action button section with this code:

// Action button (Apply or Upload based on selection type)
        if (selectionType != AvatarSelectionType.none)
          SizedBox(
            width: 140,
            height: 36, // Smaller button height
            child: ElevatedButton(
              onPressed: isUploading
                  ? null
                  : (selectionType == AvatarSelectionType.predefined
                      ? onEquipAvatar
                      : onUploadImage),
              style: ElevatedButton.styleFrom(
                backgroundColor: colorScheme.surface,
                foregroundColor: colorScheme.onSurface,
                disabledBackgroundColor: colorScheme.surface.withOpacity(0.7),
                disabledForegroundColor: colorScheme.onSurface.withOpacity(0.5),
                padding: EdgeInsets.zero,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: isUploading
                        ? colorScheme.tertiary.withValues(alpha: 0.4)
                        : colorScheme.tertiary.withValues(alpha: 0.8),
                    width: 2,
                  ),
                ),
              ),
              child: isUploading && selectionType == AvatarSelectionType.file
                  ? Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: colorScheme.onSurface,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          "Envoi...",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    )
                  : Text(
                      selectionType == AvatarSelectionType.predefined
                          ? "Appliquer"
                          : "Téléverser",
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
      ],
    );
  }

  Widget _buildAvatarImage(ColorScheme colorScheme) {
    if (selectedFile != null) {
      // Show selected file preview
      return Image.file(
        selectedFile!,
        fit: BoxFit.cover,
      );
    } else if (selectedPredefinedAvatar != null) {
      // Show selected predefined avatar
      return Image.network(
        selectedPredefinedAvatar!,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) =>
            _buildCurrentAvatarImage(colorScheme),
      );
    } else {
      // Show current avatar
      return _buildCurrentAvatarImage(colorScheme);
    }
  }

  Widget _buildCurrentAvatarImage(ColorScheme colorScheme) {
    return currentAvatarUrl.isNotEmpty
        ? Image.network(
            currentAvatarUrl,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => Icon(
              Icons.person,
              size: 40,
              color: colorScheme.onPrimary,
            ),
          )
        : Icon(
            Icons.person,
            size: 40,
            color: colorScheme.onPrimary,
          );
  }
}

import 'dart:io';

import 'package:client_leger/UI/profile/widgets/avatar_display_widget.dart';
import 'package:client_leger/UI/profile/widgets/avatar_grid_widget.dart';
import 'package:flutter/material.dart';

class AvatarSelectionWidget extends StatelessWidget {
  final List<String> defaultAvatars;
  final String? selectedAvatar;
  final String currentAvatarUrl;
  final File? selectedFile;
  final Function(String) onAvatarSelected;
  final Function() onEquipAvatar;
  final Function() onPickImage;
  final Function() onTakePhoto;
  final Function() onUploadImage;
  final bool isUploading;

  const AvatarSelectionWidget({
    Key? key,
    required this.defaultAvatars,
    required this.selectedAvatar,
    required this.currentAvatarUrl,
    required this.selectedFile,
    required this.onAvatarSelected,
    required this.onEquipAvatar,
    required this.onPickImage,
    required this.onTakePhoto,
    required this.onUploadImage,
    required this.isUploading,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 18.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            'Sélectionner un Avatar',
            style: TextStyle(
              color: colorScheme.onPrimary,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 18),

          // Split layout for avatar selection - more compact spacing
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left side: Grid of default avatars (60% width to give more space to grid)
              Expanded(
                flex: 6,
                child: AvatarGridWidget(
                  defaultAvatars: defaultAvatars,
                  selectedAvatar: selectedAvatar,
                  onAvatarSelected: onAvatarSelected,
                ),
              ),

              const SizedBox(width: 8), // Reduced spacing

              // Right side: Current avatar display (40% width to make it more compact)
              Expanded(
                flex: 4,
                child: AvatarDisplayWidget(
                  currentAvatarUrl: currentAvatarUrl,
                  selectedPredefinedAvatar: selectedAvatar,
                  selectedFile: selectedFile,
                  onEquipAvatar: onEquipAvatar,
                  onUploadImage: onUploadImage,
                  onEditIconPressed: () => _showAvatarOptionsDialog(context),
                  isUploading: isUploading,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAvatarOptionsDialog(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: colorScheme.surface,
        title: Text(
          "Modifier votre avatar",
          style: TextStyle(
            color: colorScheme.onSurface,
            fontSize: 16,
          ),
        ),
        content: Text(
          "Comment souhaitez-vous changer votre avatar?",
          style: TextStyle(
            color: colorScheme.onSurface,
            fontSize: 14,
          ),
        ),
        actions: [
          TextButton.icon(
            icon: Icon(Icons.photo_library,
                size: 16, color: colorScheme.onPrimary),
            label: Text(
              "Galerie",
              style: TextStyle(fontSize: 14, color: colorScheme.onPrimary),
            ),
            onPressed: () {
              Navigator.of(context).pop();
              onPickImage();
            },
            style: TextButton.styleFrom(
              foregroundColor: colorScheme.tertiary,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            ),
          ),
          TextButton.icon(
            icon: Icon(
              Icons.camera_alt,
              size: 16,
              color: colorScheme.onPrimary,
            ),
            label: Text(
              "Caméra",
              style: TextStyle(fontSize: 14, color: colorScheme.onPrimary),
            ),
            onPressed: () {
              Navigator.of(context).pop();
              onTakePhoto();
            },
            style: TextButton.styleFrom(
              foregroundColor: colorScheme.tertiary,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            ),
          ),
          TextButton.icon(
            icon: Icon(Icons.cancel, size: 16, color: colorScheme.onPrimary),
            label: Text(
              "Annuler",
              style: TextStyle(fontSize: 14, color: colorScheme.onPrimary),
            ),
            onPressed: () {
              Navigator.of(context).pop();
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.grey,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            ),
          ),
        ],
      ),
    );
  }
}

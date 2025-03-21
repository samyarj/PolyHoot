import 'dart:io';

import 'package:flutter/material.dart';

class CustomAvatarUploadWidget extends StatelessWidget {
  final File? selectedFile;
  final Function() onPickImage;
  final Function() onUploadImage;

  const CustomAvatarUploadWidget({
    Key? key,
    required this.selectedFile,
    required this.onPickImage,
    required this.onUploadImage,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Téléverser un avatar personnalisé',
          style: theme.textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Selected file preview
            if (selectedFile != null)
              Container(
                height: 80,
                width: 80,
                margin: const EdgeInsets.only(right: 16),
                decoration: BoxDecoration(
                  border:
                      Border.all(color: colorScheme.primary.withOpacity(0.5)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(7),
                  child: Image.file(
                    selectedFile!,
                    fit: BoxFit.cover,
                  ),
                ),
              ),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (selectedFile != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Text(
                        'Image sélectionnée',
                        style: theme.textTheme.bodySmall,
                      ),
                    ),

                  // Upload buttons in a more compact layout
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: onPickImage,
                          icon: const Icon(Icons.photo_library, size: 18),
                          label: const Text('Choisir'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: colorScheme.primary,
                            foregroundColor: colorScheme.onPrimary,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed:
                              selectedFile == null ? null : onUploadImage,
                          icon: const Icon(Icons.upload, size: 18),
                          label: const Text("Téléverser"),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: colorScheme.secondary,
                            foregroundColor: colorScheme.onSecondary,
                            disabledBackgroundColor:
                                colorScheme.secondary.withOpacity(0.3),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        if (selectedFile == null)
          Padding(
            padding: const EdgeInsets.only(top: 8.0),
            child: Text(
              'Choisissez une image depuis votre galerie pour personnaliser votre avatar.',
              style: theme.textTheme.bodySmall,
            ),
          ),
      ],
    );
  }
}

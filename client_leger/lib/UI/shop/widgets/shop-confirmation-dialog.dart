import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:flutter/material.dart';

Future<bool> showShopConfirmationDialog({
  required BuildContext context,
  required String type,
  required String itemUrl,
  required int price,
}) async {
  String messageTarget = '';
  Widget previewWidget;
  final colorScheme = Theme.of(context).colorScheme;

  switch (type) {
    case 'avatar':
      messageTarget = 'cet avatar';
      previewWidget = _buildImagePreview(itemUrl);
      break;
    case 'banner':
      messageTarget = "cette bannière d'avatar";
      previewWidget = _buildImagePreview(itemUrl);
      break;
    case 'theme':
      messageTarget = 'ce thème';
      previewWidget = _buildThemePreview(getAppThemeFromString(itemUrl));
      break;
    default:
      messageTarget = 'cet item';
      previewWidget = const SizedBox();
  }

  return await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: colorScheme.surface,
          title: Text(
            'Confirmation',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Voulez vous acheter $messageTarget?',
                style: TextStyle(color: colorScheme.onPrimary),
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  border:
                      Border.all(color: colorScheme.onPrimary.withOpacity(0.3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    SizedBox(
                      height: 100,
                      child: previewWidget,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.monetization_on,
                          size: 16,
                          color: colorScheme.onPrimary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$price COINS',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: colorScheme.onPrimary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(
                'Annuler',
                style: TextStyle(color: colorScheme.tertiary),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: Text(
                'Acheter',
                style: TextStyle(color: colorScheme.tertiary),
              ),
            ),
          ],
        ),
      ) ??
      false;
}

Widget _buildImagePreview(String url) {
  return Builder(builder: (context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: colorScheme.onPrimary.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(3),
        child: Image.network(
          url,
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) {
            return Icon(
              Icons.broken_image,
              size: 40,
              color: colorScheme.onPrimary,
            );
          },
        ),
      ),
    );
  });
}

Widget _buildThemePreview(AppTheme theme) {
  return Builder(builder: (context) {
    final themeColorScheme = getThemeColorScheme(theme);
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            themeColorScheme.primary,
            themeColorScheme.tertiary,
          ],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colorScheme.onPrimary.withOpacity(0.3)),
      ),
      child: Center(
        child: Text(
          theme.name.toUpperCase(),
          style: TextStyle(
            color: themeColorScheme.onPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
    );
  });
}

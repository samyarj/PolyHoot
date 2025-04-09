import 'package:flutter/material.dart';

class AvatarGridWidget extends StatelessWidget {
  final List<String> defaultAvatars;
  final String? selectedAvatar;
  final Function(String) onAvatarSelected;
  final String gridTitle;
  final bool isDisabled;

  const AvatarGridWidget({
    Key? key,
    required this.defaultAvatars,
    required this.selectedAvatar,
    this.gridTitle = 'Avatars prédéfinis',
    this.isDisabled = false,
    required this.onAvatarSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          gridTitle,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: colorScheme.onPrimary,
          ),
        ),
        // Compact grid with smaller avatars - using 4 columns instead of 3 to make them smaller
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4, // 4 columns for even smaller avatars
            crossAxisSpacing: 4,
            mainAxisSpacing: 4,
            childAspectRatio: 1,
          ),
          itemCount: defaultAvatars.length,
          itemBuilder: (context, index) {
            final avatar = defaultAvatars[index];
            return GestureDetector(
              onTap: isDisabled ? null : () => onAvatarSelected(avatar),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: selectedAvatar == avatar
                        ? colorScheme.tertiary
                        : Colors.transparent,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: Image.network(
                    avatar,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: Colors.grey.shade700,
                      child: Icon(
                        Icons.error,
                        size: 12,
                        color: colorScheme.onPrimary,
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

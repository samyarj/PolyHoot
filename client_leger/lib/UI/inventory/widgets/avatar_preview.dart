import 'package:flutter/material.dart';

class AvatarPreview extends StatelessWidget {
  final String? avatarUrl;
  final String? bannerUrl;

  const AvatarPreview({
    Key? key,
    this.avatarUrl,
    this.bannerUrl,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return LayoutBuilder(
      builder: (context, constraints) {
        final containerSize = constraints.maxWidth;

        return Center(
          child: Container(
            width: containerSize,
            height: containerSize,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Avatar image FIRST (bottom layer)
                if (avatarUrl != null && avatarUrl!.isNotEmpty)
                  Container(
                    width: containerSize * 0.85,
                    height: containerSize * 0.85,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      image: DecorationImage(
                        image: NetworkImage(avatarUrl!),
                        fit: BoxFit.cover,
                        onError: (exception, stackTrace) {
                          return;
                        },
                      ),
                    ),
                  )
                else
                  Container(
                    width: containerSize * 0.85,
                    height: containerSize * 0.85,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: colorScheme.primary,
                    ),
                    child: Center(
                      child: Icon(
                        Icons.person,
                        size: containerSize * 0.5,
                        color: colorScheme.onPrimary,
                      ),
                    ),
                  ),

                if (bannerUrl != null && bannerUrl!.isNotEmpty && bannerUrl != 'remove_banner')
                  _buildBannerImage(bannerUrl!, containerSize),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBannerImage(String url, double containerSize) {
    // Check if this is the special banner that needs 200% size
    bool isSpecialBanner = url ==
        'https://res.cloudinary.com/dtu6fkkm9/image/upload/t_banner-tranf/v1741396585/border-12_ekpeb9.png';

    final scale = isSpecialBanner ? 2.0 : 1.1;
    final size = containerSize * scale;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        image: DecorationImage(
          image: NetworkImage(url),
          fit: BoxFit.cover,
          onError: (exception, stackTrace) {
            return;
          },
        ),
      ),
    );
  }
}

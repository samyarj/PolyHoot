import 'package:flutter/material.dart';

class AvatarBannerWidget extends StatelessWidget {
  final String? avatarUrl;
  final String? bannerUrl;
  final double size;
  final BoxFit avatarFit;
  final BoxFit bannerFit;

  const AvatarBannerWidget({
    Key? key,
    this.avatarUrl,
    this.bannerUrl,
    this.size = 100.0,
    this.avatarFit = BoxFit.contain, // Changed from cover to contain
    this.bannerFit = BoxFit.contain, // Changed from cover to contain
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          _buildAvatarImage(context),
          if (bannerUrl != null && bannerUrl!.isNotEmpty)
            _buildBannerImage(context, bannerUrl!),
        ],
      ),
    );
  }

  Widget _buildAvatarImage(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final avatarSize = size * 0.85;

    if (avatarUrl != null && avatarUrl!.isNotEmpty) {
      return Container(
        width: avatarSize,
        height: avatarSize,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: colorScheme.primary
              .withOpacity(0.1), // Light background to see image bounds
          image: DecorationImage(
            image: NetworkImage(avatarUrl!),
            fit: avatarFit,
            onError: (exception, stackTrace) {
              return;
            },
          ),
        ),
      );
    } else {
      // Placeholder if no avatar is provided
      return Container(
        width: avatarSize,
        height: avatarSize,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: colorScheme.primary,
        ),
        child: Icon(
          Icons.person,
          size: avatarSize * 0.5,
          color: Colors.white,
        ),
      );
    }
  }

  Widget _buildBannerImage(BuildContext context, String url) {
    // Check if this is the special banner that needs 200% size
    bool isSpecialBanner = url ==
        'https://res.cloudinary.com/dtu6fkkm9/image/upload/t_banner-tranf/v1741396585/border-12_ekpeb9.png';

    final scale = isSpecialBanner ? 2.0 : 1.1;
    final bannerSize = size * scale;

    return Container(
      width: bannerSize,
      height: bannerSize,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        image: DecorationImage(
          image: NetworkImage(url),
          fit: bannerFit,
          onError: (exception, stackTrace) {
            return;
          },
        ),
      ),
    );
  }
}

// A version of the widget that allows tapping
class TappableAvatarBanner extends StatelessWidget {
  final String? avatarUrl;
  final String? bannerUrl;
  final double size;
  final VoidCallback? onTap;
  final BoxFit avatarFit;
  final BoxFit bannerFit;

  const TappableAvatarBanner({
    Key? key,
    this.avatarUrl,
    this.bannerUrl,
    this.size = 100.0,
    this.onTap,
    this.avatarFit = BoxFit.contain, // Changed from cover to contain
    this.bannerFit = BoxFit.contain, // Changed from cover to contain
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AvatarBannerWidget(
        avatarUrl: avatarUrl,
        bannerUrl: bannerUrl,
        size: size,
        avatarFit: avatarFit,
        bannerFit: bannerFit,
      ),
    );
  }
}

// lib/UI/friend-system/friend_avatar.dart
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:flutter/material.dart';

class FriendAvatar extends StatelessWidget {
  final String? avatarUrl;
  final String? bannerUrl;
  final bool isOnline;

  const FriendAvatar({
    Key? key,
    required this.avatarUrl,
    required this.bannerUrl,
    required this.isOnline,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Stack(
      children: [
        AvatarBannerWidget(
          avatarUrl: avatarUrl,
          bannerUrl: bannerUrl,
          size: 55,
          avatarFit: BoxFit.cover,
        ),
        if (isOnline)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
                border: Border.all(
                  color: colorScheme.primary,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

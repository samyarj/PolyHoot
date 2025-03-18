import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AnimatedTitleWidget extends StatefulWidget {
  final String title;
  final double fontSize;

  const AnimatedTitleWidget({
    super.key,
    required this.title,
    this.fontSize = 64,
  });

  @override
  State<AnimatedTitleWidget> createState() => _AnimatedTitleWidgetState();
}

class _AnimatedTitleWidgetState extends State<AnimatedTitleWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _glowAnimation = Tween<double>(begin: 5.0, end: 30.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ColorScheme colorScheme = Theme.of(context).colorScheme;
    final Color textColor = colorScheme.onPrimary;
    final Color glowColor = colorScheme.secondary;

    return AnimatedBuilder(
      animation: _glowAnimation,
      builder: (context, child) {
        return Stack(
          children: [
            // Glowing Shadow Effect
            Text(
              widget.title,
              textAlign: TextAlign.center,
              style: GoogleFonts.orbitron(
                fontSize: widget.fontSize,
                fontWeight: FontWeight.w700,
                color: Colors.transparent,
                letterSpacing: 5,
                shadows: [
                  Shadow(
                    color: glowColor.withValues(alpha: 0.9), // Stronger color
                    blurRadius: _glowAnimation.value, // Dynamic glow
                    offset: const Offset(0, 0),
                  ),
                  Shadow(
                    color: glowColor.withValues(alpha: 0.6),
                    blurRadius: _glowAnimation.value * 1.5, // Outer glow
                    offset: const Offset(0, 0),
                  ),
                  Shadow(
                    color: glowColor.withValues(alpha: 0.4),
                    blurRadius: _glowAnimation.value * 2, // Faint distant glow
                    offset: const Offset(0, 0),
                  ),
                ],
              ),
            ),
            // Main Text
            Text(
              widget.title,
              textAlign: TextAlign.center,
              style: GoogleFonts.orbitron(
                fontSize: widget.fontSize,
                fontWeight: FontWeight.w700,
                color: textColor,
                letterSpacing: 5,
              ),
            ),
          ],
        );
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AnimatedTitleWidget extends StatefulWidget {
  final String title;
  final double fontSize;

  const AnimatedTitleWidget({
    Key? key,
    required this.title,
    this.fontSize = 64,
  }) : super(key: key);

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
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

    _glowAnimation = Tween<double>(begin: 2.0, end: 20.0).animate(
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
    return AnimatedBuilder(
      animation: _glowAnimation,
      builder: (context, child) {
        return Stack(
          children: [
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
                    color: Colors.white.withAlpha(50),
                    blurRadius: _glowAnimation.value,
                    offset: const Offset(0, 0),
                  ),
                ],
              ),
            ),
            Text(
              widget.title,
              textAlign: TextAlign.center,
              style: GoogleFonts.orbitron(
                fontSize: widget.fontSize,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                letterSpacing: 5,
              ),
            ),
          ],
        );
      },
    );
  }
}

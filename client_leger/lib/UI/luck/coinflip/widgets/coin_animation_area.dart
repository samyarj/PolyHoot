import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';
import 'dart:math';

class CoinAnimationArea extends StatefulWidget {
  const CoinAnimationArea({
    super.key,
    required this.gameState,
    required this.submitted,
    required this.selectedSide,
    required this.onSelectSide,
    required this.time,
    required this.winningSide,
  });

  final CoinFlipGameState gameState;
  final bool submitted;
  final String selectedSide;
  final void Function(String side) onSelectSide;
  final double time;
  final String winningSide;

  @override
  State<CoinAnimationArea> createState() => _CoinAnimationAreaState();
}

class _CoinAnimationAreaState extends State<CoinAnimationArea>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300), // Duration of one flip
    )..repeat(); // Repeat the animation indefinitely
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(
          color: Theme.of(context)
              .colorScheme
              .tertiary
              .withValues(alpha: 0.3), // Border color
          width: 2, // Border width
        ),
        boxShadow: [
          BoxShadow(
            color:
                Theme.of(context).colorScheme.tertiary.withValues(alpha: 0.3),
            spreadRadius: 0,
            blurRadius: 10,
          ),
        ],
      ),
      height: 100,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          if (widget.gameState == CoinFlipGameState.BettingPhase &&
              widget.submitted == false)
            GestureDetector(
              onTap: () => widget.onSelectSide('heads'),
              child: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.yellow,
                  boxShadow: widget.selectedSide == 'heads'
                      ? [
                          BoxShadow(
                            color: Theme.of(context)
                                .colorScheme
                                .tertiary
                                .withValues(alpha: 0.3),
                            spreadRadius: 16,
                            blurRadius: 16,
                          )
                        ]
                      : null,
                ),
              ),
            ),
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Theme.of(context).colorScheme.primary,
              border: Border.all(
                color: Theme.of(context)
                    .colorScheme
                    .tertiary
                    .withValues(alpha: 0.3), // Border color
                width: 2, // Border width
              ),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context)
                      .colorScheme
                      .tertiary
                      .withValues(alpha: 0.3),
                  spreadRadius: 0,
                  blurRadius: 10,
                ),
              ],
            ),
            child: widget.gameState == CoinFlipGameState.FlippingPhase
                ? Stack(
                    alignment: Alignment.center,
                    children: [
                      // Flipping Coin
                      AnimatedBuilder(
                        animation: _controller,
                        builder: (context, child) {
                          final isHeads =
                              (_controller.value * 2 * pi) % (2 * pi) < pi;

                          return Transform(
                            alignment: Alignment.center,
                            transform: Matrix4.identity()
                              ..setEntry(3, 2, 0.001) // Perspective
                              ..rotateY(_controller.value *
                                  2 *
                                  pi), // Rotate on Y-axis
                            child: Container(
                              height: 50,
                              width: 50,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isHeads
                                    ? Colors.yellow
                                    : Colors.grey, // Change color dynamically
                              ),
                            ),
                          );
                        },
                      ),
                      // Timer
                      Positioned(
                        top: 20,
                        child: Text(
                          widget.time.toStringAsFixed(1),
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ],
                  )
                : widget.gameState == CoinFlipGameState.ResultsPhase
                    ? Center(
                        child: Container(
                          height: 50,
                          width: 50,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: widget.winningSide == 'heads'
                                ? Colors.yellow
                                : Colors.grey,
                          ),
                          child: Text(
                            widget.time.toStringAsFixed(1),
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                        ),
                      )
                    : Center(
                        child: Text(
                          widget.time.toStringAsFixed(1),
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.onPrimary,
                          ),
                        ),
                      ),
          ),
          if (widget.gameState == CoinFlipGameState.BettingPhase &&
              widget.submitted == false)
            GestureDetector(
              onTap: () => widget.onSelectSide('tails'),
              child: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey,
                  boxShadow: widget.selectedSide == 'tails'
                      ? [
                          BoxShadow(
                            color: Theme.of(context)
                                .colorScheme
                                .tertiary
                                .withValues(alpha: 0.3),
                            spreadRadius: 16,
                            blurRadius: 16,
                          )
                        ]
                      : null,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

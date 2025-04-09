import 'dart:ui';

import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/signup/signup_form.dart';
import 'package:flutter/material.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage>
    with SingleTickerProviderStateMixin {
  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Theme.of(context).colorScheme.primary,
                  Theme.of(context).colorScheme.primary,
                  Theme.of(context).colorScheme.secondary,
                ],
              ),
            ),
          ),
          Center(
            child: Opacity(
              opacity: 0.8,
              child: ImageFiltered(
                imageFilter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Image.asset(
                  'assets/logo.png',
                  fit: BoxFit.contain,
                  height: double.infinity,
                ),
              ),
            ),
          ),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const AnimatedTitleWidget(title: 'POLYHOOT', fontSize: 38),
                const SizedBox(height: 15),
                Container(
                  width: 450,
                  height: screenHeight * 0.7,
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary.withAlpha(180),
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: Theme.of(context)
                            .colorScheme
                            .tertiary
                            .withAlpha(204),
                        blurRadius: 15,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: RawScrollbar(
                      thumbColor: Theme.of(context)
                          .colorScheme
                          .secondary
                          .withAlpha(204), // Fixed withValues to withAlpha
                      radius: const Radius.circular(10), // Rounded corners
                      thickness: 8, // Thickness of the scrollbar
                      thumbVisibility: true, // Always show the scrollbar
                      child: SingleChildScrollView(
                        physics: const ClampingScrollPhysics(),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: SignUpForm(),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

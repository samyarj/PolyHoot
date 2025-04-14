import 'package:flutter/material.dart';

// Constants
const String USERNAME_REGEX = r'^[a-zA-Z0-9._-]{3,14}$';
const int USERNAME_MIN_LENGTH = 3;
const int USERNAME_MAX_LENGTH = 14;

class UsernameFormWidget extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController usernameController;
  final String currentUsername;
  final bool isUsernameTaken;
  final bool isCheckingUsername;
  final bool isTypingUsername;
  final bool isChangingUsername;
  final Function(String) onUsernameChanged;
  final Function() onSubmit;

  const UsernameFormWidget({
    Key? key,
    required this.formKey,
    required this.usernameController,
    required this.currentUsername,
    required this.isUsernameTaken,
    required this.isCheckingUsername,
    required this.isTypingUsername,
    required this.onUsernameChanged,
    required this.isChangingUsername,
    required this.onSubmit,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return TapRegion(
      onTapOutside: (_) => FocusScope.of(context).unfocus(),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize:
                MainAxisSize.min, // Ensures column takes minimum space
            children: [
              Text(
                'Pseudonyme',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onPrimary,
                ),
              ),
              const SizedBox(height: 10),

              // Text field with dark theme style
              Stack(
                clipBehavior: Clip.none, // Prevent clipping of elements
                children: [
                  TextFormField(
                    controller: usernameController,
                    style: TextStyle(
                      color: colorScheme.onPrimary,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: colorScheme.primary.withValues(alpha: 0.5),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      isDense: true, // Make input field more compact
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: BorderSide(
                          color: colorScheme.tertiary,
                          width: 1.5,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: BorderSide(
                          color: colorScheme.tertiary,
                          width: 1.5,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: BorderSide(
                          color: colorScheme.tertiary,
                          width: 2,
                        ),
                      ),
                      hintText: 'Entrez votre nom d\'affichage',
                      hintStyle: TextStyle(
                        color: colorScheme.onPrimary.withValues(alpha: 0.5),
                        fontSize: 14,
                      ),
                      // Ensure consistent space for suffix/clear button
                      suffixIconConstraints: const BoxConstraints(
                        minWidth: 36,
                        minHeight: 36,
                      ),
                      // Clear button is now handled via Positioned widget and not via suffixIcon
                      suffixIcon: isCheckingUsername
                          ? Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: SizedBox(
                                width: 12,
                                height: 12,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    colorScheme.tertiary,
                                  ),
                                ),
                              ),
                            )
                          : null, // We'll use status icons in the clear button's place when appropriate
                      // Use errorText for validation instead of separate widget
                      errorStyle: TextStyle(
                        color: Colors.red[300],
                        fontSize: 10,
                      ),
                      errorMaxLines:
                          3, // Allow multiple lines for error messages
                    ),
                    onChanged: onUsernameChanged,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Le pseudonyme est requis.';
                      }

                      final regex = RegExp(USERNAME_REGEX);
                      if (!regex.hasMatch(value)) {
                        return 'Le pseudonyme doit contenir entre $USERNAME_MIN_LENGTH et $USERNAME_MAX_LENGTH caractères et ne peut inclure que des lettres, des chiffres, des points, des underscores ou des tirets.';
                      }

                      return null;
                    },
                  ),
                  if (usernameController.text.isNotEmpty)
                    Positioned(
                      top: 0,
                      right: 0,
                      bottom: 0,
                      child: isCheckingUsername
                          ? const SizedBox.shrink()
                          : Container(
                              alignment: Alignment.center,
                              width: 36,
                              child: IconButton(
                                onPressed: () {
                                  usernameController.clear();
                                  onUsernameChanged('');
                                },
                                icon: Icon(
                                  Icons.clear,
                                  color: colorScheme.onPrimary
                                      .withValues(alpha: 0.5),
                                  size: 16,
                                ),
                                iconSize: 16,
                                padding: EdgeInsets.zero,
                                visualDensity: VisualDensity.compact,
                                constraints: const BoxConstraints(),
                              ),
                            ),
                    ),
                ],
              ),

              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Builder(
                  builder: (context) {
                    if (isUsernameTaken &&
                        !isCheckingUsername &&
                        !isTypingUsername) {
                      return Padding(
                        padding: const EdgeInsets.only(top: 4.0, left: 4.0),
                        child: Text(
                          'Ce pseudonyme est déjà utilisé.',
                          style: TextStyle(
                            color: Colors.red[300],
                            fontSize: 10,
                            height: 1.0,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      );
                    } else if (!isUsernameTaken &&
                        !isCheckingUsername &&
                        !isTypingUsername &&
                        usernameController.text != currentUsername &&
                        usernameController.text.isNotEmpty &&
                        RegExp(USERNAME_REGEX)
                            .hasMatch(usernameController.text)) {
                      return Padding(
                        padding: const EdgeInsets.only(top: 4.0, left: 4.0),
                        child: Text(
                          'Le pseudonyme est disponible',
                          style: TextStyle(
                            color: Colors.green[300],
                            fontSize: 10,
                            height: 1.0,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      );
                    } else {
                      return const SizedBox(height: 14);
                    }
                  },
                ),
              ),

              const SizedBox(height: 30),

              Center(
                child: SizedBox(
                  width: 260,
                  height: 36,
                  child: ElevatedButton(
                    onPressed: isChangingUsername
                        ? null
                        : ((formKey.currentState?.validate() ?? false) &&
                                !isUsernameTaken &&
                                !isCheckingUsername &&
                                usernameController.text != currentUsername)
                            ? onSubmit
                            : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colorScheme.surface,
                      foregroundColor: colorScheme.onSurface,
                      disabledBackgroundColor:
                          colorScheme.surface.withValues(alpha: 0.3),
                      padding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                        side: (formKey.currentState?.validate() ?? false) &&
                                !isUsernameTaken &&
                                !isCheckingUsername &&
                                !isChangingUsername &&
                                usernameController.text != currentUsername
                            ? BorderSide(
                                color:
                                    colorScheme.tertiary.withValues(alpha: 0.8),
                                width: 2,
                              )
                            : BorderSide.none,
                      ),
                    ),
                    child: isChangingUsername
                        ? Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  colorScheme.onSurface.withValues(alpha: 0.7),
                                ),
                              ),
                            ),
                          )
                        : isCheckingUsername
                            ? SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    colorScheme.onSurface
                                        .withValues(alpha: 0.7),
                                  ),
                                ),
                              )
                            : Text(
                                'Mettre à jour le pseudonyme',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                                overflow: TextOverflow
                                    .ellipsis, // Handle text overflow
                              ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

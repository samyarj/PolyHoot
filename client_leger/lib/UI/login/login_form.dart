import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';

class LoginForm extends ConsumerStatefulWidget {
  const LoginForm({super.key});

  @override
  ConsumerState<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends ConsumerState<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _identifierController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> signIn() async {
    try {
      await ref.read(userProvider.notifier).signIn(
            _identifierController.text.trim(),
            _passwordController.text.trim(),
          );
    } catch (e) {
      if (context.mounted) {
        showErrorDialog(context, getCustomError(e));
      }
    }
  }

  void loginWithGoogle() async {
    try {
      await ref.read(userProvider.notifier).signWithGoogle();
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, getCustomError(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);
    final textColor = Theme.of(context).colorScheme.onPrimary;
    final accentColor = Theme.of(context).colorScheme.secondary;

    InputDecoration getInputDecoration(String label) {
      return InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: textColor, fontSize: 14),
        hintStyle: TextStyle(color: textColor.withAlpha(179), fontSize: 14),
        filled: true,
        fillColor: Colors.black.withAlpha(26),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: accentColor, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.red.shade300, width: 1),
        ),
        errorStyle: TextStyle(color: Colors.red.shade300, fontSize: 12),
      );
    }

    ButtonStyle customButtonStyle = ElevatedButton.styleFrom(
      backgroundColor: accentColor,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      elevation: 3,
      shadowColor: accentColor.withAlpha(128),
    );

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              "Connexion",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 15),

            TextFormField(
              controller: _identifierController,
              style: TextStyle(color: textColor, fontSize: 14),
              cursorColor: accentColor,
              decoration: getInputDecoration('Email ou Pseudonyme'),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Ce champ est requis';
                }
                return null;
              },
            ),
            const SizedBox(height: 10),

            TextFormField(
              controller: _passwordController,
              style: TextStyle(color: textColor, fontSize: 14),
              cursorColor: accentColor,
              decoration: getInputDecoration('Mot de passe'),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Le mot de passe est requis';
                }
                return null;
              },
              onFieldSubmitted: (_) async {
                if (_formKey.currentState!.validate()) {
                  await signIn();
                }
              },
            ),
            const SizedBox(height: 15),

            // Login button - more compact
            SizedBox(
              width: double.infinity,
              height: 40,
              child: ElevatedButton(
                onPressed: userState is AsyncLoading
                    ? null
                    : () async {
                        if (_formKey.currentState!.validate()) {
                          await signIn();
                        }
                      },
                style: customButtonStyle,
                child: userState is AsyncLoading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Login',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ),
            const SizedBox(height: 5),

            Padding(
              padding: const EdgeInsets.only(top: 10, bottom: 3),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline:
                    TextBaseline.alphabetic, // Ensures text aligns properly
                children: [
                  Text(
                    "Vous n'avez pas de compte ? ",
                    style: TextStyle(
                      color: textColor,
                      fontSize: 12,
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.go(Paths.signUp),
                    style: TextButton.styleFrom(
                      minimumSize: Size.zero,
                      padding: EdgeInsets.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      "Inscrivez-vous",
                      style: TextStyle(
                        color: textColor,
                        fontSize: 12,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 2),

            Padding(
              padding: const EdgeInsets.only(top: 3, bottom: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline:
                    TextBaseline.alphabetic, // Ensures text aligns properly
                children: [
                  Text(
                    "Mot de passe oublié ? ",
                    style: TextStyle(
                      color: textColor,
                      fontSize: 12,
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.go(Paths.passwordReset),
                    style: TextButton.styleFrom(
                      minimumSize: Size.zero,
                      padding: EdgeInsets.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      "Réinitialiser mon mot de passe",
                      style: TextStyle(
                        color: textColor,
                        fontSize: 12,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 5),

            Row(
              children: [
                Expanded(child: Divider(color: textColor.withAlpha(128))),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Text(
                    'ou',
                    style: TextStyle(color: textColor, fontSize: 12),
                  ),
                ),
                Expanded(child: Divider(color: textColor.withAlpha(128))),
              ],
            ),

            const SizedBox(height: 10),

            // Google login button - more compact
            SizedBox(
              width: double.infinity,
              height: 40,
              child: OutlinedButton.icon(
                onPressed: userState is AsyncLoading ? null : loginWithGoogle,
                icon: const FaIcon(FontAwesomeIcons.google, size: 14),
                label: const Text(
                  'Se connecter avec Google',
                  style: TextStyle(fontSize: 14),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: textColor,
                  side: BorderSide(color: textColor.withAlpha(128)),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

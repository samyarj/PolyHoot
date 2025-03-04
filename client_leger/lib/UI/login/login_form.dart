import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/providers/user/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
  final greyBorder = OutlineInputBorder(
    borderRadius: BorderRadius.circular(8),
    borderSide: BorderSide(
      color: Colors.grey.shade300,
    ),
  );
  final blueBorder = OutlineInputBorder(
    borderRadius: BorderRadius.circular(8),
    borderSide: BorderSide(
      color: Colors.blue.shade300,
    ),
  );

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> signIn() async {
    if (!_formKey.currentState!.validate()) return;

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
    return Stack(
      children: [
        Container(
          alignment: Alignment.center,
          width: 400,
          padding: EdgeInsets.all(32),
          child: Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Connexion",
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 32),
                  TextFormField(
                    controller: _identifierController,
                    decoration: InputDecoration(
                      labelText: 'Pseudonyme ou Email',
                      enabledBorder: greyBorder,
                      focusedBorder: blueBorder,
                      errorBorder: greyBorder,
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Entrez votre pseudonyme ou votre email SVP';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 32),
                  TextFormField(
                    controller: _passwordController,
                    textInputAction: TextInputAction.done,
                    decoration: InputDecoration(
                      labelText: 'Mot de passe',
                      enabledBorder: greyBorder,
                      focusedBorder: blueBorder,
                      errorBorder: greyBorder,
                    ),
                    obscureText: true,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Entrez votre mot de passe SVP';
                      }
                      return null;
                    },
                    onFieldSubmitted: (_) async {
                      if (_formKey.currentState!.validate()) {
                        await signIn();
                      }
                    },
                  ),
                  SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: userState is AsyncLoading
                          ? null
                          : () async {
                              if (_formKey.currentState!.validate()) {
                                await signIn();
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color.fromARGB(255, 19, 99, 236),
                        foregroundColor: Colors.white, // White text color
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        textStyle: const TextStyle(fontSize: 18),
                      ),
                      child: Text('Connexion'),
                    ),
                  ),
                  SizedBox(height: 16),
                  TextButton(
                    onPressed: () {
                      context.go(Paths.signUp);
                    },
                    child: Text(
                      "Pas de compte ? S'inscrire",
                      style: TextStyle(
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  // Forgot Password Link
                  TextButton(
                    onPressed: () {
                      context.go(Paths.passwordReset);
                    },
                    child: Text(
                      "Mot de passe oublié ?",
                      style: TextStyle(
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  SizedBox(height: 16),
                  // Divider
                  Row(
                    children: [
                      Expanded(child: Divider()),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.0),
                        child: Text('ou'),
                      ),
                      Expanded(child: Divider()),
                    ],
                  ),
                  SizedBox(height: 16),
                  // Google Login
                  OutlinedButton.icon(
                    onPressed:
                        userState is AsyncLoading ? null : loginWithGoogle,
                    icon: Icon(Icons.account_circle, size: 20),
                    label: Text(
                      'Connexion avec Google',
                      style: TextStyle(fontSize: 18),
                    ),
                    style: OutlinedButton.styleFrom(
                      minimumSize: Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (userState is AsyncLoading)
          Positioned.fill(
            child: Center(
              child: CircularProgressIndicator(),
            ),
          ),
      ],
    );
  }
}

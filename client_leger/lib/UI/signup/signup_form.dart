import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/providers/user/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class SignUpForm extends ConsumerStatefulWidget {
  const SignUpForm({super.key});

  @override
  ConsumerState<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends ConsumerState<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  String _usernamePreviousValue = '';
  String _emailPreviousValue = '';

  final FocusNode _usernameFocusNode = FocusNode();
  final FocusNode _emailFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();
  final FocusNode _confirmPasswordFocusNode = FocusNode();

  final GlobalKey<FormFieldState> _usernameFieldKey =
      GlobalKey<FormFieldState>();
  final GlobalKey<FormFieldState> _emailFieldKey = GlobalKey<FormFieldState>();
  final GlobalKey<FormFieldState> _passwordFieldKey =
      GlobalKey<FormFieldState>();
  final GlobalKey<FormFieldState> _confirmPasswordFieldKey =
      GlobalKey<FormFieldState>();

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

  String? _usernameError;
  String? _emailError;

  @override
  void initState() {
    super.initState();

    _usernameFocusNode.addListener(() {
      if (!_usernameFocusNode.hasFocus) {
        if (_usernameController.text.trim() != _usernamePreviousValue) {
          _usernamePreviousValue = _usernameController.text.trim();
          if (_usernameFieldKey.currentState!.validate()) {
            isUsernameTaken(_usernameController.text.trim());
          }
        }
      }
    });

    _emailFocusNode.addListener(() {
      if (!_emailFocusNode.hasFocus) {
        if (_emailController.text.trim() != _emailPreviousValue) {
          _emailPreviousValue = _emailController.text.trim();
          if (_emailFieldKey.currentState!.validate()) {
            isEmailTaken(_emailController.text.trim());
          }
        }
      }
    });

    _passwordFocusNode.addListener(() {
      if (!_passwordFocusNode.hasFocus) {
        _passwordFieldKey.currentState?.validate();
      }
    });

    _confirmPasswordFocusNode.addListener(() {
      if (!_confirmPasswordFocusNode.hasFocus ||
          _confirmPasswordFocusNode.hasFocus) {
        _confirmPasswordFieldKey.currentState?.validate();
      }
    });
  }

  Future signUp() async {
    await isUsernameTaken(_usernameController.text.trim());
    await isEmailTaken(_emailController.text.trim());

    if (_usernameError != null || _emailError != null) {
      return;
    }

    try {
      await ref.read(userProvider.notifier).signUp(
          _usernameController.text.trim(),
          _emailController.text.trim(),
          _passwordController.text.trim());
      if (!mounted) return;
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, getCustomError(e));
    }
  }

  void signUpWithGoogle() async {
    try {
      await ref.read(userProvider.notifier).signWithGoogle(isLogin: false);
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, getCustomError(e));
    } finally {
      // ignore: control_flow_in_finally
      if (!mounted) return;
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    _confirmPasswordFocusNode.dispose();
    _usernameFocusNode.dispose();
    super.dispose();
  }

  String? validateUsername(String? value) {
    if (value == null || value.isEmpty) {
      return 'Un pseudonyme est requis.';
    }
    final usernameRegex = RegExp(r'^[a-zA-Z0-9._]{3,20}$');
    if (!usernameRegex.hasMatch(value)) {
      return "Le nom d'utilisateur doit comporter entre 3 et 20 caractères et ne peut contenir que des lettres, des chiffres, des points, des underscores ou des tirets.";
    }

    return null;
  }

  isUsernameTaken(String username) async {
    try {
      final bool isTaken = await auth_service.isUsernameTaken(username);
      if (isTaken) {
        setState(() {
          _usernameError = 'Ce pseudonyme est déjà pris.';
        });
      } else {
        setState(() {
          _usernameError = null;
        });
      }
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, getCustomError(e));
    }
  }

  String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Un email est requis.';
    }

    final emailRegex =
        RegExp(r'^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$');

    if (!emailRegex.hasMatch(value)) {
      return 'Veuillez entrez une adresse email valide SVP.';
    }

    return null;
  }

  isEmailTaken(String email) async {
    try {
      final bool isTaken = await auth_service.isEmailTaken(email);
      if (isTaken) {
        setState(() {
          _emailError = 'Ce email est déjà pris.';
        });
      } else {
        setState(() {
          _emailError = null;
        });
      }
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, getCustomError(e));
    }
  }

  String? validatePassword(String? value) {
    if (value == null || value.isEmpty || value.length < 6) {
      return 'Le mot de passe doit avoir au moins 6 caractères.';
    }
    return null;
  }

  String? validateConfirmPassword(String? value) {
    if (value == null || value.trim() != _passwordController.text.trim()) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);
    return Stack(
      children: [
        Container(
          alignment: Alignment.center,
          width: 400,
          padding: EdgeInsets.only(top: 0, bottom: 42, left: 32, right: 32),
          child: Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "S'inscrire",
                    style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Colors.black),
                  ),
                  SizedBox(height: 16),
                  // Username Field
                  TextFormField(
                    key: _usernameFieldKey,
                    controller: _usernameController,
                    focusNode: _usernameFocusNode,
                    decoration: InputDecoration(
                      errorMaxLines: 3,
                      labelText: 'Pseudonyme',
                      hintText: 'Entrez votre pseudonyme',
                      errorText: _usernameError,
                      border: OutlineInputBorder(),
                    ),
                    validator: validateUsername,
                  ),
                  SizedBox(height: 16),
                  // Email Field
                  TextFormField(
                    key: _emailFieldKey,
                    controller: _emailController,
                    focusNode: _emailFocusNode,
                    decoration: InputDecoration(
                      labelText: 'Email',
                      hintText: 'Entrez votre email',
                      errorText: _emailError,
                      border: OutlineInputBorder(),
                    ),
                    validator: validateEmail,
                  ),
                  SizedBox(height: 16),
                  // Password Field
                  TextFormField(
                    key: _passwordFieldKey,
                    controller: _passwordController,
                    focusNode: _passwordFocusNode,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Mot de passe',
                      hintText: 'Entrez votre mot de passe',
                      border: OutlineInputBorder(),
                    ),
                    validator: validatePassword,
                  ),
                  SizedBox(height: 16),
                  // Confirm Password Field
                  TextFormField(
                    key: _confirmPasswordFieldKey,
                    controller: _confirmPasswordController,
                    focusNode: _confirmPasswordFocusNode,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Confirmer le mot de passe',
                      hintText: 'Confirmer le mot de passe',
                      border: OutlineInputBorder(),
                    ),
                    validator: validateConfirmPassword,
                  ),
                  SizedBox(height: 16),
                  // Terms and Privacy
                  Text(
                    "En créant un compte, vous acceptez les Conditions d'utilisation et la Politique de confidentialité.",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: userState is AsyncLoading
                        ? null
                        : () async {
                            if (_formKey.currentState!.validate()) {
                              await signUp();
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text('Créer un nouveau compte',
                        style: TextStyle(fontSize: 18)),
                  ),
                  SizedBox(height: 16),
                  TextButton(
                    onPressed: () {
                      context.go(Paths.logIn);
                    },
                    child: Text('Vous avez un compte ? Connexion',
                        style: TextStyle(fontSize: 18)),
                  ),
                  Divider(),
                  SizedBox(height: 16),
                  // Google Sign-Up
                  OutlinedButton.icon(
                    onPressed:
                        userState is AsyncLoading ? null : signUpWithGoogle,
                    icon: Icon(Icons.account_circle),
                    label: Text("S'inscrire avec Google",
                        style: TextStyle(fontSize: 18)),
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      minimumSize: Size(double.infinity, 50),
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

import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/profile/widgets/avatar_grid_widget.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/upload-image/upload_img_service.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
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

  String? _usernameError;
  String? _emailError;
  List<String> _defaultAvatars = [];
  String? _selectedAvatar;

  @override
  void initState() {
    super.initState();
    _loadDefaultAvatars();

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

  void _loadDefaultAvatars() async {
    try {
      final uploadImgService = UploadImgService();
      final avatars = await uploadImgService.getDefaultAvatars();
      if (mounted) {
        setState(() {
          _defaultAvatars = avatars;
          if (_defaultAvatars.isNotEmpty) {
            _selectedAvatar = _defaultAvatars[0];
          }
        });
      }
    } catch (e) {
      if (mounted) {
        showErrorDialog(context, getCustomError(e));
      }
    }
  }

  void _selectAvatar(String avatarUrl) {
    setState(() {
      _selectedAvatar = avatarUrl;
    });
  }

  Future signUp() async {
    await isUsernameTaken(_usernameController.text.trim().toLowerCase());
    await isEmailTaken(_emailController.text.trim().toLowerCase());

    if (_usernameError != null || _emailError != null) {
      return;
    }

    try {
      await ref.read(userProvider.notifier).signUp(
            _usernameController.text.trim().toLowerCase(),
            _emailController.text.trim().toLowerCase(),
            _passwordController.text.trim(),
            _selectedAvatar,
          );
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
    final usernameRegex = RegExp(r'^[a-z0-9]{3,14}$');

    if (!usernameRegex.hasMatch(value)) {
      return "Le nom d'utilisateur doit comporter entre 3 et 14 caractères et ne peut contenir que des lettres minuscules ou des chiffres sans espaces.";
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
        errorMaxLines: 3,
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

    return TapRegion(
      onTapOutside: (_) => FocusScope.of(context).unfocus(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 25),
        child: SingleChildScrollView(
          physics: const ClampingScrollPhysics(),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  "Créer un compte",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 15),

                TextFormField(
                  key: _usernameFieldKey,
                  maxLength: 14,
                  controller: _usernameController,
                  focusNode: _usernameFocusNode,
                  style: TextStyle(color: textColor, fontSize: 14),
                  cursorColor: accentColor,
                  decoration: getInputDecoration('Pseudonyme')
                      .copyWith(errorText: _usernameError),
                  validator: validateUsername,
                ),
                const SizedBox(height: 10),

                TextFormField(
                  key: _emailFieldKey,
                  controller: _emailController,
                  focusNode: _emailFocusNode,
                  style: TextStyle(color: textColor, fontSize: 14),
                  cursorColor: accentColor,
                  decoration: getInputDecoration('Email')
                      .copyWith(errorText: _emailError),
                  validator: validateEmail,
                ),
                const SizedBox(height: 10),

                TextFormField(
                  key: _passwordFieldKey,
                  controller: _passwordController,
                  focusNode: _passwordFocusNode,
                  obscureText: true,
                  style: TextStyle(color: textColor, fontSize: 14),
                  cursorColor: accentColor,
                  decoration: getInputDecoration('Mot de passe'),
                  validator: validatePassword,
                ),
                const SizedBox(height: 10),

                TextFormField(
                  key: _confirmPasswordFieldKey,
                  controller: _confirmPasswordController,
                  focusNode: _confirmPasswordFocusNode,
                  obscureText: true,
                  style: TextStyle(color: textColor, fontSize: 14),
                  cursorColor: accentColor,
                  decoration: getInputDecoration('Confirmer le mot de passe'),
                  validator: validateConfirmPassword,
                ),
                const SizedBox(height: 30),

                // Only show avatars if they've loaded
                if (_defaultAvatars.isNotEmpty)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AvatarGridWidget(
                        defaultAvatars: _defaultAvatars,
                        selectedAvatar: _selectedAvatar,
                        gridTitle: 'Sélectionner un avatar',
                        onAvatarSelected: _selectAvatar,
                      ),
                      const SizedBox(height: 5),
                    ],
                  ),
                const SizedBox(height: 25),

                // Sign Up button
                SizedBox(
                  width: double.infinity,
                  height: 42,
                  child: ElevatedButton(
                    onPressed: userState is AsyncLoading
                        ? null
                        : () async {
                            if (_formKey.currentState!.validate()) {
                              await signUp();
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
                        : Center(
                            child: const Text(
                              'Créer un compte',
                              style: TextStyle(fontSize: 16),
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 5),

                Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 5, horizontal: 5),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        "Vous avez déjà un compte ? ",
                        style: TextStyle(
                          color: textColor,
                          fontSize: 12,
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.go(Paths.logIn),
                        style: TextButton.styleFrom(
                          minimumSize: Size.zero,
                          padding: EdgeInsets.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          "Se connecter",
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

                // Divider
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

                // Google sign up button
                SizedBox(
                  width: double.infinity,
                  height: 40,
                  child: OutlinedButton.icon(
                    onPressed:
                        userState is AsyncLoading ? null : signUpWithGoogle,
                    icon: const FaIcon(FontAwesomeIcons.google, size: 14),
                    label: const Text(
                      "S'inscrire avec Google",
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
        ),
      ),
    );
  }
}

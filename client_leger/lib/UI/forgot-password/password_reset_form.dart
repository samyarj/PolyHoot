import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PasswordResetForm extends StatefulWidget {
  const PasswordResetForm({super.key});

  @override
  State<PasswordResetForm> createState() => _PasswordResetFormState();
}

class _PasswordResetFormState extends State<PasswordResetForm> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final FocusNode _emailFocusNode = FocusNode();
  final GlobalKey<FormFieldState> _emailFieldKey = GlobalKey<FormFieldState>();
  bool _isLoading = false;
  String? _emailError;
  String _previousValue = '';

  @override
  void initState() {
    super.initState();

    _emailFocusNode.addListener(() {
      if (!_emailFocusNode.hasFocus) {
        if (_emailController.text.trim() != _previousValue) {
          _previousValue = _emailController.text.trim();
          checkEmailExists(_emailController.text.trim());
        }
      }
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _emailFocusNode.dispose();
    super.dispose();
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

  Future<void> checkEmailExists(String email) async {
    if (_formKey.currentState!.validate()) {
      try {
        await auth_service.emailCheck(email);
        setState(() {
          _emailError = null;
        });
      } catch (e) {
        if (!mounted) return;
        setState(() {
          _emailError = e.toString();
        });
      }
    }
  }

  void submit(String email) async {
    await checkEmailExists(email);
    if (_emailError == null) {
      setState(() {
        _isLoading = true;
      });
      try {
        await auth_service.forgotPassword(email);
        if (!mounted) return;
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Succès ! Un email de réinitialisation de mot de passe a été envoyé.",
            ),
          ),
        );
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              e.toString(),
              style: TextStyle(
                color: Theme.of(context).colorScheme.onErrorContainer,
              ),
            ),
            backgroundColor: Theme.of(context).colorScheme.errorContainer,
          ),
        );
      } finally {
        setState(() {
          _isLoading = false;
        });
        _emailController.clear();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
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

    return TapRegion(
      onTapOutside: (_) => FocusScope.of(context).unfocus(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'Réinitialisation du mot de passe',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 15),
              Text(
                "Veuillez entrer l'adresse e-mail que vous avez utilisée pour vous inscrire, et nous vous enverrons un lien pour réinitialiser votre mot de passe par e-mail.",
                style: TextStyle(
                  fontSize: 14,
                  color: textColor,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
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
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 42,
                child: ElevatedButton(
                  onPressed: _isLoading || (_emailError != null)
                      ? null
                      : () {
                          if (_formKey.currentState!.validate()) {
                            submit(_emailController.text.trim());
                          }
                        },
                  style: customButtonStyle,
                  child: _isLoading
                      ? SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Center(
                          child: Text(
                            'Réinitialiser mon mot de passe',
                            style: TextStyle(fontSize: 16),
                          ),
                        ),
                ),
              ),
              TextButton(
                onPressed: () => context.go(Paths.logIn),
                style: TextButton.styleFrom(
                  minimumSize: Size.zero,
                  padding:
                      const EdgeInsets.symmetric(vertical: 5, horizontal: 5),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  'Retour à la page de connexion',
                  style: TextStyle(
                    color: textColor,
                    fontSize: 12,
                    decoration: TextDecoration.underline,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

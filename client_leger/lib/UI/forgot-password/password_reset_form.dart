import 'package:client_leger/UI/router/routes.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;

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
  bool _isLoading = false;
  String? _emailError;

  @override
  void initState() {
    super.initState();

    _emailFocusNode.addListener(() {
      if (!_emailFocusNode.hasFocus) {
        checkEmailExists(_emailController.text.trim());
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
      return 'Email is required.';
    }

    final emailRegex =
        RegExp(r'^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$');

    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address.';
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
              'Success! Password reset email sent.',
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
    return Container(
      alignment: Alignment.center,
      width: 400,
      padding: EdgeInsets.only(top: 0, bottom: 42, left: 32, right: 32),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Reset Password',
                style: TextStyle(
                  fontSize: 18,
                ),
              ),
              SizedBox(height: 16),
              Text(
                'Please enter the email address that you used to register, and we will send you a link to reset your password via Email.',
                style: TextStyle(
                    fontSize: 16, color: const Color.fromARGB(255, 78, 77, 77)),
              ),

              SizedBox(height: 16),
              // Email Field
              TextFormField(
                key: _emailFieldKey,
                controller: _emailController,
                focusNode: _emailFocusNode,
                decoration: InputDecoration(
                  hintText: 'Enter your email',
                  enabledBorder: greyBorder,
                  focusedBorder: blueBorder,
                  errorBorder: greyBorder,
                  errorText: _emailError,
                ),
                validator: validateEmail,
              ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _isLoading || (_emailError != null)
                    ? null
                    : () {
                        if (_formKey.currentState!.validate()) {
                          submit(_emailController.text.trim());
                        }
                      },
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 50),
                  backgroundColor: const Color.fromARGB(255, 19, 99, 236),
                  foregroundColor: Colors.white, // White text color
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  textStyle: const TextStyle(fontSize: 18),
                ),
                child: _isLoading
                    ? CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      )
                    : Text(
                        'Reset my password',
                        style: TextStyle(
                          fontSize: 18,
                        ),
                      ),
              ),
              SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  context.go(Paths.logIn);
                },
                child: Text(
                  'Return to Sign In',
                  style: TextStyle(
                    fontSize: 18,
                    color: const Color.fromARGB(255, 19, 99, 236),
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

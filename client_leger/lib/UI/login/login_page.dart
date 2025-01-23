import 'package:client_leger/UI/login/login_form.dart';
import 'package:flutter/material.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Row(
        children: [
          LoginForm(),
          Expanded(
            child: Image.asset(
              'assets/welcome-page-bg.png',
              fit: BoxFit.contain,
            ),
          ),
        ],
      ),
    );
  }
}

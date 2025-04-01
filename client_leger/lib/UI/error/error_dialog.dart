import 'package:flutter/material.dart';

void showErrorDialog(BuildContext context, String errorMessage) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Erreur",
              style: TextStyle(color: Theme.of(context).colorScheme.error)),
          content: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: 600,
            ),
            child: Text(
              errorMessage,
              style: TextStyle(
                  fontSize: 16, color: Theme.of(context).colorScheme.primary),
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(
                "OK",
                style: TextStyle(fontSize: 16),
              ),
            ),
          ],
        );
      },
    );
  });
}

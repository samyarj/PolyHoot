import 'package:flutter/material.dart';

void showErrorDialog(BuildContext context, String errorMessage) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text("Erreur"),
        content: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: 600, 
          ),
          child: Text(
            errorMessage,
            style: TextStyle(fontSize: 16),
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
}

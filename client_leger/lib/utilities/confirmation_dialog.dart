import 'package:flutter/material.dart';

Future<bool> showExitConfirmationDialog(BuildContext context) async {
  return await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text("Quitter la partie ?"),
          content: Text("Êtes-vous sûr de vouloir quitter cette partie ?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text("Annuler"),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: Text("Quitter"),
            ),
          ],
        ),
      ) ??
      false;
}

import 'package:flutter/material.dart';

Future<bool> showExitConfirmationDialog(BuildContext context) async {
  return await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text("Quitter la partie ?",
              style: TextStyle(color: Theme.of(context).colorScheme.onPrimary)),
          content: Text("Êtes-vous sûr de vouloir quitter cette partie ?"),
          backgroundColor: Theme.of(context).colorScheme.surface,
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text("Annuler",
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimary)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: Text("Quitter",
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimary)),
            ),
          ],
        ),
      ) ??
      false;
}

Future<bool> confirmDeleteHistoryDialog(BuildContext context) async {
  return await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text("Supprimer l'historique ?",
              style: TextStyle(color: Theme.of(context).colorScheme.onPrimary)),
          content: Text(
              "Êtes-vous sûr de vouloir supprimer tout l'historique des sondages ? Cette action est irréversible."),
          backgroundColor: Theme.of(context).colorScheme.surface,
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text("Annuler",
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimary)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 30, vertical: 10),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Text(
                    "Supprimer",
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.onPrimary),
                  ),
                ),
              ),
            ),
          ],
        ),
      ) ??
      false;
}

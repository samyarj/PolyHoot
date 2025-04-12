// lib/UI/friend-system/send_money_dialog.dart
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:toastification/toastification.dart';

class SendMoneyDialog extends StatelessWidget {
  final UserWithId friend;
  final int currentUserCoins;
  final TextEditingController moneyAmountController;
  final Function(int) onConfirm;

  const SendMoneyDialog({
    Key? key,
    required this.friend,
    required this.currentUserCoins,
    required this.moneyAmountController,
    required this.onConfirm,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return AlertDialog(
      title: Text(
        'Envoyer des pièces à ${friend.user.username}',
        style: TextStyle(color: colorScheme.onPrimary),
      ),
      backgroundColor: colorScheme.surface,
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Votre solde actuel: $currentUserCoins pièces',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: moneyAmountController,
            style: TextStyle(color: colorScheme.onPrimary),
            decoration: InputDecoration(
              labelText: 'Montant',
              labelStyle: TextStyle(color: colorScheme.onPrimary),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: colorScheme.tertiary),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(color: colorScheme.secondary, width: 2),
              ),
            ),
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
            ],
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(
            'Annuler',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
        ),
        TextButton(
          onPressed: () {
            final amount = int.tryParse(moneyAmountController.text);
            if (amount == null || amount <= 0) {
              showToast(
                context,
                'Veuillez entrer un montant valide',
                type: ToastificationType.error,
              );
              return;
            }

            if (amount > currentUserCoins) {
              showToast(
                context,
                'Solde insuffisant',
                type: ToastificationType.error,
              );
              return;
            }

            Navigator.of(context).pop();
            onConfirm(amount);
          },
          child: Text(
            'Suivant',
            style: TextStyle(color: colorScheme.tertiary),
          ),
        ),
      ],
    );
  }
}

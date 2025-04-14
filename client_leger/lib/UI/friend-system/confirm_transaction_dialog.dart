// lib/UI/friend-system/confirm_transaction_dialog.dart
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:flutter/material.dart';

class ConfirmTransactionDialog extends StatelessWidget {
  final UserWithId friend;
  final int amount;
  final int newBalance;
  final VoidCallback onConfirm;

  const ConfirmTransactionDialog({
    Key? key,
    required this.friend,
    required this.amount,
    required this.newBalance,
    required this.onConfirm,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return AlertDialog(
      title: Text(
        'Finaliser la transaction',
        style: TextStyle(color: colorScheme.onPrimary),
      ),
      backgroundColor: colorScheme.surface,
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildTransactionInfoRow(
              context, 'Destinataire:', friend.user.username),
          const SizedBox(height: 12),
          _buildTransactionInfoRow(context, 'Montant:', '$amount pièces'),
          const SizedBox(height: 12),
          _buildTransactionInfoRow(
              context, 'Solde après transfert:', '$newBalance pièces'),
          const Divider(color: Colors.white30),
          const SizedBox(height: 16),
          _buildTransactionInfoRow(context, 'Total:', '$amount pièces'),
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
            Navigator.of(context).pop();
            onConfirm();
          },
          child: Text(
            'Confirmer',
            style: TextStyle(color: colorScheme.tertiary),
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionInfoRow(
      BuildContext context, String label, String value) {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(color: colorScheme.onPrimary),
        ),
        Text(
          value,
          style: TextStyle(
            color: colorScheme.onPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

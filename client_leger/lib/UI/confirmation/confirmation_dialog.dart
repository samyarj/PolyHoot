import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';

Future<void> showConfirmationDialog(BuildContext context, String message,
    Future<void> Function()? onAsyncConfirm, Function? onConfirm) async {
  return showDialog<void>(
    context: context,
    barrierDismissible: false, // user must tap button!
    builder: (BuildContext context) {
      return _ConfirmationDialog(
        message: message,
        onAsyncConfirm: onAsyncConfirm,
        onConfirm: onConfirm,
      );
    },
  );
}

class _ConfirmationDialog extends StatefulWidget {
  final String message;
  final Future<void> Function()? onAsyncConfirm;
  final Function? onConfirm;

  const _ConfirmationDialog(
      {required this.message,
      required this.onAsyncConfirm,
      required this.onConfirm});

  @override
  __ConfirmationDialogState createState() => __ConfirmationDialogState();
}

class __ConfirmationDialogState extends State<_ConfirmationDialog> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Confirmation',
          style: TextStyle(color: Theme.of(context).colorScheme.primary)),
      content: SingleChildScrollView(
        child: ListBody(
          children: <Widget>[
            Text(
              widget.message,
              style: TextStyle(
                  fontSize: 18, color: Theme.of(context).colorScheme.primary),
            ),
            if (_isLoading)
              Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: Center(
                  child: ThemedProgressIndicator(),
                ),
              ),
          ],
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: _isLoading
              ? null
              : () {
                  Navigator.of(context).pop();
                },
          child: Text(
            'Annuler',
            style: TextStyle(fontSize: 18),
          ),
        ),
        TextButton(
          onPressed: _isLoading
              ? null
              : widget.onConfirm == null
                  ? () async {
                      setState(() {
                        _isLoading = true;
                      });
                      await widget.onAsyncConfirm!();
                      if (mounted) {
                        Navigator.of(context).pop();
                      }
                    }
                  : () {
                      widget.onConfirm!();
                      if (mounted) {
                        Navigator.of(context).pop();
                      }
                    },
          child: Text(
            'Continuer',
            style: TextStyle(fontSize: 18),
          ),
        ),
      ],
    );
  }
}

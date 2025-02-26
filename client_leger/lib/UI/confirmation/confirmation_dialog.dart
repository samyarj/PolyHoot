import 'package:flutter/material.dart';

Future<void> showConfirmationDialog(BuildContext context, String message,
    Future<void> Function() onConfirm) async {
  return showDialog<void>(
    context: context,
    barrierDismissible: false, // user must tap button!
    builder: (BuildContext context) {
      return _ConfirmationDialog(
        message: message,
        onConfirm: onConfirm,
      );
    },
  );
}

class _ConfirmationDialog extends StatefulWidget {
  final String message;
  final Future<void> Function() onConfirm;

  const _ConfirmationDialog({
    required this.message,
    required this.onConfirm,
  });

  @override
  __ConfirmationDialogState createState() => __ConfirmationDialogState();
}

class __ConfirmationDialogState extends State<_ConfirmationDialog> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Confirmation'),
      content: SingleChildScrollView(
        child: ListBody(
          children: <Widget>[
            Text(
              widget.message,
              style: TextStyle(fontSize: 18),
            ),
            if (_isLoading)
              Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: Center(
                  child: CircularProgressIndicator(),
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
              : () async {
                  setState(() {
                    _isLoading = true;
                  });
                  await widget.onConfirm();
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

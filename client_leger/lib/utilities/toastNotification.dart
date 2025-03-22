import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';

void showToast(
  BuildContext context,
  String message, {
  ToastificationType type = ToastificationType.info,
}) {
  toastification.show(
    context: context,
    title: Text(message),
    type: type,
    autoCloseDuration: const Duration(seconds: 3),
    alignment: Alignment.topCenter,
    style: ToastificationStyle.flatColored,
    showIcon: true,
  );
}

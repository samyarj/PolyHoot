import 'package:flutter/widgets.dart';

class LifecycleService with WidgetsBindingObserver {
  static final LifecycleService _instance = LifecycleService._();
  
  factory LifecycleService() {
    return _instance;
  }
  
  LifecycleService._();

  // Default to the app being in the foreground
  AppLifecycleState _appLifecycleState = AppLifecycleState.resumed;

  bool get isAppInBackground => _appLifecycleState == AppLifecycleState.paused;

  void startObserving() {
    WidgetsBinding.instance.addObserver(this);
  }

  void stopObserving() {
    WidgetsBinding.instance.removeObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _appLifecycleState = state;
  }
}

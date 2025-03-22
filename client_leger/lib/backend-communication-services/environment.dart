class Environment {
  static const bool production = false;
  static const String yourLocalIpAddress = "192.168.2.18";
  //static const String yourLocalIpAddress = "10.200.16.185";
  static const String serverUrl = 'http://$yourLocalIpAddress:3000/api';
  static const String serverUrlSocket = 'http://$yourLocalIpAddress:3000';
}

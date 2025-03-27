import 'dart:convert';

import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/providers/play/join_game_provider.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:toastification/toastification.dart';

class QRScannerScreen extends ConsumerStatefulWidget {
  final VoidCallback onClose;
  final QRScannerMode mode;

  const QRScannerScreen({
    Key? key,
    required this.onClose,
    required this.mode,
  }) : super(key: key);

  @override
  ConsumerState<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends ConsumerState<QRScannerScreen> {
  final FriendService _friendService = FriendService();
  final MobileScannerController _controller = MobileScannerController(
    facing: CameraFacing.back,
    formats: [BarcodeFormat.qrCode],
    detectionSpeed: DetectionSpeed.normal,
    detectionTimeoutMs: 1000,
  );
  bool _hasPermission = false;
  bool _isProcessing = false;
  bool _hasProcessedCode = false;

  @override
  void initState() {
    super.initState();
    _checkPermission();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _checkPermission() async {
    final status = await Permission.camera.request();
    setState(() {
      _hasPermission = status.isGranted;
    });

    if (!status.isGranted) {
      // Si l'utilisateur n'a pas accordé la permission, afficher un message
      Future.delayed(Duration(milliseconds: 500), () {
        if (mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              title: Text('Permission requise'),
              content: Text(
                  'L\'accès à la caméra est nécessaire pour scanner les QR codes'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    widget.onClose();
                  },
                  child: Text('Annuler'),
                ),
                TextButton(
                  onPressed: () async {
                    Navigator.pop(context);
                    await openAppSettings();
                    widget.onClose();
                  },
                  child: Text('Ouvrir les paramètres'),
                ),
              ],
            ),
          );
        }
      });
    }
  }

  Future<void> _processQRCode(String data) async {
    if (_isProcessing || _hasProcessedCode) return;

    setState(() {
      _isProcessing = true;
      _hasProcessedCode = true;
    });

    try {
      // Arrêter le scanner pendant le traitement
      await _controller.stop();

      // Décoder les données du QR code
      final jsonData = jsonDecode(data);

      switch (widget.mode) {
        case QRScannerMode.friendRequest:
          await _processFriendRequestQR(jsonData);
          break;
        case QRScannerMode.joinGame:
          await _processJoinGameQR(jsonData);
          break;
      }
    } catch (e) {
      // Erreur lors du décodage du QR code
      if (mounted) {
        showToast(
          context,
          'Format de QR code non reconnu',
          type: ToastificationType.error,
        );
        _controller.start();
        setState(() {
          _isProcessing = false;
          _hasProcessedCode = false;
        });
      }
    }
  }

  Future<void> _processFriendRequestQR(Map<String, dynamic> jsonData) async {
    if (jsonData['type'] == 'friend-request' && jsonData['uid'] != null) {
      final username = jsonData['username'];
      final uid = jsonData['uid'];

      // Afficher le dialogue de confirmation
      final result = await showConfirmationDialog(
        context,
        'Voulez-vous envoyer une demande d\'ami à $username?',
        null,
        null,
        showResult: true,
      );

      if (result == true) {
        try {
          await _friendService.sendFriendRequest(uid);
          if (mounted) {
            showToast(
              context,
              'Demande d\'ami envoyée à $username avec succès',
              type: ToastificationType.success,
            );
            // Fermer l'écran scanner après envoi de la demande
            widget.onClose();
          }
        } catch (e) {
          if (mounted) {
            showErrorDialog(context, e.toString());
            // Redémarrer le scanner après erreur
            _controller.start();
            setState(() {
              _isProcessing = false;
              _hasProcessedCode = false;
            });
          }
        }
      } else {
        // Si l'utilisateur annule, redémarrer le scanner
        if (mounted) {
          _controller.start();
          setState(() {
            _isProcessing = false;
            _hasProcessedCode = false;
          });
        }
      }
    } else {
      // Code QR invalide
      if (mounted) {
        showToast(
          context,
          'QR code invalide. Veuillez scanner un code d\'ami valide.',
          type: ToastificationType.error,
        );
        _controller.start();
        setState(() {
          _isProcessing = false;
          _hasProcessedCode = false;
        });
      }
    }
  }

  Future<void> _processJoinGameQR(Map<String, dynamic> jsonData) async {
    if (jsonData['type'] == 'join-game' &&
        jsonData['roomId'] != null &&
        jsonData['gameName'] != null) {
      final String roomId = jsonData['roomId'];
      final String gameName = jsonData['gameName'];

      // Afficher le dialogue de confirmation
      final result = await showConfirmationDialog(
        context,
        'Voulez-vous rejoindre la partie "$gameName"?',
        null,
        null,
        showResult: true,
      );

      if (result == true) {
        try {
          // Access the joinGameProvider to validate and join the game
          final joinNotifier = ref.read(joinGameProvider.notifier);
          joinNotifier.validGameId(roomId);

          if (mounted) {
            showToast(
              context,
              'Tentative de connexion à la partie "$gameName"...',
              type: ToastificationType.info,
            );
            // Fermer l'écran scanner après l'envoi de la demande
            widget.onClose();
          }
        } catch (e) {
          if (mounted) {
            showErrorDialog(context, e.toString());
            // Redémarrer le scanner après erreur
            _controller.start();
            setState(() {
              _isProcessing = false;
              _hasProcessedCode = false;
            });
          }
        }
      } else {
        // Si l'utilisateur annule, redémarrer le scanner
        if (mounted) {
          _controller.start();
          setState(() {
            _isProcessing = false;
            _hasProcessedCode = false;
          });
        }
      }
    } else {
      // Code QR invalide
      if (mounted) {
        showToast(
          context,
          'QR code invalide. Veuillez scanner un code de partie valide.',
          type: ToastificationType.error,
        );
        _controller.start();
        setState(() {
          _isProcessing = false;
          _hasProcessedCode = false;
        });
      }
    }
  }

  String _getScannerTitle() {
    switch (widget.mode) {
      case QRScannerMode.friendRequest:
        return 'Scanner le QR code d\'un ami';
      case QRScannerMode.joinGame:
        return 'Scanner le QR code d\'une partie';
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (!_hasPermission) {
      return Scaffold(
        backgroundColor: colorScheme.surface,
        appBar: AppBar(
          title: Text('Scanner QR Code'),
          leading: IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: widget.onClose,
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.camera_alt_outlined,
                size: 70,
                color: colorScheme.error,
              ),
              SizedBox(height: 16),
              Text(
                'Accès à la caméra requis',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
              ),
              SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Text(
                  'Pour scanner les QR codes, veuillez autoriser l\'accès à la caméra',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: colorScheme.onSurface.withOpacity(0.8),
                  ),
                ),
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  await openAppSettings();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: colorScheme.tertiary,
                  foregroundColor: colorScheme.onTertiary,
                  padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                ),
                child: Text('Ouvrir les paramètres'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text(
          _getScannerTitle(),
          style: TextStyle(color: Colors.white),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: widget.onClose,
        ),
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (capture) {
              final List<Barcode> barcodes = capture.barcodes;
              if (barcodes.isNotEmpty && !_hasProcessedCode) {
                final String? code = barcodes.first.rawValue;
                if (code != null) {
                  _processQRCode(code);
                }
              }
            },
            fit: BoxFit.cover,
            scanWindow: Rect.fromCenter(
              center: Offset(
                MediaQuery.of(context).size.width / 2,
                MediaQuery.of(context).size.height / 2,
              ),
              width: 250,
              height: 250,
            ),
          ),
          // Overlay with scanning guide
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(
                  color: colorScheme.tertiary,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          // Processing indicator
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(
                      color: colorScheme.tertiary,
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Traitement du QR code...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

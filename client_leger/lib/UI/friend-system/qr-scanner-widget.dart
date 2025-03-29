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
  // Configure camera controller with facing and rotation settings
  late MobileScannerController _controller;
  bool _hasPermission = false;
  bool _isProcessing = false;
  bool _hasProcessedCode = false;
  bool _isCheckingPermission = true;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    setState(() {
      _isCheckingPermission = true;
    });

    final status = await Permission.camera.status;

    if (status.isGranted) {
      _setupCameraController();
    } else {
      final result = await Permission.camera.request();
      if (result.isGranted) {
        _setupCameraController();
      } else {
        if (mounted) {
          setState(() {
            _hasPermission = false;
            _isCheckingPermission = false;
          });
        }
      }
    }
  }

  void _setupCameraController() {
    _controller = MobileScannerController(
      facing: CameraFacing.back,
      detectionSpeed: DetectionSpeed.normal,
      formats: [BarcodeFormat.qrCode],
    );

    // Start the camera
    _controller.start().then((_) {
      if (mounted) {
        setState(() {
          _hasPermission = true;
          _isCheckingPermission = false;
        });
      }
    }).catchError((error) {
      if (mounted) {
        setState(() {
          _hasPermission = false;
          _isCheckingPermission = false;
        });
        showErrorDialog(context,
            'Erreur d\'initialisation de la caméra: ${error.toString()}');
      }
    });
  }

  @override
  void dispose() {
    if (_hasPermission) {
      _controller.dispose();
    }
    super.dispose();
  }

  Future<void> _requestCameraPermission() async {
    setState(() {
      _isCheckingPermission = true;
    });

    final result = await Permission.camera.request();

    if (result.isGranted) {
      _setupCameraController();
    } else {
      if (mounted) {
        setState(() {
          _hasPermission = false;
          _isCheckingPermission = false;
        });
      }
    }
  }

  Future<void> _processQRCode(String data) async {
    if (_isProcessing || _hasProcessedCode) return;

    setState(() {
      _isProcessing = true;
      _hasProcessedCode = true;
    });

    try {
      await _controller.stop();

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
            widget.onClose();
          }
        } catch (e) {
          if (mounted) {
            showErrorDialog(context, e.toString());
            _controller.start();
            setState(() {
              _isProcessing = false;
              _hasProcessedCode = false;
            });
          }
        }
      } else {
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

      final result = await showConfirmationDialog(
        context,
        'Voulez-vous rejoindre la partie "$gameName"?',
        null,
        null,
        showResult: true,
      );

      if (result == true) {
        try {
          final joinNotifier = ref.read(joinGameProvider.notifier);
          joinNotifier.validGameId(roomId);

          if (mounted) {
            showToast(
              context,
              'Tentative de connexion à la partie "$gameName"...',
              type: ToastificationType.info,
            );
            widget.onClose();
          }
        } catch (e) {
          if (mounted) {
            showErrorDialog(context, e.toString());
            _controller.start();
            setState(() {
              _isProcessing = false;
              _hasProcessedCode = false;
            });
          }
        }
      } else {
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
    final screenSize = MediaQuery.of(context).size;

    // Show loading indicator while checking permission
    if (_isCheckingPermission) {
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
              CircularProgressIndicator(
                color: colorScheme.tertiary,
              ),
              SizedBox(height: 24),
              Text(
                'Initialisation de la caméra...',
                style: TextStyle(
                  fontSize: 18,
                  color: colorScheme.onSurface,
                ),
              ),
            ],
          ),
        ),
      );
    }

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
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: _requestCameraPermission,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colorScheme.tertiary,
                      foregroundColor: colorScheme.onTertiary,
                      padding:
                          EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    ),
                    child: Text('Autoriser la caméra'),
                  ),
                  SizedBox(width: 16),
                  ElevatedButton(
                    onPressed: () async {
                      await openAppSettings();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colorScheme.surface,
                      foregroundColor: colorScheme.tertiary,
                      padding:
                          EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    ),
                    child: Text('Ouvrir les paramètres'),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    }

    // Calculate the square dimensions for the scanner
    final scannerSize = screenSize.height * 0.6;

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
      body: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: scannerSize,
              height: scannerSize,
              clipBehavior: Clip.hardEdge,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Transform.rotate(
                angle: 4.71239, // 270 degrees in radians (3π/2)
                child: MobileScanner(
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
                ),
              ),
            ),

            // Scanner border overlay
            Container(
              width: scannerSize,
              height: scannerSize,
              decoration: BoxDecoration(
                border: Border.all(
                  color: colorScheme.tertiary,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
            ),

            // Scanning guide lines (horizontal)
            Container(
              width: scannerSize,
              height: 2,
              color: colorScheme.tertiary.withOpacity(0.7),
            ),

            // Scanning guide lines (vertical)
            Container(
              width: 2,
              height: scannerSize,
              color: colorScheme.tertiary.withOpacity(0.7),
            ),

            // Helper text below scanner
            Positioned(
              bottom: screenSize.height * 0.05,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Positionnez le QR code dans le cadre',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                  ),
                ),
              ),
            ),

            // Processing indicator
            if (_isProcessing)
              Container(
                width: screenSize.width,
                height: screenSize.height,
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
      ),
    );
  }
}

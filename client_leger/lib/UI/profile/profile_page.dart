import 'dart:async';
import 'dart:io';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/profile/widgets/avatar_selection_widget.dart';
import 'package:client_leger/UI/profile/widgets/username_form_widget.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/upload-image/upload_img_service.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:toastification/toastification.dart';

// Constants
const String USERNAME_REGEX = r'^[a-zA-Z0-9._-]{3,14}$';
const int USERNAME_MIN_LENGTH = 3;
const int USERNAME_MAX_LENGTH = 14;

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _usernameController = TextEditingController();

  File? _selectedFile;
  List<String> _defaultAvatars = [];
  String? _selectedAvatar;

  String _currentUsername = '';
  String _currentAvatarUrl = '';
  bool _isCheckingUsername = false;
  bool _isUsernameTaken = false;
  bool _isTypingUsername = false;
  bool _isChangingUsername = false;
  bool _isUploading = false;
  bool _isApplyingAvatar = false;

  // Timer for debouncing username checks
  Timer? _debounceTimer;

  final UploadImgService _uploadImgService = UploadImgService();
  final ImagePicker _imagePicker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _loadDefaultAvatars();
  }

  void _loadUserData(User user) {
    setState(() {
      _currentUsername = user.username;
      _usernameController.text = user.username;
      _currentAvatarUrl = user.avatarEquipped ?? '';
    });
  }

  void _loadDefaultAvatars() async {
    try {
      final avatars = await _uploadImgService.getDefaultAvatars();
      if (mounted) {
        setState(() {
          _defaultAvatars = avatars;
        });
      }
    } catch (e) {
      AppLogger.e('Error loading default avatars: ${e.toString()}');
      if (mounted) {
        showErrorDialog(context, getCustomError(e));
      }
    }
  }

  Future<void> _checkUsername() async {
    final username = _usernameController.text.trim();

    // Skip check if username is the same as current or invalid
    if (username == _currentUsername ||
        !RegExp(USERNAME_REGEX).hasMatch(username)) {
      return;
    }

    setState(() {
      _isTypingUsername = false;
      _isCheckingUsername = true;
    });

    try {
      final bool isTaken = await isUsernameTaken(username);

      if (mounted) {
        setState(() {
          _isUsernameTaken = isTaken;
          _isCheckingUsername = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isCheckingUsername = false;
        });
        showErrorDialog(context, getCustomError(e));
      }
    }
  }

  void _handleUsernameChange(String value) {
    setState(() {
      _isTypingUsername = true;
      _isUsernameTaken = false;
    });

    // Filter input in real-time
    final filteredValue = value.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '');
    if (filteredValue != value) {
      _usernameController.value = TextEditingValue(
        text: filteredValue,
        selection: TextSelection.collapsed(offset: filteredValue.length),
      );
    }

    // Debounce the check
    if (_debounceTimer?.isActive ?? false) _debounceTimer!.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      if (filteredValue.length >= USERNAME_MIN_LENGTH &&
          filteredValue != _currentUsername &&
          RegExp(USERNAME_REGEX).hasMatch(filteredValue)) {
        _checkUsername();
      }
    });
  }

  Future<void> _onUsernameSubmit() async {
    if (_formKey.currentState == null ||
        !_formKey.currentState!.validate() ||
        _isUsernameTaken) {
      return;
    }

    final newUsername = _usernameController.text.trim().toLowerCase();
    if (newUsername.isEmpty || newUsername == _currentUsername) {
      return;
    }

    try {
      setState(() {
        _isChangingUsername = true;
      });

      final success =
          await ref.read(userProvider.notifier).updateUsername(newUsername);

      if (success) {
        setState(() {
          _currentUsername = newUsername;
          _isChangingUsername = false;
        });
        showToast(context, 'Pseudonyme mis à jour avec succès !',
            type: ToastificationType.success);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isChangingUsername = false;
        });
        showErrorDialog(context, getCustomError(e));
      }
    }
  }

  Future<bool> _validateImageSize(File file) async {
    final int fileSize = await file.length();
    final int maxSize = 10 * 1024 * 1024; // 10 MB in bytes

    if (fileSize > maxSize) {
      if (mounted) {
        showToast(context,
            'L\'image est trop volumineuse. La taille maximale est de 1 MB.',
            type: ToastificationType.error);
      }
      return false;
    }
    return true;
  }

  Future<void> _pickImage() async {
    final XFile? image = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80, // 80% quality
    );

    if (image != null) {
      final file = File(image.path);
      // Validate file size before setting it
      if (await _validateImageSize(file)) {
        setState(() {
          _selectedAvatar = null; // Clear any selected avatar
          _selectedFile = file;
        });
      }
    }
  }

  Future<void> _takePhoto() async {
    try {
      final XFile? photo = await _imagePicker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80, // 80% quality
      );

      if (photo != null) {
        final file = File(photo.path);
        // Validate file size before setting it
        if (await _validateImageSize(file)) {
          setState(() {
            _selectedAvatar = null; // Clear any selected avatar
            _selectedFile = file;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        showToast(context, 'Impossible d\'accéder à la caméra: ${e.toString()}',
            type: ToastificationType.error);
      }
    }
  }

  Future<void> _uploadImage() async {
    if (_selectedFile == null) {
      showToast(context, 'Veuillez sélectionner une image à téléverser.',
          type: ToastificationType.warning);
      return;
    }

    try {
      // Show loading indicator
      setState(() {
        _isUploading = true;
      });

      // Use the combined method from the service that handles everything
      final result = await _uploadImgService.processAndUploadImage(
          _selectedFile!, 'avatar');

      if (mounted) {
        setState(() {
          _isUploading = false;
          // Update the current avatar URL with the newly uploaded one
          if (result.containsKey('avatarUrl')) {
            _currentAvatarUrl = result['avatarUrl'];
          }
          _selectedFile = null;
        });
        showToast(context, 'Image téléversée avec succès',
            type: ToastificationType.success);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });

        // Handle specific error for file size
        final errorMessage = e.toString();
        if (errorMessage.contains('maximum limit')) {
          showToast(context,
              'L\'image est trop volumineuse. La taille maximale est de 10 MB.',
              type: ToastificationType.error);
        } else {
          showErrorDialog(context, getCustomError(e));
        }
      }
    }
  }

  void _selectAvatar(String avatarUrl) {
    setState(() {
      _selectedFile = null;
      _selectedAvatar = avatarUrl;
    });
  }

  Future<void> _equipSelectedAvatar() async {
    if (_selectedAvatar == null) {
      return;
    }

    try {
      setState(() {
        _isApplyingAvatar = true;
      });

      await _uploadImgService.updateSelectedDefaultAvatar(_selectedAvatar!);
      final message = 'Avatar équipé avec succès !';

      if (mounted) {
        setState(() {
          _currentAvatarUrl = _selectedAvatar!;
          _selectedAvatar = null;
          _isApplyingAvatar = false;
        });
        showToast(context, message, type: ToastificationType.success);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isApplyingAvatar = false;
        });
        showErrorDialog(context, getCustomError(e));
      }
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);
    final colorScheme = Theme.of(context).colorScheme;
    final Size size = MediaQuery.of(context).size;

    return userState.when(
      data: (user) {
        if (user == null) {
          return Center(
            child: Text(
              'Utilisateur non connecté',
              style: TextStyle(color: colorScheme.onPrimary),
            ),
          );
        }

        // Load user data if username is not set yet
        if (_currentUsername.isEmpty) {
          _loadUserData(user);
        }

        // Use a Scaffold with SingleChildScrollView to handle potential overflow
        return Scaffold(
          backgroundColor: colorScheme.primary,
          body: SafeArea(
            child: SingleChildScrollView(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 52, vertical: 16),
                child: Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      maxWidth: size.width * 0.9,
                      // Remove fixed height to allow content to determine height
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const AnimatedTitleWidget(title: 'Profil'),
                        const SizedBox(height: 34),

                        // Avatar Selection with tertiary border
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: colorScheme.tertiary,
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: AvatarSelectionWidget(
                            defaultAvatars: _defaultAvatars,
                            selectedAvatar: _selectedAvatar,
                            currentAvatarUrl: _currentAvatarUrl,
                            selectedFile: _selectedFile,
                            isDisabled: _isUploading || _isApplyingAvatar,
                            onAvatarSelected: _selectAvatar,
                            onEquipAvatar: _equipSelectedAvatar,
                            onPickImage: _pickImage,
                            onTakePhoto: _takePhoto,
                            onUploadImage: _uploadImage,
                          ),
                        ),

                        const SizedBox(height: 34),

                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: colorScheme.tertiary,
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: UsernameFormWidget(
                            formKey: _formKey,
                            usernameController: _usernameController,
                            currentUsername: _currentUsername,
                            isUsernameTaken: _isUsernameTaken,
                            isCheckingUsername: _isCheckingUsername,
                            isTypingUsername: _isTypingUsername,
                            isChangingUsername: _isChangingUsername,
                            onUsernameChanged: _handleUsernameChange,
                            onSubmit: _onUsernameSubmit,
                          ),
                        ),

                        // Add bottom padding for scrolling
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
      loading: () {
        return Container(
          color: colorScheme.primary,
          child: Center(
            child: CircularProgressIndicator(
              color: colorScheme.onPrimary,
            ),
          ),
        );
      },
      error: (error, stack) {
        return Container(
          color: colorScheme.primary,
          child: Center(
            child: Text(
              'Error: $error',
              style: TextStyle(color: colorScheme.onPrimary),
            ),
          ),
        );
      },
    );
  }
}

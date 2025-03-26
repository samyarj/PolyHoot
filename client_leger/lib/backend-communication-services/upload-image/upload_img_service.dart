import 'dart:convert';
import 'dart:io';

import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart' as path_provider;

class UploadImgService {
  static final UploadImgService _instance = UploadImgService._internal();

  factory UploadImgService() {
    return _instance;
  }

  UploadImgService._internal();

  final String baseUrl = '${Environment.serverUrl}/upload-img';

  // Maximum file size in bytes (10 MB)
  static const int MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Validates if file size is within limits
  Future<bool> validateImageSize(File file) async {
    final int fileSize = await file.length();
    return fileSize <= MAX_FILE_SIZE;
  }

  // Compressed image file with appropriate settings
  Future<File?> compressImage(File file) async {
    // Get file extension
    final String fileName = file.path.split('/').last;
    final String extension = fileName.split('.').last.toLowerCase();

    // Get directory for temporary files
    final dir = await path_provider.getTemporaryDirectory();
    final targetPath =
        p.join(dir.path, '${DateTime.now().millisecondsSinceEpoch}.$extension');

    // Compress with appropriate format based on extension
    CompressFormat format = CompressFormat.jpeg;
    if (extension == 'png') {
      format = CompressFormat.png;
    }

    try {
      // Only compress if the file is larger than a certain threshold
      final int fileSize = await file.length();
      final int compressionThreshold = 5 * 1024 * 1024; // 5 MB

      // Higher quality compression for better image fidelity
      final int quality = fileSize > compressionThreshold ? 85 : 95;

      final result = await FlutterImageCompress.compressAndGetFile(
        file.path,
        targetPath,
        quality: quality, // Increased quality
        format: format,
      );

      return result != null ? File(result.path) : null;
    } catch (e) {
      AppLogger.e('Error compressing image: ${e.toString()}');
      return null;
    }
  }

  // Process and upload image - combines validation, compression and upload
  Future<Map<String, dynamic>> processAndUploadImage(
      File file, String context) async {
    // First validate file size
    if (!await validateImageSize(file)) {
      throw Exception('Image size exceeds the maximum limit of 10 MB');
    }

    // Try to compress the image
    File? compressedFile = await compressImage(file);

    // Use compressed file if available, otherwise use original
    final fileToUpload = compressedFile ?? file;

    // Check size once more after compression
    if (!await validateImageSize(fileToUpload)) {
      throw Exception(
          'Image size exceeds the maximum limit of 10 MB even after compression');
    }

    // Upload the (possibly compressed) file
    return await uploadImage(fileToUpload, context);
  }

  Future<Map<String, dynamic>> uploadImage(File file, String context) async {
    try {
      // Get the current Firebase user token
      final String? token =
          await FirebaseAuth.instance.currentUser?.getIdToken();

      if (token == null) {
        throw Exception('Authentication token is missing. Please log in.');
      }

      // Create multipart request
      final uri = Uri.parse('$baseUrl?context=$context');
      final request = http.MultipartRequest('POST', uri);

      // Add authorization header
      request.headers['authorization'] = 'Bearer $token';

      // Determine file MIME type based on extension
      final String fileName = file.path.split('/').last;
      final String extension = fileName.split('.').last.toLowerCase();
      String mimeType = 'image/jpeg'; // Default

      if (extension == 'png') {
        mimeType = 'image/png';
      } else if (extension == 'gif') {
        mimeType = 'image/gif';
      }

      // Add file to request
      final multipartFile = await http.MultipartFile.fromPath(
          'image', file.path,
          contentType: MediaType.parse(mimeType));

      request.files.add(multipartFile);

      // Send the request
      final response = await request.send();
      final responseData = await response.stream.bytesToString();
      final parsedResponse = jsonDecode(responseData);

      if (response.statusCode == 200) {
        return {
          'message': parsedResponse['message'],
          'avatarUrl': parsedResponse['avatarUrl']
        };
      } else {
        throw Exception(parsedResponse['error'] ??
            parsedResponse['message'] ??
            'Failed to upload image');
      }
    } catch (e) {
      AppLogger.e('Error uploading image: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  Future<List<String>> getDefaultAvatars() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/default-avatars'));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return List<String>.from(data['avatars']);
      } else {
        throw Exception('Failed to load default avatars');
      }
    } catch (e) {
      AppLogger.e('Error getting default avatars: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  Future<String> updateSelectedDefaultAvatar(String avatarUrl) async {
    try {
      final String? token =
          await FirebaseAuth.instance.currentUser?.getIdToken();

      if (token == null) {
        throw Exception('Authentication token is missing. Please log in.');
      }

      final response = await http.post(
          Uri.parse('${Environment.serverUrl}/users/update-avatar'),
          headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer $token'
          },
          body: jsonEncode({'avatarUrl': avatarUrl}));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return data['message'];
      } else {
        throw Exception('Failed to update avatar');
      }
    } catch (e) {
      AppLogger.e('Error updating selected avatar: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  Future<String> deleteImage(String imageUrl) async {
    try {
      final String? token =
          await FirebaseAuth.instance.currentUser?.getIdToken();

      if (token == null) {
        throw Exception('Authentication token is missing. Please log in.');
      }

      final encodedUrl = Uri.encodeComponent(imageUrl);
      final response = await http.delete(
          Uri.parse('$baseUrl/delete?imageUrl=$encodedUrl'),
          headers: {'authorization': 'Bearer $token'});

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return data['message'];
      } else {
        throw Exception('Failed to delete image');
      }
    } catch (e) {
      AppLogger.e('Error deleting image: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }
}

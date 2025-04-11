import 'dart:async';
import 'package:audioplayers/audioplayers.dart';
import 'package:client_leger/classes/sound_player.dart';
import 'package:client_leger/utilities/logger.dart';

const String HOOT_SOUND_PATH = "sounds/owl.mp3";

class HootSoundPlayer {
  static final HootSoundPlayer _instance = HootSoundPlayer._internal();
  final SoundPlayer alertSoundPlayer = SoundPlayer();

  HootSoundPlayer._internal() {
    AppLogger.w("_internal SoundPlayer instance");

    if (_isInitialized) {
      AppLogger.i("SoundPlayer already initialized");
      return;
    }
    _initializePlayer();
  }

  factory HootSoundPlayer() {
    return _instance;
  }

  AudioPlayer? _audioPlayer;
  final double _volume = 1;
  bool _isInitialized = false;
  bool _isPlaying = false;
  StreamSubscription<void>? _completionSubscription;

  Future<void> _initializePlayer() async {
    try {
      _audioPlayer = AudioPlayer(playerId: 'owlPlayer');
      _isInitialized = true;
      // Setup completion listener
      _completionSubscription = _audioPlayer?.onPlayerComplete.listen((event) {
        AppLogger.i("Sound completed naturally");
        _isPlaying = false;
      });
      await _audioPlayer!.setSource(AssetSource(HOOT_SOUND_PATH));
      await _audioPlayer!.setReleaseMode(ReleaseMode.stop);
      AppLogger.i("AudioPlayer initialized successfully");
    } catch (e) {
      AppLogger.e("Failed to initialize AudioPlayer: $e");
      _isInitialized = false;
    }
  }

  Future<void> play() async {
    // Don't play if already playing
    if (_isPlaying || alertSoundPlayer.isPlaying) {
      AppLogger.i("Sound is already playing, ignoring play request");
      return;
    }

    if (!_isInitialized || _audioPlayer == null) {
      AppLogger.w("AudioPlayer not initialized, trying again...");
      await _initializePlayer();
      if (!_isInitialized || _audioPlayer == null) {
        AppLogger.e(
            "Could not initialize AudioPlayer, skipping sound playback");
        return;
      }
    }

    try {
      // Reset state and release resources before playing
      await _audioPlayer?.stop();

      _isPlaying = true;
      AppLogger.i("Playing alert sound at volume $_volume");

      await _audioPlayer?.setVolume(_volume);
      await _audioPlayer?.resume();
    } catch (e) {
      AppLogger.e("Error playing sound: $e");
      _isPlaying = false;
    }
  }

  void stop() {
    try {
      if (alertSoundPlayer.isPlaying) {
        return;
      }
      AppLogger.i("Stopping alert sound");
      _audioPlayer?.stop();
      _isPlaying = false;
    } catch (e) {
      AppLogger.e("Error stopping sound: $e");
    }
  }

  void dispose() {
    try {
      AppLogger.w("Disposing SoundPlayer");
      stop();
      _audioPlayer?.dispose();
      _audioPlayer = null;
      _isInitialized = false;
      _completionSubscription?.cancel(); // Clean up the listener
    } catch (e) {
      AppLogger.e("Error disposing SoundPlayer: $e");
    }
  }
}

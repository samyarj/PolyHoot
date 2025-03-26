import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:client_leger/utilities/logger.dart';

const String ALERT_SOUND_PATH = "sounds/alert_sound.mp3";
const double ALERT_SOUND_INTENSITY_DECREMENTATION = 0.01;
const Duration ALERT_SOUND_DECREASE_INTERVAL = Duration(milliseconds: 200);
const double DEFAULT_VOLUME = 0.5;

class SoundPlayer {
  AudioPlayer? _audioPlayer;
  Timer? _timer;
  double _volume = DEFAULT_VOLUME;
  bool _isInitialized = false;
  bool _isPlaying = false;

  SoundPlayer() {
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    try {
      _audioPlayer = AudioPlayer();
      _isInitialized = true;
      AppLogger.i("AudioPlayer initialized successfully");
    } catch (e) {
      AppLogger.e("Failed to initialize AudioPlayer: $e");
      _isInitialized = false;
    }
  }

  Future<void> play() async {
    // Don't play if already playing
    if (_isPlaying) {
      AppLogger.i("Sound is already playing, ignoring play request");
      return;
    }

    // Reset volume for new play
    _volume = DEFAULT_VOLUME;

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
      // Cancel any existing timer
      _timer?.cancel();

      // Reset state and release resources before playing
      await _audioPlayer?.stop();

      _isPlaying = true;
      AppLogger.i("Playing alert sound at volume $_volume");

      await _audioPlayer?.setSource(AssetSource(ALERT_SOUND_PATH));
      await _audioPlayer?.setVolume(_volume);
      await _audioPlayer?.resume();

      // Setup completion listener
      _audioPlayer?.onPlayerComplete.listen((event) {
        AppLogger.i("Sound completed naturally");
        _isPlaying = false;
      });

      _timer = Timer.periodic(ALERT_SOUND_DECREASE_INTERVAL, (timer) {
        _handleSoundIntensity();
      });
    } catch (e) {
      AppLogger.e("Error playing sound: $e");
      // Cancel any existing timer
      _timer?.cancel();
      _isPlaying = false;
    }
  }

  void stop() {
    try {
      AppLogger.i("Stopping alert sound");
      _audioPlayer?.stop();
      _timer?.cancel();
      _isPlaying = false;
    } catch (e) {
      AppLogger.e("Error stopping sound: $e");
    }
  }

  void _handleSoundIntensity() {
    if (_volume > ALERT_SOUND_INTENSITY_DECREMENTATION) {
      _volume -= ALERT_SOUND_INTENSITY_DECREMENTATION;
      try {
        _audioPlayer?.setVolume(_volume);
      } catch (e) {
        AppLogger.e("Error adjusting volume: $e");
        stop();
      }
    } else {
      stop();
    }
  }

  void dispose() {
    try {
      stop();
      _audioPlayer?.dispose();
      _audioPlayer = null;
      _isInitialized = false;
    } catch (e) {
      AppLogger.e("Error disposing SoundPlayer: $e");
    }
  }
}

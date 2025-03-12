import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:client_leger/utilities/logger.dart';

const String ALERT_SOUND_PATH = "sounds/alert_sound.mp3";
const double ALERT_SOUND_INTENSITY_DECREMENTATION = 0.01;
const Duration ALERT_SOUND_DECREASE_INTERVAL = Duration(milliseconds: 200);

class SoundPlayer {
  AudioPlayer? _audioPlayer;
  Timer? _timer;
  double _volume = 0.5;
  bool _isInitialized = false;

  SoundPlayer() {
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    try {
      _audioPlayer = AudioPlayer();
      _isInitialized = true;
    } catch (e) {
      AppLogger.e("Failed to initialize AudioPlayer: $e");
      _isInitialized = false;
    }
  }

  Future<void> play() async {
    if (!_isInitialized) {
      AppLogger.w("AudioPlayer not initialized, trying again...");
      await _initializePlayer();
      if (!_isInitialized) {
        AppLogger.e(
            "Could not initialize AudioPlayer, skipping sound playback");
        return;
      }
    }

    try {
      await _audioPlayer?.setSource(AssetSource(ALERT_SOUND_PATH));
      await _audioPlayer?.setVolume(_volume);
      await _audioPlayer?.resume();

      _timer = Timer.periodic(ALERT_SOUND_DECREASE_INTERVAL, (timer) {
        _handleSoundIntensity();
      });
    } catch (e) {
      AppLogger.e("Error playing sound: $e");
      // Cancel any existing timer
      _timer?.cancel();
    }
  }

  void stop() {
    try {
      _audioPlayer?.stop();
      _timer?.cancel();
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
}

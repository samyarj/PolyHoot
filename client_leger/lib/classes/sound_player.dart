import 'dart:async';
import 'package:audioplayers/audioplayers.dart';
import 'package:client_leger/utilities/logger.dart';

const String ALERT_SOUND_PATH = "sounds/alert_sound.mp3";
const double ALERT_SOUND_INTENSITY_DECREMENTATION = 0.01;
const Duration ALERT_SOUND_DECREASE_INTERVAL = Duration(milliseconds: 200);
const double DEFAULT_VOLUME = 0.5;

class SoundPlayer {
  static final SoundPlayer _instance = SoundPlayer._internal();

  SoundPlayer._internal() {
    AppLogger.w("_internal SoundPlayer instance");

    if (_isInitialized) {
      AppLogger.i("SoundPlayer already initialized");
      return;
    }
    _initializePlayer();
  }

  factory SoundPlayer() {
    return _instance;
  }

  AudioPlayer? _audioPlayer;
  Timer? _timer;
  double _volume = DEFAULT_VOLUME;
  bool _isInitialized = false;
  bool isPlaying = false;
  StreamSubscription<void>? _completionSubscription;

  Future<void> _initializePlayer() async {
    try {
      _audioPlayer = AudioPlayer(playerId: 'alertPlayer');
      await _audioPlayer!.setAudioContext(AudioContext(
        android: AudioContextAndroid(
          contentType: AndroidContentType.music,
          usageType: AndroidUsageType.media,
          audioFocus: AndroidAudioFocus.none, // <- this is the key line
        ),
      ));
      _isInitialized = true;
      // Setup completion listener
      _completionSubscription = _audioPlayer?.onPlayerComplete.listen((event) {
        AppLogger.i("Sound completed naturally");
        isPlaying = false;
      });
      AppLogger.i("AudioPlayer initialized successfully");
    } catch (e) {
      AppLogger.e("Failed to initialize AudioPlayer: $e");
      _isInitialized = false;
    }
  }

  Future<void> play({String source = ALERT_SOUND_PATH}) async {
    // Don't play if already playing
    if (isPlaying) {
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

      isPlaying = true;
      AppLogger.i("Playing alert sound at volume $_volume");
      await _audioPlayer?.setSource(AssetSource(source));

      await _audioPlayer?.setVolume(_volume);
      await _audioPlayer?.resume();

      _timer = Timer.periodic(ALERT_SOUND_DECREASE_INTERVAL, (timer) {
        _handleSoundIntensity();
      });
    } catch (e) {
      AppLogger.e("Error playing sound: $e");
      // Cancel any existing timer
      _timer?.cancel();
      isPlaying = false;
    }
  }

  void stop() {
    try {
      AppLogger.i("Stopping alert sound");
      _audioPlayer?.stop();
      _timer?.cancel();
      isPlaying = false;
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
      if (isPlaying) {
        stop(); // Only stop once
      }
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

import 'dart:async';

import 'package:audioplayers/audioplayers.dart';

const String ALERT_SOUND_PATH =
    "assets/sounds/alert.mp3"; // Update with actual path
const double ALERT_SOUND_INTENSITY_DECREMENTATION = 0.01;
const Duration ALERT_SOUND_DECREASE_INTERVAL = Duration(milliseconds: 200);

class SoundPlayer {
  final AudioPlayer _audioPlayer = AudioPlayer();
  Timer? _timer;
  double _volume = 0.5;

  SoundPlayer();

  Future<void> play() async {
    await _audioPlayer.setSource(AssetSource(ALERT_SOUND_PATH));
    await _audioPlayer.setVolume(_volume);
    await _audioPlayer.resume();

    _timer = Timer.periodic(ALERT_SOUND_DECREASE_INTERVAL, (timer) {
      _handleSoundIntensity();
    });
  }

  void stop() {
    _audioPlayer.stop();
    _timer?.cancel();
  }

  void _handleSoundIntensity() {
    if (_volume > ALERT_SOUND_INTENSITY_DECREMENTATION) {
      _volume -= ALERT_SOUND_INTENSITY_DECREMENTATION;
      _audioPlayer.setVolume(_volume);
    } else {
      stop();
    }
  }
}

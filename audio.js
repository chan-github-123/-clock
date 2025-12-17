// Audio Management using Web Audio API
const Audio = {
  context: null,
  isPlaying: false,

  init() {
    // Create AudioContext on first user interaction
    const initContext = () => {
      if (!this.context) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
      }
      document.removeEventListener('click', initContext);
      document.removeEventListener('touchstart', initContext);
    };

    document.addEventListener('click', initContext);
    document.addEventListener('touchstart', initContext);
  },

  // Play alarm sound
  playAlarm() {
    if (!Settings.get('soundEnabled')) return;

    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume context if suspended
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    this.isPlaying = true;
    this.playBeeps(3);
  },

  // Play multiple beeps
  playBeeps(count, interval = 500) {
    let played = 0;

    const playNext = () => {
      if (played >= count || !this.isPlaying) {
        this.isPlaying = false;
        return;
      }

      this.beep(800, 200);
      played++;

      setTimeout(playNext, interval);
    };

    playNext();
  },

  // Single beep sound
  beep(frequency = 800, duration = 200) {
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

    // Fade in
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.context.currentTime + 0.01);

    // Fade out
    gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + duration / 1000);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration / 1000);
  },

  // Stop alarm
  stopAlarm() {
    this.isPlaying = false;
  },

  // Play click sound (for button feedback)
  click() {
    if (!Settings.get('soundEnabled')) return;
    this.beep(1000, 50);
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  Audio.init();
});

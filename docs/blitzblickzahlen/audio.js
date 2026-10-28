// Small synthesized melodies: no downloads and available offline.
export class GameAudio {
  constructor() { this.context = null; this.enabled = true; this.playing = new Set(); }

  unlock() {
    if (!this.enabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context ||= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
    } catch { /* The visual feedback also works without audio support. */ }
  }

  stop() {
    for (const oscillator of this.playing) { try { oscillator.stop(); } catch { /* Already stopped. */ } }
    this.playing.clear();
  }

  play(kind) {
    if (!this.enabled) return;
    this.unlock();
    if (!this.context || this.context.state !== 'running') return;
    this.stop();
    // Bright rising chimes and a major chord, like a cheerful arcade jackpot.
    // Each tuple contains frequency, start, duration and volume.
    const notes = kind === 'win'
      ? [
        [523.25, 0, .16, .12], [659.25, .09, .16, .12], [783.99, .18, .16, .12], [1046.5, .27, .24, .13],
        [659.25, .48, .16, .12], [783.99, .57, .16, .12], [1046.5, .66, .16, .12], [1318.51, .75, .26, .13],
        [1046.5, 1.03, .12, .12], [1318.51, 1.11, .12, .12], [1567.98, 1.19, .12, .12], [2093, 1.27, .2, .11],
        [1046.5, 1.52, .8, .075], [1318.51, 1.52, .8, .065], [1567.98, 1.52, .8, .065], [2093, 1.68, .85, .05],
      ]
      : [[880, 0, .12, .14], [1174.66, .09, .16, .13], [1567.98, .18, .2, .11]];
    const voices = kind === 'win' ? [[1, .8, 'triangle'], [2, .2, 'sine']] : [[1, 1, 'sine']];
    const start = this.context.currentTime + .01;
    for (const [frequency, offset, duration, volume] of notes) {
      for (const [harmonic, mix, type] of voices) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency * harmonic;
        gain.gain.setValueAtTime(0, start + offset);
        gain.gain.linearRampToValueAtTime(volume * mix, start + offset + .008);
        gain.gain.exponentialRampToValueAtTime(.0001, start + offset + duration);
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.onended = () => { this.playing.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        this.playing.add(oscillator);
        oscillator.start(start + offset);
        oscillator.stop(start + offset + duration + .025);
      }
    }
  }
}

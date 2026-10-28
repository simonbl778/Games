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
    // A descending brass-like "zonk", or bright chimes for a correct answer/win.
    // Each tuple contains frequency, start, duration and volume.
    const notes = kind === 'wrong'
      ? [[196, 0, .14, .12], [185, .15, .14, .12], [174.61, .30, .14, .12], [130.81, .45, .50, .15]]
      : kind === 'win'
      ? [
        [523.25, 0, .16, .12], [659.25, .09, .16, .12], [783.99, .18, .16, .12], [1046.5, .27, .24, .13],
        [659.25, .48, .16, .12], [783.99, .57, .16, .12], [1046.5, .66, .16, .12], [1318.51, .75, .26, .13],
        [1046.5, 1.03, .12, .12], [1318.51, 1.11, .12, .12], [1567.98, 1.19, .12, .12], [2093, 1.27, .2, .11],
        [1046.5, 1.52, .8, .075], [1318.51, 1.52, .8, .065], [1567.98, 1.52, .8, .065], [2093, 1.68, .85, .05],
      ]
      : [[880, 0, .12, .14], [1174.66, .09, .16, .13], [1567.98, .18, .2, .11]];
    const voices = kind === 'wrong' ? [[1, .85, 'sawtooth'], [.5, .15, 'triangle']]
      : kind === 'win' ? [[1, .8, 'triangle'], [2, .2, 'sine']] : [[1, 1, 'sine']];
    const start = this.context.currentTime + .01;
    for (const [frequency, offset, duration, volume] of notes) {
      for (const [harmonic, mix, type] of voices) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency * harmonic, start + offset);
        if (kind === 'wrong') oscillator.frequency.exponentialRampToValueAtTime(frequency * harmonic * .7, start + offset + duration);
        gain.gain.setValueAtTime(0, start + offset);
        gain.gain.linearRampToValueAtTime(volume * mix, start + offset + .008);
        gain.gain.exponentialRampToValueAtTime(.0001, start + offset + duration);
        let filter = null;
        if (kind === 'wrong') {
          filter = this.context.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 700;
          filter.Q.value = .7;
          oscillator.connect(filter);
          filter.connect(gain);
        } else oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.onended = () => { this.playing.delete(oscillator); oscillator.disconnect(); filter?.disconnect(); gain.disconnect(); };
        this.playing.add(oscillator);
        oscillator.start(start + offset);
        oscillator.stop(start + offset + duration + .025);
      }
    }
  }
}

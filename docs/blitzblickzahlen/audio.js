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
    const notes = kind === 'win'
      ? [[523.25, 0, .15], [659.25, .16, .15], [783.99, .32, .17], [1046.5, .52, .3], [783.99, .86, .15], [1046.5, 1.04, .55]]
      : [[659.25, 0, .11], [880, .12, .2]];
    const start = this.context.currentTime + .01;
    for (const [frequency, offset, duration] of notes) {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start + offset);
      gain.gain.linearRampToValueAtTime(.16, start + offset + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + offset + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.onended = () => { this.playing.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      this.playing.add(oscillator);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + duration + .025);
    }
  }
}

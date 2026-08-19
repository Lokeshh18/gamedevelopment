// SoundManager.js - Pleasant Acoustic Sound Synthesizer for Tamil Heritage Game

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Soft Wooden Strike SFX (Danda hitting Gilli)
  playWoodHit(power = 1.0) {
    if (this.muted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260 * power, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.35 * power, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Soft Wooden Flick (Flicking Gilli off Dhar pit)
  playFlick() {
    if (this.muted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  // Soft Wooden Bounce Sound (When Gilli impacts sandy ground)
  playBounce(velocity = 100) {
    if (this.muted) return;
    this.init();

    const intensity = Math.min(Math.max(velocity / 300, 0.15), 0.4);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + intensity * 60, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(intensity, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Pleasant Ceramic Pot Break Chime (Terracotta Uri shattering)
  playPotSmash() {
    if (this.muted) return;
    this.init();

    // Two pleasant ceramic resonant frequencies
    [520, 780, 1040].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.02);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + i * 0.02 + 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.02 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + i * 0.02);
      osc.stop(this.ctx.currentTime + i * 0.02 + 0.15);
    });
  }

  // Pleasant Pentatonic Victory Melody
  playVictoryJingle() {
    if (this.muted) return;
    this.init();

    // Soft pentatonic melody notes: A4 (440), C5 (523), D5 (587), E5 (659), A5 (880)
    const melody = [
      { f: 440, t: 0, d: 0.15 },
      { f: 523, t: 0.12, d: 0.15 },
      { f: 587, t: 0.24, d: 0.15 },
      { f: 659, t: 0.36, d: 0.2 },
      { f: 880, t: 0.52, d: 0.4 }
    ];

    melody.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, this.ctx.currentTime + n.t);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + n.t);
      osc.stop(this.ctx.currentTime + n.t + n.d);
    });
  }
}

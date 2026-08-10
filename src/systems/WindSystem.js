import { GAME_CONFIG } from '../data/gameConfig.js';

export class WindSystem {
  constructor() {
    this.currentWind = 0;
  }

  randomizeWind() {
    const min = GAME_CONFIG.WIND.MIN_WIND;
    const max = GAME_CONFIG.WIND.MAX_WIND;
    this.currentWind = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.currentWind;
  }

  getWind() { return this.currentWind; }
  getWindForce() { return this.currentWind * GAME_CONFIG.WIND.WIND_ACCELERATION_FACTOR; }

  getWindText() {
    if (this.currentWind === 0) return 'WIND: CALM (0 m/s)';
    if (this.currentWind > 0) return `WIND: → ${this.currentWind} m/s (TAILWIND)`;
    return `WIND: ← ${Math.abs(this.currentWind)} m/s (HEADWIND)`;
  }
}

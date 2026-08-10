import { GAME_CONFIG } from '../data/gameConfig.js';

export class ScoreSystem {
  static convertPixelsToMeters(pixelDistance) {
    if (pixelDistance <= 0) return 0;
    return Math.max(0, Math.floor(pixelDistance / GAME_CONFIG.PIXELS_PER_METER));
  }

  static calculateAttemptScore(distanceMeters, strikeBonus, potsSmashed) {
    const uriBonus = potsSmashed * GAME_CONFIG.URI.POINTS_PER_POT;
    const totalScore = distanceMeters + strikeBonus + uriBonus;
    return {
      distanceMeters,
      strikeBonus,
      potsSmashed,
      uriBonus,
      totalScore
    };
  }
}

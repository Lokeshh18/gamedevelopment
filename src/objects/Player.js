import { GAME_CONFIG } from '../data/gameConfig.js';

export class Player {
  constructor(name = 'Player 1', id = 1) {
    this.id = id;
    this.name = name;
    this.reset();
  }

  reset() {
    this.currentAttempt = 1;
    this.attempts = [];
    this.totalScore = 0;
    this.bestDistance = 0;
    this.potsSmashedTotal = 0;
  }

  recordAttempt(distanceMeters, strikeQuality, strikeBonus, potsSmashed, totalScore) {
    const attemptRecord = {
      attemptNumber: this.currentAttempt,
      distanceMeters,
      strikeQuality,
      strikeBonus,
      potsSmashed,
      totalScore
    };
    this.attempts.push(attemptRecord);
    this.totalScore += totalScore;
    if (distanceMeters > this.bestDistance) this.bestDistance = distanceMeters;
    this.potsSmashedTotal += potsSmashed;
    this.currentAttempt++;
    return attemptRecord;
  }

  isFinished() {
    return this.attempts.length >= GAME_CONFIG.ATTEMPTS_PER_PLAYER;
  }
}

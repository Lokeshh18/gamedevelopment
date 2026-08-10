// GameModes.js - Game Modes & Rules Handler

export const MODES = {
  FAR_LAUNCH: 'FAR_LAUNCH',
  POT_SMASH: 'POT_SMASH',
  TUTORIAL: 'TUTORIAL'
};

export class GameModeManager {
  constructor() {
    this.currentMode = MODES.FAR_LAUNCH;
    this.isMultiplayer = true;
    this.activePlayerIndex = 0;
    this.players = [];
    this.pots = [];
    this.groundY = 500;
  }

  initMatch(modeType, groundY, player1Name = 'Player 1', player2Name = 'Player 2', isMultiplayer = true) {
    this.currentMode = modeType;
    this.groundY = groundY;
    this.isMultiplayer = isMultiplayer;
    this.activePlayerIndex = 0;

    const initialAttempts = modeType === MODES.POT_SMASH ? 5 : 3;

    this.players = [
      {
        id: 1,
        name: player1Name || 'Player 1',
        attemptsLeft: initialAttempts,
        bestScore: 0,
        totalScore: 0,
        potsSmashed: 0,
        attemptsHistory: []
      }
    ];

    if (isMultiplayer) {
      this.players.push({
        id: 2,
        name: player2Name || 'Player 2',
        attemptsLeft: initialAttempts,
        bestScore: 0,
        totalScore: 0,
        potsSmashed: 0,
        attemptsHistory: []
      });
    }

    if (modeType === MODES.POT_SMASH) {
      this.generatePots(groundY);
    }
  }

  getCurrentPlayer() {
    return this.players[this.activePlayerIndex] || this.players[0];
  }

  recordAttempt(distance) {
    const p = this.getCurrentPlayer();
    if (!p.attemptsHistory) p.attemptsHistory = [];
    p.attemptsHistory.push(distance);

    if (distance > p.bestScore) {
      p.bestScore = distance;
    }
    p.totalScore += distance;
    p.attemptsLeft--;

    return p.attemptsLeft;
  }

  advanceTurn() {
    if (this.isMultiplayer && this.activePlayerIndex === 0) {
      this.activePlayerIndex = 1;
      // Reset pots for Player 2 if in Pot Smash mode
      if (this.currentMode === MODES.POT_SMASH) {
        this.generatePots(this.groundY);
      }
      return true; // Switched to Player 2
    }
    return false; // All turns completed
  }

  getWinner() {
    const p1 = this.players[0];
    if (!this.isMultiplayer || !this.players[1]) {
      return { winner: p1, isTie: false };
    }

    const p2 = this.players[1];

    if (this.currentMode === MODES.POT_SMASH) {
      if (p1.potsSmashed > p2.potsSmashed) return { winner: p1, isTie: false };
      if (p2.potsSmashed > p1.potsSmashed) return { winner: p2, isTie: false };
    }

    // Far Launch mode: compare Best Hit, then Total Score
    if (p1.bestScore > p2.bestScore) return { winner: p1, isTie: false };
    if (p2.bestScore > p1.bestScore) return { winner: p2, isTie: false };
    if (p1.totalScore > p2.totalScore) return { winner: p1, isTie: false };
    if (p2.totalScore > p1.totalScore) return { winner: p2, isTie: false };

    return { winner: p1, isTie: true };
  }

  generatePots(groundY) {
    this.pots = [];
    // Pots spanning from 10m up to 200m (200m = 6000px from pit x=150 => x=6150px)
    // Moderate, accessible pot height offsets (yOffset: 120px to 210px above ground)
    const potConfigs = [
      { m: 10,  x: 450,  yOffset: 120 },
      { m: 15,  x: 600,  yOffset: 140 },
      { m: 20,  x: 750,  yOffset: 160 },
      { m: 25,  x: 900,  yOffset: 130 },
      { m: 32,  x: 1110, yOffset: 170 },
      { m: 40,  x: 1350, yOffset: 150 },
      { m: 50,  x: 1650, yOffset: 190 },
      { m: 60,  x: 1950, yOffset: 160 },
      { m: 72,  x: 2310, yOffset: 200 },
      { m: 85,  x: 2700, yOffset: 170 },
      { m: 100, x: 3150, yOffset: 210 },
      { m: 115, x: 3600, yOffset: 180 },
      { m: 130, x: 4050, yOffset: 210 },
      { m: 145, x: 4500, yOffset: 170 },
      { m: 160, x: 4950, yOffset: 200 },
      { m: 175, x: 5400, yOffset: 180 },
      { m: 190, x: 5850, yOffset: 210 },
      { m: 200, x: 6150, yOffset: 190 }
    ];

    potConfigs.forEach((cfg, i) => {
      this.pots.push({
        id: i + 1,
        x: cfg.x,
        y: groundY - cfg.yOffset,
        mDist: cfg.m,
        smashed: false
      });
    });
  }

  checkPotCollisions(gilliX, gilliY) {
    let newlySmashed = null;
    const p = this.getCurrentPlayer();
    this.pots.forEach(pot => {
      if (!pot.smashed) {
        const pX = pot.renderX !== undefined ? pot.renderX : pot.x;
        const pY = pot.renderY !== undefined ? pot.renderY : pot.y;
        const dx = gilliX - pX;
        const dy = gilliY - pY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) {
          pot.smashed = true;
          p.potsSmashed++;
          p.totalScore += 100;
          newlySmashed = pot;
        }
      }
    });
    return newlySmashed;
  }
}

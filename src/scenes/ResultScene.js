import { SaveSystem } from '../systems/SaveSystem.js';
import { audioSystem } from '../systems/AudioSystem.js';

const Phaser = window.Phaser;

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.mode = data.mode || 'SINGLE_PLAYER';
    this.player1 = data.player1;
    this.player2 = data.player2;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const p1PointsEarned = this.player1.totalScore;
    const p2PointsEarned = this.player2 ? this.player2.totalScore : 0;
    const totalEarned = p1PointsEarned + p2PointsEarned;

    SaveSystem.recordScore(
      this.player1.totalScore,
      this.player1.bestDistance,
      totalEarned
    );

    audioSystem.playFanfare();

    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x3E2723, 0x3E2723, 0x1A0C08, 0x1A0C08, 1);
    bgGraphics.fillRect(0, 0, width, height);

    this.add.text(width / 2, 50, '🏆 MATCH COMPLETE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '36px',
      fontWeight: '900',
      fill: '#EEDC9A',
      stroke: '#3E2723',
      strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    if (this.mode === 'SINGLE_PLAYER') {
      this.renderSinglePlayerResult();
    } else {
      this.renderTwoPlayerResult();
    }

    const replayBtn = this.add.rectangle(width / 2 - 120, height - 60, 200, 46, 0xC85A32).setInteractive({ useHandCursor: true });
    replayBtn.setStrokeStyle(2, 0xEEDC9A);

    const replayLabel = this.add.text(width / 2 - 120, height - 60, '🔄 PLAY AGAIN', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#FFFFFF'
    }).setOrigin(0.5, 0.5);

    const menuBtn = this.add.rectangle(width / 2 + 120, height - 60, 200, 46, 0x5D4037).setInteractive({ useHandCursor: true });
    menuBtn.setStrokeStyle(2, 0xEEDC9A);

    const menuLabel = this.add.text(width / 2 + 120, height - 60, '🏠 MAIN MENU', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#FFFFFF'
    }).setOrigin(0.5, 0.5);

    replayBtn.on('pointerdown', () => {
      audioSystem.playClick();
      this.scene.start('GameScene', { mode: this.mode });
    });

    menuBtn.on('pointerdown', () => {
      audioSystem.playClick();
      this.scene.start('MenuScene');
    });
  }

  renderSinglePlayerResult() {
    const width = this.scale.width;
    const height = this.scale.height;

    const panel = this.add.rectangle(width / 2, height / 2 - 20, 520, 360, 0x2B1810).setStrokeStyle(3, 0xD4AF37);

    const title = this.add.text(width / 2, height / 2 - 160, `${this.player1.name} PERFORMANCE`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      fontWeight: '800',
      fill: '#D4AF37'
    }).setOrigin(0.5, 0.5);

    let attemptLines = this.player1.attempts.map(a =>
      `Attempt ${a.attemptNumber}:  Distance: ${a.distanceMeters}m | Hit: ${a.strikeQuality} | Score: ${a.totalScore}`
    ).join('\n\n');

    const bodyText = [
      attemptLines,
      '------------------------------------------------',
      `🏆 TOTAL SCORE: ${this.player1.totalScore}`,
      `📏 BEST DISTANCE: ${this.player1.bestDistance} m`,
      `🏺 URI POTS SMASHED: ${this.player1.potsSmashedTotal}`
    ].join('\n\n');

    const stats = this.add.text(width / 2, height / 2 - 10, bodyText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      fill: '#F7F0D4',
      align: 'center'
    }).setOrigin(0.5, 0.5);
  }

  renderTwoPlayerResult() {
    const width = this.scale.width;
    const height = this.scale.height;

    const p1Score = this.player1.totalScore;
    const p2Score = this.player2.totalScore;

    let winnerStr = 'IT IS A DRAW!';
    if (p1Score > p2Score) winnerStr = `🏆 ${this.player1.name.toUpperCase()} WINS!`;
    else if (p2Score > p1Score) winnerStr = `🏆 ${this.player2.name.toUpperCase()} WINS!`;

    const winnerBanner = this.add.text(width / 2, 110, winnerStr, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '28px',
      fontWeight: '900',
      fill: '#FFD700',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.createPlayerSummaryCard(width / 2 - 190, height / 2 + 10, this.player1, p1Score >= p2Score);
    this.createPlayerSummaryCard(width / 2 + 190, height / 2 + 10, this.player2, p2Score >= p1Score);
  }

  createPlayerSummaryCard(x, y, player, isWinner) {
    const card = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 320, 320, 0x2B1810).setStrokeStyle(
      isWinner ? 4 : 2,
      isWinner ? 0xFFD700 : 0x5D4037
    );

    const name = this.add.text(0, -120, player.name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      fontWeight: '800',
      fill: isWinner ? '#FFD700' : '#EEDC9A'
    }).setOrigin(0.5, 0.5);

    const statsText = [
      `⭐ Total Score: ${player.totalScore}`,
      `📏 Best Distance: ${player.bestDistance}m`,
      `🏺 Uri Smashed: ${player.potsSmashedTotal}`,
      '',
      `Attempt 1: ${player.attempts[0] ? player.attempts[0].totalScore : 0} pts`,
      `Attempt 2: ${player.attempts[1] ? player.attempts[1].totalScore : 0} pts`,
      `Attempt 3: ${player.attempts[2] ? player.attempts[2].totalScore : 0} pts`
    ].join('\n');

    const details = this.add.text(0, 10, statsText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fill: '#F7F0D4',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5, 0.5);

    card.add([bg, name, details]);
  }
}

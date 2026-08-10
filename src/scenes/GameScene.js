import { GAME_CONFIG } from '../data/gameConfig.js';
import { Gilli } from '../objects/Gilli.js';
import { Danda } from '../objects/Danda.js';
import { Uri } from '../objects/Uri.js';
import { Player } from '../objects/Player.js';
import { WindSystem } from '../systems/WindSystem.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { audioSystem } from '../systems/AudioSystem.js';

const Phaser = window.Phaser;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.gameMode = data.mode || 'SINGLE_PLAYER';
    this.player1 = new Player('Player 1', 1);
    this.player2 = this.gameMode === 'TWO_PLAYER' ? new Player('Player 2', 2) : null;
    this.activePlayer = this.player1;
    this.selectedDandaId = SaveSystem.getSelectedDanda();
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.groundY = height - 100;
    this.originX = 250;

    this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, height);

    this.windSystem = new WindSystem();
    this.windSystem.randomizeWind();

    this.createEnvironment();

    this.uriPots = GAME_CONFIG.URI.DISTANCES.map(m => new Uri(this, m, this.groundY));

    this.gilli = new Gilli(this, this.originX, this.groundY - 10);
    this.danda = new Danda(this, this.originX - 45, this.groundY - 35, this.selectedDandaId);

    this.gilli.onBounceCallback = () => {
      audioSystem.playBounce();
      this.createLandingDust(this.gilli.x, this.groundY);
    };

    this.gilli.onLandedCallback = () => {
      this.handleAttemptEnd();
    };

    this.aimGraphics = this.add.graphics().setDepth(12);
    this.isAiming = false;
    this.dragStart = new Phaser.Math.Vector2();
    this.dragCurrent = new Phaser.Math.Vector2();

    this.airborneTime = 0;
    this.hasStruckCurrentAttempt = false;
    this.potsSmashedCurrentAttempt = 0;

    this.setupInputHandlers();
    this.createHUD();
    this.startAttempt();
  }

  createEnvironment() {
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = this.scale.height;

    const sky = this.add.graphics();
    sky.fillGradientStyle(0x4A2518, 0x4A2518, 0x1A0C08, 0x1A0C08, 1);
    sky.fillRect(0, 0, width, height);

    for (let x = 300; x < width; x += 1200) {
      this.add.image(x, height - 160, 'gopuram_silhouette').setAlpha(0.2).setScale(1.1);
    }

    for (let x = 150; x < width; x += 450) {
      this.add.image(x, height - 180, 'palmyra_tree').setAlpha(0.45).setScale(0.85);
    }

    const ground = this.add.graphics();
    ground.fillStyle(0x3B2317, 1);
    ground.fillRect(0, this.groundY, width, height - this.groundY);
    ground.fillStyle(0xC85A32, 1);
    ground.fillRect(0, this.groundY - 4, width, 4);

    for (let m = 25; m <= 350; m += 25) {
      const x = this.originX + m * GAME_CONFIG.PIXELS_PER_METER;
      
      ground.fillStyle(0x5D4037, 1);
      ground.fillRect(x - 2, this.groundY - 30, 4, 30);

      ground.fillStyle(0xD4AF37, 1);
      ground.beginPath();
      ground.moveTo(x, this.groundY - 30);
      ground.lineTo(x + 20, this.groundY - 22);
      ground.lineTo(x, this.groundY - 14);
      ground.closePath();
      ground.fill();

      this.add.text(x, this.groundY + 10, `${m}m`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        fontWeight: '800',
        fill: '#EEDC9A'
      }).setOrigin(0.5, 0);
    }
  }

  setupInputHandlers() {
    this.input.on('pointerdown', (pointer) => {
      if (this.gilli.state === 'IDLE') {
        const dx = pointer.worldX - this.gilli.x;
        const dy = pointer.worldY - this.gilli.y;
        if (Math.sqrt(dx * dx + dy * dy) < 120) {
          this.isAiming = true;
          this.dragStart.set(pointer.worldX, pointer.worldY);
          this.dragCurrent.set(pointer.worldX, pointer.worldY);
          this.gilli.state = 'AIMING';
        }
      } else if (this.gilli.state === 'LAUNCHED' || this.gilli.state === 'AIRBORNE') {
        this.performStrike();
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isAiming) {
        this.dragCurrent.set(pointer.worldX, pointer.worldY);
      }
    });

    this.input.on('pointerup', () => {
      if (this.isAiming) {
        this.isAiming = false;
        this.executeLaunch();
      }
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gilli.state === 'LAUNCHED' || this.gilli.state === 'AIRBORNE') {
        this.performStrike();
      }
    });
  }

  executeLaunch() {
    this.aimGraphics.clear();

    const dragVector = new Phaser.Math.Vector2(
      this.dragStart.x - this.dragCurrent.x,
      this.dragStart.y - this.dragCurrent.y
    );

    const dragDist = Math.min(dragVector.length(), GAME_CONFIG.AIM.MAX_DRAG_DISTANCE);
    if (dragDist < 20) {
      this.gilli.state = 'IDLE';
      return;
    }

    const powerRatio = dragDist / GAME_CONFIG.AIM.MAX_DRAG_DISTANCE;
    const launchAngle = Math.atan2(dragVector.y, dragVector.x);

    const vx = Math.cos(launchAngle) * (GAME_CONFIG.AIM.MAX_LAUNCH_SPEED_X * powerRatio);
    const vy = Math.sin(launchAngle) * (GAME_CONFIG.AIM.MAX_LAUNCH_SPEED_Y * powerRatio);

    this.gilli.launch(Math.max(50, vx), Math.min(-180, vy));
    this.airborneTime = 0;
    this.hasStruckCurrentAttempt = false;

    audioSystem.playLaunch();
    this.showInstruction('PRESS SPACE OR TAP TO STRIKE DANDA!');
  }

  performStrike() {
    if (this.hasStruckCurrentAttempt) return;
    this.hasStruckCurrentAttempt = true;

    audioSystem.playSwing();
    this.danda.swing();

    const timingRatio = Math.max(0, 1 - Math.abs(this.airborneTime - 0.32) / 0.35);

    let quality = 'MISS';
    if (timingRatio >= GAME_CONFIG.STRIKE_TIMING.PERFECT_MIN) quality = 'PERFECT';
    else if (timingRatio >= GAME_CONFIG.STRIKE_TIMING.GOOD_MIN) quality = 'GOOD';
    else if (timingRatio >= GAME_CONFIG.STRIKE_TIMING.POOR_MIN) quality = 'POOR';

    this.lastStrikeQuality = quality;

    const speedMult = GAME_CONFIG.STRIKE_TIMING[`${quality}_SPEED_MULT` || 'MISS_SPEED_MULT'];
    const dandaMult = this.danda.getPowerMultiplier();

    if (quality !== 'MISS') {
      const strikeVx = (380 + Math.random() * 80) * speedMult * dandaMult;
      const strikeVy = (-240 - Math.random() * 60) * speedMult * dandaMult;
      this.gilli.strike(strikeVx, strikeVy);
      audioSystem.playStrike(quality);
      this.createStrikeSpark(this.gilli.x, this.gilli.y);
    } else {
      audioSystem.playStrike('MISS');
    }

    this.showTimingBadge(this.gilli.x, this.gilli.y - 40, quality);
    this.cameras.main.startFollow(this.gilli.sprite, false, 0.08, 0.08, -200, 50);
  }

  showTimingBadge(x, y, quality) {
    const colorMap = {
      PERFECT: '#FFD700',
      GOOD: '#4CAF50',
      POOR: '#FF9800',
      MISS: '#F44336'
    };

    const text = this.add.text(x, y, quality + '!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '26px',
      fontWeight: '900',
      fill: colorMap[quality] || '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5).setDepth(20);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      scale: 1.3,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy()
    });
  }

  createStrikeSpark(x, y) {
    for (let i = 0; i < 16; i++) {
      const spark = this.add.circle(x, y, Phaser.Math.Between(2, 5), 0xFFD700).setDepth(15);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(100, 300);

      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * speed * 0.3,
        y: y + Math.sin(angle) * speed * 0.3,
        alpha: 0,
        duration: 400,
        onComplete: () => spark.destroy()
      });
    }
  }

  createLandingDust(x, y) {
    for (let i = 0; i < 8; i++) {
      const dust = this.add.circle(x + Phaser.Math.Between(-10, 10), y, Phaser.Math.Between(4, 8), 0xD7B168, 0.7).setDepth(12);
      this.tweens.add({
        targets: dust,
        y: y - Phaser.Math.Between(15, 35),
        alpha: 0,
        scale: 1.5,
        duration: 600,
        onComplete: () => dust.destroy()
      });
    }
  }

  update(time, delta) {
    const deltaSec = delta / 1000;

    if (this.isAiming) {
      this.renderAimLine();
    }

    if (this.gilli.state === 'LAUNCHED' || this.gilli.state === 'AIRBORNE') {
      this.airborneTime += deltaSec;
      if (this.airborneTime > 0.1 && this.gilli.state === 'LAUNCHED') {
        this.gilli.state = 'AIRBORNE';
      }
    }

    PhysicsSystem.updateGilliTrajectory(
      this.gilli,
      deltaSec,
      this.windSystem.getWindForce(),
      this.groundY
    );

    this.gilli.updateVisuals();

    if (this.gilli.state === 'FLIGHT' || this.gilli.state === 'BOUNCING') {
      this.uriPots.forEach(pot => {
        if (pot.checkCollision(this.gilli)) {
          this.potsSmashedCurrentAttempt++;
          audioSystem.playUriSmash();
        }
      });
    }

    this.uriPots.forEach(pot => pot.update(deltaSec));

    const currentDistPx = Math.max(0, this.gilli.x - this.originX);
    const liveMeters = ScoreSystem.convertPixelsToMeters(currentDistPx);
    this.updateHUD(liveMeters);
  }

  renderAimLine() {
    this.aimGraphics.clear();

    const dragVec = new Phaser.Math.Vector2(
      this.dragStart.x - this.dragCurrent.x,
      this.dragStart.y - this.dragCurrent.y
    );
    const dist = Math.min(dragVec.length(), GAME_CONFIG.AIM.MAX_DRAG_DISTANCE);
    if (dist < 15) return;

    const angle = Math.atan2(dragVec.y, dragVec.x);
    const endX = this.gilli.x + Math.cos(angle) * dist * 1.2;
    const endY = this.gilli.y + Math.sin(angle) * dist * 1.2;

    this.aimGraphics.lineStyle(4, 0xFFD700, 0.9);
    this.aimGraphics.beginPath();
    this.aimGraphics.moveTo(this.gilli.x, this.gilli.y);
    this.aimGraphics.lineTo(endX, endY);
    this.aimGraphics.strokePath();

    this.aimGraphics.fillStyle(0xC85A32, 1);
    this.aimGraphics.fillCircle(endX, endY, 6);
  }

  handleAttemptEnd() {
    const finalDistPx = Math.max(0, this.gilli.x - this.originX);
    const finalMeters = ScoreSystem.convertPixelsToMeters(finalDistPx);
    const quality = this.lastStrikeQuality || 'MISS';
    const strikeBonus = GAME_CONFIG.STRIKE_TIMING[`${quality}_BONUS_PTS`] || 0;

    const attemptResult = ScoreSystem.calculateAttemptScore(
      finalMeters,
      strikeBonus,
      this.potsSmashedCurrentAttempt
    );

    this.activePlayer.recordAttempt(
      finalMeters,
      quality,
      strikeBonus,
      this.potsSmashedCurrentAttempt,
      attemptResult.totalScore
    );

    this.showAttemptResultModal(attemptResult);
  }

  showAttemptResultModal(result) {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.stopFollow();
    this.cameras.main.pan(this.originX + 200, height / 2, 800, 'Power2');

    const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);

    const bgDim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    const card = this.add.rectangle(width / 2, height / 2, 420, 360, 0x2B1810).setStrokeStyle(3, 0xD4AF37);

    const titleText = `${this.activePlayer.name} — ATTEMPT ${this.activePlayer.currentAttempt - 1} COMPLETE`;
    const title = this.add.text(width / 2, height / 2 - 140, titleText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#EEDC9A'
    }).setOrigin(0.5, 0.5);

    const breakdownText = [
      `📏 Distance Travelled: ${result.distanceMeters} m`,
      `🎯 Timing Quality: ${this.lastStrikeQuality || 'MISS'} (+${result.strikeBonus} pts)`,
      `🏺 Uri Pots Smashed: ${result.potsSmashed} (+${result.uriBonus} pts)`,
      `---------------------------------------`,
      `⭐ ATTEMPT SCORE: ${result.totalScore} POINTS`
    ].join('\n\n');

    const breakdown = this.add.text(width / 2, height / 2 - 10, breakdownText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      fill: '#F7F0D4',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    const nextBtn = this.add.rectangle(width / 2, height / 2 + 130, 240, 44, 0xC85A32).setInteractive({ useHandCursor: true });
    nextBtn.setStrokeStyle(2, 0xEEDC9A);

    const isPlayerFinished = this.activePlayer.isFinished();
    const btnLabelText = isPlayerFinished
      ? (this.gameMode === 'TWO_PLAYER' && this.activePlayer.id === 1 ? 'PASS TO PLAYER 2 →' : 'SEE FINAL MATCH RESULT 🏆')
      : 'NEXT ATTEMPT →';

    const btnText = this.add.text(width / 2, height / 2 + 130, btnLabelText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontWeight: '800',
      fill: '#F7F0D4'
    }).setOrigin(0.5, 0.5);

    overlay.add([bgDim, card, title, breakdown, nextBtn, btnText]);

    nextBtn.on('pointerdown', () => {
      audioSystem.playClick();
      overlay.destroy();

      if (isPlayerFinished) {
        if (this.gameMode === 'TWO_PLAYER' && this.activePlayer.id === 1) {
          this.activePlayer = this.player2;
          this.startAttempt();
        } else {
          this.scene.start('ResultScene', {
            mode: this.gameMode,
            player1: this.player1,
            player2: this.player2
          });
        }
      } else {
        this.startAttempt();
      }
    });
  }

  startAttempt() {
    this.windSystem.randomizeWind();
    this.gilli.reset(this.originX, this.groundY - 10);
    this.danda.setPosition(this.originX - 45, this.groundY - 35);
    this.lastStrikeQuality = null;
    this.potsSmashedCurrentAttempt = 0;

    this.uriPots.forEach(pot => pot.reset());

    this.cameras.main.stopFollow();
    this.cameras.main.scrollX = 0;

    this.showInstruction('CLICK & DRAG BACKWARDS ON GILLI TO AIM');
  }

  showInstruction(msg) {
    if (this.instrText) this.instrText.destroy();
    this.instrText = this.add.text(this.scale.width / 2, 110, msg, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(20);

    this.tweens.add({
      targets: this.instrText,
      alpha: { from: 1, to: 0.3 },
      duration: 1500,
      yoyo: true,
      repeat: 2
    });
  }

  createHUD() {
    const width = this.scale.width;

    this.hudContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(25);

    const bar = this.add.rectangle(width / 2, 28, width - 40, 46, 0x1A0C08, 0.85);
    bar.setStrokeStyle(2, 0xD4AF37, 0.6);

    this.hudPlayerText = this.add.text(40, 28, `${this.activePlayer.name}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#EEDC9A'
    }).setOrigin(0, 0.5);

    this.hudAttemptText = this.add.text(width / 2, 28, `ATTEMPT 1 / ${GAME_CONFIG.ATTEMPTS_PER_PLAYER}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#C85A32'
    }).setOrigin(0.5, 0.5);

    this.hudDistText = this.add.text(width - 40, 28, `0 m`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      fontWeight: '900',
      fill: '#FFD700'
    }).setOrigin(1, 0.5);

    this.hudWindText = this.add.text(40, this.scale.height - 30, this.windSystem.getWindText(), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      fill: '#F7F0D4',
      backgroundColor: '#1A0C08',
      padding: { x: 10, y: 6 }
    }).setOrigin(0, 0.5);

    this.hudScoreText = this.add.text(width - 40, this.scale.height - 30, `SCORE: 0`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#EEDC9A',
      backgroundColor: '#1A0C08',
      padding: { x: 10, y: 6 }
    }).setOrigin(1, 0.5);

    this.strikeBtn = this.add.rectangle(width / 2, this.scale.height - 40, 160, 48, 0xC85A32).setInteractive({ useHandCursor: true });
    this.strikeBtn.setStrokeStyle(2, 0xFFD700);
    this.strikeBtnLabel = this.add.text(width / 2, this.scale.height - 40, '⚡ STRIKE (SPACE)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontWeight: '800',
      fill: '#FFFFFF'
    }).setOrigin(0.5, 0.5);

    this.strikeBtn.on('pointerdown', () => {
      if (this.gilli.state === 'LAUNCHED' || this.gilli.state === 'AIRBORNE') {
        this.performStrike();
      }
    });

    this.hudContainer.add([
      bar,
      this.hudPlayerText,
      this.hudAttemptText,
      this.hudDistText,
      this.hudWindText,
      this.hudScoreText,
      this.strikeBtn,
      this.strikeBtnLabel
    ]);
  }

  updateHUD(currentDistanceMeters) {
    this.hudPlayerText.setText(`${this.activePlayer.name}`);
    this.hudAttemptText.setText(`ATTEMPT ${Math.min(3, this.activePlayer.currentAttempt)} / ${GAME_CONFIG.ATTEMPTS_PER_PLAYER}`);
    this.hudDistText.setText(`${currentDistanceMeters} m`);
    this.hudWindText.setText(this.windSystem.getWindText());
    this.hudScoreText.setText(`SCORE: ${this.activePlayer.totalScore}`);
  }
}

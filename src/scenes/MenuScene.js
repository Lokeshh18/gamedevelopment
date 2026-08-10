import { SaveSystem } from '../systems/SaveSystem.js';
import { audioSystem } from '../systems/AudioSystem.js';

const Phaser = window.Phaser;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.saveData = SaveSystem.load();

    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x3E2723, 0x3E2723, 0x1A0C08, 0x1A0C08, 1);
    bgGraphics.fillRect(0, 0, width, height);

    this.add.image(180, height - 120, 'gopuram_silhouette').setAlpha(0.25).setScale(1.2);
    this.add.image(width - 180, height - 120, 'gopuram_silhouette').setAlpha(0.25).setScale(1.2);
    this.add.image(60, height - 150, 'palmyra_tree').setAlpha(0.4).setScale(0.9);
    this.add.image(width - 60, height - 150, 'palmyra_tree').setAlpha(0.4).setScale(0.9);

    const ground = this.add.graphics();
    ground.fillStyle(0x2B1810, 1);
    ground.fillRect(0, height - 60, width, 60);
    ground.fillStyle(0xC85A32, 1);
    ground.fillRect(0, height - 64, width, 4);

    this.add.rectangle(width / 2, 20, width, 6, 0xD4AF37);

    this.add.text(width / 2, 85, '🪵 GILLI DANDA', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '48px',
      fontWeight: '900',
      fill: '#EEDC9A',
      stroke: '#3E2723',
      strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 135, 'HERITAGE STRIKE • கிட்டிப்புள் / கில்லி தண்டு', {
      fontFamily: 'Noto Sans Tamil, Outfit, sans-serif',
      fontSize: '20px',
      fontWeight: '700',
      fill: '#C85A32',
      stroke: '#1A0C08',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 175, `🏆 BEST DISTANCE: ${this.saveData.bestDistance}m  |  POINTS: 🪙 ${this.saveData.totalPoints}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      fill: '#D4AF37'
    }).setOrigin(0.5, 0.5);

    this.createMenuButton(width / 2, 235, 'PLAY SINGLE PLAYER', '#C85A32', () => {
      audioSystem.playClick();
      this.scene.start('GameScene', { mode: 'SINGLE_PLAYER' });
    });

    this.createMenuButton(width / 2, 295, 'LOCAL 2-PLAYER MATCH', '#8E3414', () => {
      audioSystem.playClick();
      this.scene.start('GameScene', { mode: 'TWO_PLAYER' });
    });

    this.createMenuButton(width / 2, 355, '🪵 DANDA SHOP', '#5D4037', () => {
      audioSystem.playClick();
      this.scene.start('ShopScene');
    });

    this.createMenuButton(width / 2, 415, '🏛️ HERITAGE & RULES', '#3E2723', () => {
      audioSystem.playClick();
      this.scene.start('HeritageScene');
    });

    this.createMenuButton(width / 2, 475, '❓ HOW TO PLAY', '#2E7D32', () => {
      audioSystem.playClick();
      this.showHowToPlayModal();
    });

    this.muteBtn = this.add.text(width - 40, 40, audioSystem.muted ? '🔇' : '🔊', {
      fontSize: '28px'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    this.muteBtn.on('pointerdown', () => {
      const isMuted = audioSystem.toggleMute();
      this.muteBtn.setText(isMuted ? '🔇' : '🔊');
    });
  }

  createMenuButton(x, y, labelText, bgColorHex, onClick) {
    const btnWidth = 320;
    const btnHeight = 46;
    const container = this.add.container(x, y);

    const shadow = this.add.rectangle(2, 4, btnWidth, btnHeight, 0x000000, 0.4).setOrigin(0.5, 0.5);
    const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, Phaser.Display.Color.HexStringToColor(bgColorHex).color).setOrigin(0.5, 0.5);
    bg.setStrokeStyle(2, 0xEEDC9A, 0.8);

    const text = this.add.text(0, 0, labelText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#F7F0D4'
    }).setOrigin(0.5, 0.5);

    container.add([shadow, bg, text]);
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setScale(1.04);
      text.setStyle({ fill: '#FFD700' });
    });

    bg.on('pointerout', () => {
      bg.setScale(1.0);
      text.setStyle({ fill: '#F7F0D4' });
    });

    bg.on('pointerdown', onClick);

    return container;
  }

  showHowToPlayModal() {
    const width = this.scale.width;
    const height = this.scale.height;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setInteractive();
    const panel = this.add.rectangle(width / 2, height / 2, 700, 480, 0x2B1810).setStrokeStyle(4, 0xD4AF37);

    const title = this.add.text(width / 2, height / 2 - 200, '📖 HOW TO PLAY GILLI DANDA', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      fontWeight: '900',
      fill: '#EEDC9A'
    }).setOrigin(0.5, 0.5);

    const instructions = [
      '1. STAGE 1 — AIM & LAUNCH:',
      '   Click and drag backwards on the Gilli. Release to flick it into the air!',
      '',
      '2. STAGE 2 — AIRBORNE STRIKE:',
      '   When Gilli is airborne, press SPACE (or click STRIKE) at peak height!',
      '   Timing affects hit quality: PERFECT → GOOD → POOR → MISS.',
      '',
      '3. TARGETS & WIND:',
      '   Smash hanging terracotta Uri pots (+25 pts each) along the field.',
      '   Watch out for Headwind (←) and Tailwind (→) vectors!',
      '',
      '4. 3 ATTEMPTS PER PLAYER:',
      '   Accumulate total distance score & smash pots across 3 attempts to win!'
    ].join('\n');

    const bodyText = this.add.text(width / 2, height / 2 - 20, instructions, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      lineSpacing: 4,
      fill: '#F7F0D4'
    }).setOrigin(0.5, 0.5);

    const closeBtn = this.add.text(width / 2, height / 2 + 190, '[ CLOSE TUTORIAL ]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#C85A32'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      audioSystem.playClick();
      overlay.destroy();
      panel.destroy();
      title.destroy();
      bodyText.destroy();
      closeBtn.destroy();
    });
  }
}

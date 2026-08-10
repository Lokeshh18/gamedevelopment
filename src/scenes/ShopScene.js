import { DANDAS } from '../data/dandas.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { audioSystem } from '../systems/AudioSystem.js';

const Phaser = window.Phaser;

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.saveData = SaveSystem.load();

    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x3E2723, 0x3E2723, 0x1A0C08, 0x1A0C08, 1);
    bgGraphics.fillRect(0, 0, width, height);

    this.add.text(width / 2, 45, '🪵 DANDA SHOP — POUCH & EQUIPMENT', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '32px',
      fontWeight: '900',
      fill: '#EEDC9A',
      stroke: '#3E2723',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.pointsText = this.add.text(width / 2, 85, `YOUR BALANCE: 🪙 ${this.saveData.totalPoints} POINTS`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      fontWeight: '800',
      fill: '#D4AF37'
    }).setOrigin(0.5, 0.5);

    const cardWidth = 260;
    const cardHeight = 360;
    const startX = (width - (4 * cardWidth + 3 * 30)) / 2 + cardWidth / 2;
    const cardY = 320;

    DANDAS.forEach((danda, idx) => {
      const cardX = startX + idx * (cardWidth + 30);
      this.createDandaCard(cardX, cardY, cardWidth, cardHeight, danda);
    });

    const backBtn = this.add.rectangle(width / 2, height - 45, 200, 44, 0xC85A32).setInteractive({ useHandCursor: true });
    backBtn.setStrokeStyle(2, 0xEEDC9A);

    const backLabel = this.add.text(width / 2, height - 45, '← MAIN MENU', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#F7F0D4'
    }).setOrigin(0.5, 0.5);

    backBtn.on('pointerdown', () => {
      audioSystem.playClick();
      this.scene.start('MenuScene');
    });
  }

  createDandaCard(x, y, w, h, danda) {
    const isUnlocked = this.saveData.unlockedDandas.includes(danda.id);
    const isEquipped = this.saveData.selectedDanda === danda.id;

    const card = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, h, isEquipped ? 0x4A2D1F : 0x2B1810).setStrokeStyle(
      isEquipped ? 4 : 2,
      isEquipped ? 0xFFD700 : (isUnlocked ? 0xC85A32 : 0x5D4037)
    );

    const sprite = this.add.image(0, -90, `danda_${danda.id}`).setScale(1.2).setAngle(45);

    const title = this.add.text(0, -20, danda.name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontWeight: '800',
      fill: '#EEDC9A'
    }).setOrigin(0.5, 0.5);

    const tamilTitle = this.add.text(0, 5, danda.tamilName, {
      fontFamily: 'Noto Sans Tamil, sans-serif',
      fontSize: '14px',
      fill: '#C85A32'
    }).setOrigin(0.5, 0.5);

    const powerText = this.add.text(0, 35, `POWER: ×${danda.powerMultiplier.toFixed(2)}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontWeight: '800',
      fill: '#4CAF50'
    }).setOrigin(0.5, 0.5);

    const desc = this.add.text(0, 75, danda.description, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fill: '#F7F0D4',
      align: 'center',
      wordWrap: { width: w - 30 }
    }).setOrigin(0.5, 0.5);

    let btnColor = 0xC85A32;
    let btnTextStr = `UNLOCK (${danda.cost} pts)`;

    if (isEquipped) {
      btnColor = 0x2E7D32;
      btnTextStr = '✓ EQUIPPED';
    } else if (isUnlocked) {
      btnColor = 0x8E3414;
      btnTextStr = 'EQUIP';
    }

    const btn = this.add.rectangle(0, 140, w - 40, 36, btnColor);
    if (!isEquipped) btn.setInteractive({ useHandCursor: true });

    const btnLabel = this.add.text(0, 140, btnTextStr, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      fontWeight: '800',
      fill: '#FFFFFF'
    }).setOrigin(0.5, 0.5);

    card.add([bg, sprite, title, tamilTitle, powerText, desc, btn, btnLabel]);

    if (!isEquipped) {
      btn.on('pointerdown', () => {
        audioSystem.playClick();
        if (isUnlocked) {
          SaveSystem.setSelectedDanda(danda.id);
          this.scene.restart();
        } else {
          const success = SaveSystem.unlockDanda(danda.id, danda.cost);
          if (success) {
            audioSystem.playFanfare();
            this.scene.restart();
          } else {
            this.pointsText.setStyle({ fill: '#F44336' });
            this.time.delayedCall(1000, () => this.pointsText.setStyle({ fill: '#D4AF37' }));
          }
        }
      });
    }
  }
}

import { HERITAGE_DATA } from '../data/heritageData.js';
import { audioSystem } from '../systems/AudioSystem.js';

const Phaser = window.Phaser;

export class HeritageScene extends Phaser.Scene {
  constructor() {
    super('HeritageScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x3E2723, 0x3E2723, 0x1A0C08, 0x1A0C08, 1);
    bgGraphics.fillRect(0, 0, width, height);

    this.add.text(width / 2, 45, `🏛️ ${HERITAGE_DATA.title}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '30px',
      fontWeight: '900',
      fill: '#EEDC9A',
      stroke: '#3E2723',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 85, HERITAGE_DATA.tamilTitle, {
      fontFamily: 'Noto Sans Tamil, sans-serif',
      fontSize: '22px',
      fontWeight: '700',
      fill: '#C85A32'
    }).setOrigin(0.5, 0.5);

    const cardWidth = 560;
    const cardHeight = 110;
    const startY = 180;

    HERITAGE_DATA.sections.forEach((sec, idx) => {
      const cardY = startY + idx * (cardHeight + 15);
      const container = this.add.container(width / 2, cardY);

      const panel = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x2B1810).setStrokeStyle(2, 0xD4AF37, 0.7);

      const heading = this.add.text(-cardWidth / 2 + 20, -cardHeight / 2 + 15, `${sec.heading} (${sec.tamilHeading})`, {
        fontFamily: 'Noto Sans Tamil, Outfit, sans-serif',
        fontSize: '16px',
        fontWeight: '800',
        fill: '#D4AF37'
      }).setOrigin(0, 0);

      const body = this.add.text(-cardWidth / 2 + 20, -cardHeight / 2 + 42, sec.content, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        fill: '#F7F0D4',
        wordWrap: { width: cardWidth - 40 },
        lineSpacing: 2
      }).setOrigin(0, 0);

      container.add([panel, heading, body]);
    });

    const backBtn = this.add.rectangle(width / 2, height - 40, 200, 42, 0xC85A32).setInteractive({ useHandCursor: true });
    backBtn.setStrokeStyle(2, 0xEEDC9A);

    const backLabel = this.add.text(width / 2, height - 40, '← MAIN MENU', {
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
}

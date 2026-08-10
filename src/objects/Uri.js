import { GAME_CONFIG } from '../data/gameConfig.js';

export class Uri {
  constructor(scene, distanceMeters, groundY) {
    this.scene = scene;
    this.distanceMeters = distanceMeters;
    this.worldX = distanceMeters * GAME_CONFIG.PIXELS_PER_METER + 250;
    this.anchorY = groundY - 260;
    this.potY = groundY - 140;
    this.isSmashed = false;

    this.swingTime = Math.random() * 10;
    this.swingSpeed = 1.8;

    this.ropeGraphic = scene.add.graphics().setDepth(6);
    this.potSprite = scene.add.image(this.worldX, this.potY, 'uri_pot').setOrigin(0.5, 0.5).setDepth(7);

    this.label = scene.add.text(this.worldX, this.anchorY - 24, `${distanceMeters}m`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      fill: '#EEDC9A',
      stroke: '#3E2723',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5).setDepth(8);

    this.updateRope();
  }

  update(deltaSec) {
    if (this.isSmashed) return;
    this.swingTime += deltaSec * this.swingSpeed;
    const offsetX = Math.sin(this.swingTime) * 12;
    this.potSprite.setX(this.worldX + offsetX);
    this.updateRope();
  }

  updateRope() {
    this.ropeGraphic.clear();
    this.ropeGraphic.lineStyle(2, 0x8D6E63, 0.9);
    this.ropeGraphic.beginPath();
    this.ropeGraphic.moveTo(this.worldX, this.anchorY);
    this.ropeGraphic.lineTo(this.potSprite.x, this.potSprite.y - 14);
    this.ropeGraphic.strokePath();

    this.ropeGraphic.fillStyle(0x5D4037, 1);
    this.ropeGraphic.fillRect(this.worldX - 18, this.anchorY - 4, 36, 8);
  }

  checkCollision(gilli) {
    if (this.isSmashed) return false;
    const dx = gilli.x - this.potSprite.x;
    const dy = gilli.y - this.potSprite.y;
    if (Math.sqrt(dx * dx + dy * dy) < 28) {
      this.smash();
      return true;
    }
    return false;
  }

  smash() {
    if (this.isSmashed) return;
    this.isSmashed = true;
    this.potSprite.setVisible(false);
    this.ropeGraphic.clear();
    this.label.setStyle({ fill: '#4CAF50' }).setText(`💥 HIT! ${this.distanceMeters}m`);
    this.createShatterParticles();
  }

  createShatterParticles() {
    const potX = this.potSprite.x;
    const potY = this.potSprite.y;
    for (let i = 0; i < 12; i++) {
      const fragment = this.scene.add.image(potX, potY, 'clay_fragment').setDepth(8);
      fragment.setScale(window.Phaser.Math.FloatBetween(0.6, 1.3));
      const angle = window.Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = window.Phaser.Math.FloatBetween(80, 260);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 60;

      this.scene.tweens.add({
        targets: fragment,
        x: potX + vx * 0.8,
        y: potY + vy * 0.8 + 120,
        angle: window.Phaser.Math.Between(-360, 360),
        alpha: 0,
        duration: 900,
        ease: 'Quad.easeOut',
        onComplete: () => fragment.destroy()
      });
    }
  }

  reset() {
    this.isSmashed = false;
    this.potSprite.setVisible(true);
    this.potSprite.setX(this.worldX);
    this.label.setStyle({ fill: '#EEDC9A' }).setText(`${this.distanceMeters}m`);
    this.updateRope();
  }
}

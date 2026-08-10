import { DANDAS } from '../data/dandas.js';

export class Danda {
  constructor(scene, x, y, dandaId = 'bamboo') {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.dandaData = DANDAS.find(d => d.id === dandaId) || DANDAS[0];
    this.isSwinging = false;

    this.sprite = scene.add.image(x, y, `danda_${this.dandaData.id}`);
    this.sprite.setOrigin(0.15, 0.85);
    this.sprite.setDepth(9);
    this.sprite.setAngle(-25);
  }

  setDanda(dandaId) {
    this.dandaData = DANDAS.find(d => d.id === dandaId) || DANDAS[0];
    this.sprite.setTexture(`danda_${this.dandaData.id}`);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.setPosition(x, y);
  }

  swing(onComplete) {
    if (this.isSwinging) return;
    this.isSwinging = true;

    this.scene.tweens.add({
      targets: this.sprite,
      angle: { from: -65, to: 75 },
      duration: 120,
      ease: 'Cubic.easeOut',
      yoyo: true,
      hold: 40,
      onComplete: () => {
        this.sprite.setAngle(-25);
        this.isSwinging = false;
        if (onComplete) onComplete();
      }
    });
  }

  getPowerMultiplier() {
    return this.dandaData.powerMultiplier || 1.0;
  }
}

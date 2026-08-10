export class Gilli {
  constructor(scene, x, y) {
    this.scene = scene;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.state = 'IDLE';
    
    this.onBounceCallback = null;
    this.onLandedCallback = null;

    this.sprite = scene.add.image(x, y, 'gilli');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(10);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.state = 'IDLE';
    this.sprite.setPosition(x, y);
    this.sprite.setRotation(0);
    this.sprite.setVisible(true);
  }

  launch(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.state = 'LAUNCHED';
  }

  strike(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.state = 'FLIGHT';
  }

  updateVisuals() {
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setRotation(this.rotation);
  }
}

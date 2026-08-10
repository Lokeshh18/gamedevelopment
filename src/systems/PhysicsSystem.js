import { GAME_CONFIG } from '../data/gameConfig.js';

export class PhysicsSystem {
  static updateGilliTrajectory(gilli, deltaSec, windForce, groundY) {
    if (!gilli.active || gilli.state === 'IDLE' || gilli.state === 'LANDED') return;

    if (gilli.state === 'LAUNCHED' || gilli.state === 'AIRBORNE' || gilli.state === 'FLIGHT') {
      gilli.vy += GAME_CONFIG.PHYSICS.GRAVITY * deltaSec;
      gilli.vx += windForce * deltaSec;

      gilli.vx *= GAME_CONFIG.PHYSICS.AIR_DRAG_X;
      gilli.vy *= GAME_CONFIG.PHYSICS.AIR_DRAG_Y;

      const speed = Math.sqrt(gilli.vx * gilli.vx + gilli.vy * gilli.vy);
      gilli.rotation += (gilli.vx > 0 ? 1 : -1) * Math.min(speed * 0.015 * deltaSec, 0.4);
    } else if (gilli.state === 'BOUNCING' || gilli.state === 'ROLLING') {
      gilli.vx *= GAME_CONFIG.PHYSICS.GROUND_FRICTION;
      gilli.rotation += gilli.vx * 0.02 * deltaSec;
    }

    gilli.x += gilli.vx * deltaSec;
    gilli.y += gilli.vy * deltaSec;

    const gilliRadius = 8;
    if (gilli.y + gilliRadius >= groundY) {
      gilli.y = groundY - gilliRadius;

      if (Math.abs(gilli.vy) > 60 && (gilli.state === 'FLIGHT' || gilli.state === 'BOUNCING')) {
        gilli.vy = -gilli.vy * GAME_CONFIG.PHYSICS.BOUNCE_RESTITUTION;
        gilli.vx *= 0.85;
        gilli.state = 'BOUNCING';
        if (gilli.onBounceCallback) gilli.onBounceCallback();
      } else {
        gilli.vy = 0;
        if (Math.abs(gilli.vx) > GAME_CONFIG.PHYSICS.MIN_VELOCITY_STOP) {
          gilli.state = 'ROLLING';
        } else {
          gilli.vx = 0;
          gilli.state = 'LANDED';
          if (gilli.onLandedCallback) gilli.onLandedCallback();
        }
      }
    }
  }
}

// PhysicsEngine.js - 2D Gilli Danda Mechanics Engine

export const GAME_PHASES = {
  PIT_FLICK_AIM: 'PIT_FLICK_AIM',      // Phase 1: Aiming & flicking Gilli from pit (Dhar)
  AIRBORNE_TIMING: 'AIRBORNE_TIMING',  // Phase 2: Gilli in air, player timing the Danda swing
  FLIGHT_AND_ROLL: 'FLIGHT_AND_ROLL',  // Phase 3: Projectile flight, wind, bouncing, rolling
  LANDED: 'LANDED'                     // Gilli stopped on ground
};

export class PhysicsEngine {
  constructor() {
    this.gravity = 980; // pixels / sec^2
    this.groundY = 0;   // Dynamic ground level
    this.pitPos = { x: 150, y: 0 };

    this.reset();
  }

  reset(groundY = 500) {
    this.groundY = groundY;
    this.pitPos = { x: 150, y: groundY - 10 };

    this.phase = GAME_PHASES.PIT_FLICK_AIM;
    
    // Gilli state
    this.gilli = {
      x: this.pitPos.x,
      y: this.pitPos.y,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 4,
      vAngle: 0,
      length: 26,
      width: 10,
      mass: 0.2
    };

    // Danda state (Batting stick)
    this.danda = {
      x: this.pitPos.x - 30,
      y: this.pitPos.y,
      angle: -Math.PI / 6,
      swinging: false,
      swingProgress: 0
    };

    // Drag / Aim vectors
    this.aimStart = null;
    this.aimCurrent = null;
    this.flickVector = { vx: 0, vy: 0 };

    // Wind dynamics (random speed between -150 and +250)
    this.wind = (Math.random() - 0.3) * 200;

    // Flight metrics
    this.maxAltitude = 0;
    this.distanceTraveled = 0;
    this.hitPower = 0;
    this.isSweetSpotHit = false;
  }

  // Phase 1: Start aiming drag
  startAim(x, y) {
    if (this.phase !== GAME_PHASES.PIT_FLICK_AIM) return;
    this.aimStart = { x, y };
    this.aimCurrent = { x, y };
  }

  updateAim(x, y) {
    if (this.phase !== GAME_PHASES.PIT_FLICK_AIM || !this.aimStart) return;
    this.aimCurrent = { x, y };
  }

  // Release drag -> Flick Gilli airborne
  releaseFlick() {
    if (this.phase !== GAME_PHASES.PIT_FLICK_AIM || !this.aimStart || !this.aimCurrent) return false;

    const dx = this.aimStart.x - this.aimCurrent.x;
    const dy = this.aimStart.y - this.aimCurrent.y;
    const dragDist = Math.sqrt(dx * dx + dy * dy);

    if (dragDist < 15) {
      this.aimStart = null;
      this.aimCurrent = null;
      return false; // Drag too small
    }

    // Convert drag vector to flick velocity
    const speed = Math.min(dragDist * 3.5, 450);
    const angle = Math.atan2(dy, dx);

    // Gilli pops upward & gracefully hangs in air
    this.gilli.vx = Math.max(speed * Math.cos(angle), 50);
    this.gilli.vy = Math.min(speed * Math.sin(angle), -220); // Smooth float upward
    this.gilli.vAngle = 6; // Gentle spin

    this.phase = GAME_PHASES.AIRBORNE_TIMING;
    this.aimStart = null;
    this.aimCurrent = null;

    return true;
  }

  // Update Danda angle / position relative to mouse cursor
  updateDandaCursor(cursorX, cursorY) {
    if (this.phase === GAME_PHASES.AIRBORNE_TIMING) {
      const dx = cursorX - this.danda.x;
      const dy = cursorY - this.danda.y;
      this.danda.angle = Math.atan2(dy, dx);
    }
  }

  // Phase 2: Swing Danda to strike airborne Gilli
  swingDanda(powerMultiplier = 1.0) {
    if (this.phase !== GAME_PHASES.AIRBORNE_TIMING) return null;

    this.danda.swinging = true;
    this.danda.swingProgress = 0;

    // Calculate height above pit
    const heightAbovePit = this.pitPos.y - this.gilli.y;

    // Generous airborne strike zone: height between 10px and 220px
    let timingAccuracy = 0;
    if (heightAbovePit >= 10 && heightAbovePit <= 220) {
      const idealHeight = 90;
      const dev = Math.abs(heightAbovePit - idealHeight);
      timingAccuracy = Math.max(0.25, 1 - dev / 120); // 0.25 to 1.0 accuracy guaranteed
    } else {
      timingAccuracy = 0.3; // Default baseline hit so players always connect!
    }

    // Always connect strike for fun responsive feel!
    this.isSweetSpotHit = timingAccuracy > 0.7;
    const baseSpeed = 450 + timingAccuracy * 650;
    const finalSpeed = baseSpeed * powerMultiplier;

    // Strike trajectory angle (~20 to 40 degrees upward launch)
    const strikeAngle = -Math.PI * (0.15 + timingAccuracy * 0.15);

    this.gilli.vx = finalSpeed * Math.cos(strikeAngle);
    this.gilli.vy = finalSpeed * Math.sin(strikeAngle);
    this.gilli.vAngle = 16 * (1 + timingAccuracy);

    this.hitPower = finalSpeed;
    this.phase = GAME_PHASES.FLIGHT_AND_ROLL;

    return { hit: true, sweetSpot: this.isSweetSpotHit, accuracy: timingAccuracy, power: finalSpeed };
  }

  // Update physics loop step (dt = delta time in seconds)
  update(dt) {
    // Danda animation
    if (this.danda.swinging) {
      this.danda.swingProgress += dt * 8;
      if (this.danda.swingProgress >= 1) {
        this.danda.swingProgress = 1;
        this.danda.swinging = false;
      }
    }

    if (this.phase === GAME_PHASES.AIRBORNE_TIMING || this.phase === GAME_PHASES.FLIGHT_AND_ROLL) {
      // Apply gravity
      this.gilli.vy += this.gravity * dt;

      // Apply wind force
      this.gilli.vx += (this.wind * 0.2) * dt;

      // Update positions
      this.gilli.x += this.gilli.vx * dt;
      this.gilli.y += this.gilli.vy * dt;

      // Rotation spin
      this.gilli.angle += this.gilli.vAngle * dt;

      // Track max altitude
      const altitude = this.groundY - this.gilli.y;
      if (altitude > this.maxAltitude) this.maxAltitude = altitude;

      // Ground Collision & Bounce / Roll
      if (this.gilli.y >= this.groundY - 5) {
        this.gilli.y = this.groundY - 5;

        // Check if bouncing or rolling
        if (Math.abs(this.gilli.vy) > 60) {
          // Bounce event triggered
          const impactSpeed = Math.abs(this.gilli.vy);
          this.gilli.vy = -this.gilli.vy * 0.45; // Coeff of restitution
          this.gilli.vx *= 0.7; // Ground friction
          this.gilli.vAngle *= 0.6;
          return { bounced: true, velocity: impactSpeed };
        } else {
          // Rolling friction
          this.gilli.vy = 0;
          this.gilli.vx *= 0.92;
          this.gilli.vAngle *= 0.9;

          if (Math.abs(this.gilli.vx) < 5) {
            this.gilli.vx = 0;
            this.gilli.vAngle = 0;
            this.phase = GAME_PHASES.LANDED;
          }
        }
      }

      // Calculate distance from pit in meters (scale: 30 pixels = 1 meter)
      const pxDist = Math.max(0, this.gilli.x - this.pitPos.x);
      this.distanceTraveled = pxDist / 30;
    }
    return null;
  }
}

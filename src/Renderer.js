// Renderer.js - High-Performance 2D Canvas Renderer for Tamil Heritage Village

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cameraX = 0;
    this.targetCameraX = 0;
    this.width = canvas.width;
    this.height = canvas.height;

    // Particles array for impact sparks & pot fragments
    this.particles = [];

    // Environmental Wind Breeze Streaks
    this.windStreaks = [];
    for (let i = 0; i < 40; i++) {
      this.windStreaks.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * 450 + 40,
        len: Math.random() * 50 + 30,
        speed: Math.random() * 0.6 + 0.7,
        alpha: Math.random() * 0.35 + 0.15
      });
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // Camera tracking follows Gilli during flight
  updateCamera(gilliX) {
    const desiredX = gilliX - this.width * 0.3;
    this.targetCameraX = Math.max(0, desiredX);
    // Smooth camera interpolation
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.08;
  }

  addSparks(x, y, color = '#f4b41a', count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 250 + 50;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 2 + 1.5,
        color,
        size: Math.random() * 4 + 2
      });
    }
  }

  addPotFragments(x, y) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 40;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        life: 1.0,
        decay: 1.2,
        color: '#c85a28',
        size: Math.random() * 7 + 3,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10
      });
    }
  }

  updateParticles(dt, windVal = 0) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 400 * dt; // Gravity on particles
      p.life -= p.decay * dt;
      if (p.rot !== undefined) p.rot += p.vRot * dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Environmental Wind Breeze Streaks
    const windSpeed = (windVal !== 0 ? windVal : 40);
    const isTailwind = windSpeed >= 0;
    const moveX = (Math.abs(windSpeed) * 3 + 90) * (isTailwind ? 1 : -1);

    this.windStreaks.forEach(s => {
      s.x += moveX * s.speed * dt;
      const minX = this.cameraX - 200;
      const maxX = this.cameraX + this.width + 200;
      if (isTailwind && s.x > maxX) {
        s.x = minX;
        s.y = Math.random() * (this.height - 160) + 30;
      } else if (!isTailwind && s.x < minX) {
        s.x = maxX;
        s.y = Math.random() * (this.height - 160) + 30;
      }
    });
  }

  render(physics, pots = [], equippedDanda = {}, phaseInstruction = '') {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const camX = this.cameraX;
    const groundY = physics.groundY;

    // Clear Canvas
    ctx.clearRect(0, 0, w, h);

    // 1. Render Sky Background (Vibrant Blue/Golden Horizon from reference)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#4da0db');   // Clear vibrant upper sky
    skyGrad.addColorStop(0.5, '#7bc2ec'); // Soft sky blue
    skyGrad.addColorStop(0.8, '#c2e3f5'); // Light horizon mist
    skyGrad.addColorStop(1, '#f5c98b');   // Warm golden horizon glow
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Glowing Sun & Lens Flare Rings (from reference image)
    ctx.save();
    const sunX = w * 0.58;
    const sunY = groundY - 210;
    
    // Outer Sun Glow Corona
    const sunHalo = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 90);
    sunHalo.addColorStop(0, 'rgba(255, 255, 200, 0.95)');
    sunHalo.addColorStop(0.3, 'rgba(255, 235, 59, 0.5)');
    sunHalo.addColorStop(0.7, 'rgba(255, 180, 50, 0.2)');
    sunHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunHalo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
    ctx.fill();

    // Sun Disc
    ctx.fillStyle = '#fff9c4';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();

    // Lens Flare Circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(sunX - 45, sunY + 30, 10, 0, Math.PI * 2);
    ctx.arc(sunX + 60, sunY - 20, 14, 0, Math.PI * 2);
    ctx.arc(sunX + 110, sunY - 40, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Soft White Puffy Clouds (from reference image)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let c = 0; c < 6; c++) {
      const cx = ((c * 280 - camX * 0.05) % (w + 400)) - 100;
      const cy = 40 + (c % 3) * 35;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.arc(cx + 25, cy - 10, 24, 0, Math.PI * 2);
      ctx.arc(cx + 50, cy, 30, 0, Math.PI * 2);
      ctx.arc(cx + 25, cy + 8, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Parallax Distant Blue/Teal Mountain Ridges (Layer 1 - from reference image)
    ctx.save();
    ctx.translate(-camX * 0.08, 0);
    ctx.fillStyle = '#42a5f5';
    ctx.beginPath();
    ctx.moveTo(-100, groundY);
    ctx.quadraticCurveTo(w * 0.2, groundY - 180, w * 0.45, groundY - 110);
    ctx.quadraticCurveTo(w * 0.7, groundY - 220, w * 1.1, groundY - 90);
    ctx.quadraticCurveTo(w * 1.4, groundY - 190, w * 1.8, groundY);
    ctx.fill();
    ctx.restore();

    // 3. Parallax Mid Mountain Ridges (Layer 2 - Deep Blue/Teal) & Temple Gopuram
    ctx.save();
    ctx.translate(-camX * 0.18, 0);
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(-100, groundY);
    ctx.quadraticCurveTo(w * 0.15, groundY - 120, w * 0.38, groundY - 60);
    ctx.quadraticCurveTo(w * 0.65, groundY - 150, w * 0.95, groundY - 70);
    ctx.lineTo(w * 1.5, groundY);
    ctx.fill();

    // Distant Temple Gopuram Silhouette
    const gopuramX = w * 0.55;
    ctx.fillStyle = 'rgba(30, 80, 130, 0.75)';
    ctx.beginPath();
    ctx.moveTo(gopuramX - 30, groundY);
    ctx.lineTo(gopuramX - 18, groundY - 130);
    ctx.lineTo(gopuramX + 18, groundY - 130);
    ctx.lineTo(gopuramX + 30, groundY);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(gopuramX - 16 + i * 3, groundY - 130 - i * 14, 32 - i * 6, 10);
    }
    ctx.restore();

    // 4. Parallax Midground Trees & Wooden Picket Fence (Layer 3 - from reference image)
    ctx.save();
    ctx.translate(-camX * 0.35, 0);
    
    // Render Gnarled Banyan / Fruit Trees with Red Fruit (from reference image)
    for (let i = 0; i < 10; i++) {
      const tx = i * 400 - 80;
      const trH = 100 + (i % 3) * 20;

      // Curved Gnarled Brown Trunk
      ctx.fillStyle = '#5d4037';
      ctx.beginPath();
      ctx.moveTo(tx, groundY);
      ctx.quadraticCurveTo(tx - 15, groundY - trH * 0.5, tx + (i % 2 === 0 ? 15 : -10), groundY - trH);
      ctx.lineTo(tx + (i % 2 === 0 ? 30 : 5), groundY - trH);
      ctx.quadraticCurveTo(tx, groundY - trH * 0.5, tx + 18, groundY);
      ctx.fill();

      // Multi-layer Green Canopy Foliage
      const topX = tx + (i % 2 === 0 ? 22 : -2);
      const topY = groundY - trH;
      
      ctx.fillStyle = '#2e7d32'; // Dark green base
      ctx.beginPath();
      ctx.arc(topX, topY, 40, 0, Math.PI * 2);
      ctx.arc(topX - 25, topY + 10, 32, 0, Math.PI * 2);
      ctx.arc(topX + 25, topY + 10, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#43a047'; // Medium green highlight
      ctx.beginPath();
      ctx.arc(topX - 10, topY - 12, 28, 0, Math.PI * 2);
      ctx.arc(topX + 15, topY - 8, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#66bb6a'; // Bright top leaves
      ctx.beginPath();
      ctx.arc(topX, topY - 20, 20, 0, Math.PI * 2);
      ctx.fill();

      // Small Red Fruit / Apples (from reference image)
      ctx.fillStyle = '#e53935';
      const fruitOffsets = [[-15, 5], [18, 8], [-5, -15], [10, -22], [-22, -8]];
      fruitOffsets.forEach(([fx, fy]) => {
        ctx.beginPath();
        ctx.arc(topX + fx, topY + fy, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Rustic Wooden Picket Fence running along field edge (from reference image)
    const fenceWidth = camX + w + 3500;
    ctx.fillStyle = '#8d6e63'; // Wooden Post Color
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1;

    // Horizontal Rails
    ctx.fillRect(-300, groundY - 24, fenceWidth, 4);
    ctx.fillRect(-300, groundY - 12, fenceWidth, 4);

    // Vertical Pickets with Pointed Tops
    for (let f = -300; f < fenceWidth; f += 22) {
      ctx.fillStyle = (f % 44 === 0) ? '#8d6e63' : '#795548';
      ctx.beginPath();
      ctx.moveTo(f, groundY);
      ctx.lineTo(f, groundY - 30);
      ctx.lineTo(f + 4, groundY - 35); // Pointed top
      ctx.lineTo(f + 8, groundY - 30);
      ctx.lineTo(f + 8, groundY);
      ctx.fill();
      ctx.stroke();
    }

    // Lush Green Bushes lining the base of the Wooden Fence (from reference image)
    ctx.fillStyle = '#43a047';
    for (let b = -300; b < fenceWidth; b += 45) {
      const bH = 14 + (Math.abs(b) % 8);
      ctx.beginPath();
      ctx.arc(b + 12, groundY - 4, bH, 0, Math.PI * 2);
      ctx.arc(b + 28, groundY - 6, bH + 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Warm Golden Sandy Ground Terrain (from reference image)
    ctx.save();
    ctx.translate(-camX, 0);

    const groundWidth = camX + w + 3500;
    
    // Deep Earth Base
    ctx.fillStyle = '#b78103';
    ctx.fillRect(-300, groundY, groundWidth, h - groundY);

    // Rich Golden Sand Top Layer (Golden Soil from reference image)
    const earthGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 45);
    earthGrad.addColorStop(0, '#f1b742'); // Golden top sand
    earthGrad.addColorStop(0.3, '#d69727'); // Sandy clay
    earthGrad.addColorStop(1, '#9b6210'); // Deep earth
    ctx.fillStyle = earthGrad;
    ctx.fillRect(-300, groundY, groundWidth, h - groundY);

    // Vibrant Grass Tufts & Small Bushes (from reference image)
    for (let g = -200; g < groundWidth; g += 38) {
      ctx.fillStyle = (g % 2 === 0) ? '#7cb342' : '#558b2f';
      const gH = 10 + (Math.abs(g) % 6);
      ctx.beginPath();
      ctx.moveTo(g, groundY);
      ctx.lineTo(g + 4, groundY - gH);
      ctx.lineTo(g + 8, groundY);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(g + 5, groundY);
      ctx.lineTo(g + 9, groundY - gH * 0.85);
      ctx.lineTo(g + 13, groundY);
      ctx.fill();
    }

    // Small Ground Pebbles & Red/White Wild Mushrooms (from reference image)
    for (let m = 0; m < 70; m++) {
      const mx = ((m * 103) % 3200) - 200;
      const my = groundY + 12 + ((m * 31) % 45);

      // Pebbles
      ctx.fillStyle = 'rgba(100, 80, 60, 0.4)';
      ctx.beginPath();
      ctx.ellipse(mx, my, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wild Mushrooms
      if (m % 5 === 0) {
        ctx.fillStyle = '#ffffff'; // Stem
        ctx.fillRect(mx - 1, my - 6, 2, 6);
        ctx.fillStyle = '#e53935'; // Red Cap
        ctx.beginPath();
        ctx.arc(mx, my - 6, 4, Math.PI, 0);
        ctx.fill();
      }
    }

    // Traditional Kolam Art Patterns on the ground near Pit
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const kx = i * 450 + 90;
      ctx.beginPath();
      ctx.arc(kx, groundY + 22, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(kx, groundY + 22, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6. Render Gilli Pit (Dhar) with Sand Lip
    ctx.fillStyle = '#4e2d09';
    ctx.beginPath();
    ctx.ellipse(physics.pitPos.x, physics.pitPos.y + 6, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d69727';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 6. Render Terracotta Pots (Uri Smash Mode targets with Wind-Driven Pendulum Sway)
    const nowTime = Date.now() * 0.003;
    const windMag = Math.abs(physics.wind) / 20; // Scale 0 to ~15
    const windDir = physics.wind >= 0 ? 1 : -1;

    pots.forEach(pot => {
      const anchorX = pot.x;
      const anchorY = pot.y - 65;
      const ropeLen = 58;

      if (!pot.smashed) {
        // Calculate wind-driven pendulum sway
        const swayPhase = nowTime + pot.id * 1.5;
        const naturalSway = Math.sin(swayPhase) * (0.05 + windMag * 0.04);
        const windLean = windDir * (windMag * 0.08); // Sway towards wind direction
        const swayAngle = naturalSway + windLean;

        const currentPotX = anchorX + Math.sin(swayAngle) * ropeLen;
        const currentPotY = anchorY + Math.cos(swayAngle) * ropeLen;

        // Store active swaying coordinates for physics collision checks
        pot.renderX = currentPotX;
        pot.renderY = currentPotY;

        // Wooden cross-beam top
        ctx.fillStyle = '#42210e';
        ctx.fillRect(anchorX - 22, anchorY - 6, 44, 9);
        ctx.strokeStyle = '#f4b41a';
        ctx.lineWidth = 1;
        ctx.strokeRect(anchorX - 22, anchorY - 6, 44, 9);

        // Hanging Swaying Uri String
        ctx.strokeStyle = '#d4a359';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(anchorX, anchorY);
        ctx.lineTo(currentPotX, currentPotY - 18);
        ctx.stroke();

        ctx.save();
        ctx.translate(currentPotX, currentPotY);
        ctx.rotate(swayAngle * 0.4); // Subtle pot tilt

        // Hanging Traditional Rope Netting (*Uri Net*)
        ctx.strokeStyle = '#f4b41a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();

        // Terracotta Clay Pot Body (Rich 3D gradient)
        const potGrad = ctx.createRadialGradient(-5, -5, 3, 0, 0, 20);
        potGrad.addColorStop(0, '#e6683b');
        potGrad.addColorStop(0.7, '#b3421e');
        potGrad.addColorStop(1, '#66210b');

        ctx.fillStyle = potGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Decorative Yellow Garland / Rim
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-13, -18, 26, 6);

        ctx.restore();

        // Glowing Target Marker Label (e.g. 🎯 Uri #1)
        ctx.fillStyle = '#ffd700';
        ctx.font = '800 13px Outfit';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(`🎯 Uri #${pot.id}`, currentPotX, currentPotY - 32);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
      } else {
        // Render Broken Uri State (Dangling snapped ropes reacting to wind)
        const pX = pot.renderX || pot.x;
        const pY = pot.renderY || pot.y;

        ctx.strokeStyle = '#d4a359';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(anchorX, anchorY);
        ctx.lineTo(pX - 8, pY - 30);
        ctx.moveTo(anchorX, anchorY);
        ctx.lineTo(pX + 8, pY - 25);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hanging broken rim stub
        ctx.fillStyle = '#66210b';
        ctx.fillRect(pX - 10, pY - 28, 20, 5);
      }
    });

    // Render off-screen Uri target indicators if pots are ahead
    const unsmashedPots = pots.filter(p => !p.smashed);
    if (unsmashedPots.length > 0) {
      const nextPot = unsmashedPots[0];
      const screenPotX = nextPot.x - camX;
      if (screenPotX > w - 40) {
        // Draw HUD Arrow pointing right
        ctx.fillStyle = '#ffd700';
        ctx.font = '800 14px Outfit';
        ctx.fillText(`🎯 Target Pot ahead ➡ (${((nextPot.x - physics.pitPos.x) / 30).toFixed(0)}m)`, w - 210, 110);
      }
    }

    // 7. Aim Trajectory Line during Flick Phase
    if (physics.phase === 'PIT_FLICK_AIM' && physics.aimStart && physics.aimCurrent) {
      const dx = physics.aimStart.x - physics.aimCurrent.x;
      const dy = physics.aimStart.y - physics.aimCurrent.y;

      ctx.strokeStyle = '#f4b41a';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(physics.pitPos.x, physics.pitPos.y);
      ctx.lineTo(physics.pitPos.x + dx * 2, physics.pitPos.y + dy * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow Head
      ctx.fillStyle = '#f4b41a';
      ctx.beginPath();
      ctx.arc(physics.pitPos.x + dx * 2, physics.pitPos.y + dy * 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8. Airborne Strike Timing Zone Indicator & Gilli Target Circle
    if (physics.phase === 'AIRBORNE_TIMING') {
      const gX = physics.gilli.x;
      const gY = physics.gilli.y;

      // Pulsating Target Ring around Airborne Gilli
      const pulse = Math.sin(Date.now() * 0.01) * 4;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(gX, gY, 28 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Sweet-spot indicator
      ctx.strokeStyle = 'rgba(200, 90, 40, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(gX, gY, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffd700';
      ctx.font = '800 14px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('🏏 CLICK / PRESS SPACE TO STRIKE!', gX, gY - 45);
      ctx.textAlign = 'left';
    }

    // 9. Render Danda (Batting Stick)
    ctx.save();
    const dandaX = physics.danda.x;
    const dandaY = physics.danda.y;
    ctx.translate(dandaX, dandaY);

    let dandaAngle = physics.danda.angle;
    if (physics.danda.swinging) {
      // Swing arc animation
      dandaAngle += Math.sin(physics.danda.swingProgress * Math.PI) * 1.8;
    }
    ctx.rotate(dandaAngle);

    ctx.fillStyle = equippedDanda.color || '#88ab52';
    ctx.fillRect(-6, -45, 12, 55);
    ctx.strokeStyle = '#0f0a06';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -45, 12, 55);

    // Handle wrap texture
    ctx.fillStyle = '#e6c8a0';
    ctx.fillRect(-6, 2, 12, 8);
    ctx.restore();

    // 10. Render Gilli (Tapered Wooden Peg) with Dynamic Wind Effects
    const isTailwind = physics.wind >= 0;
    const absWind = Math.abs(physics.wind);

    // Dynamic Aerodynamic Wind Stream Trails around Gilli during Flight/Airborne
    if (physics.phase === 'FLIGHT_AND_ROLL' || physics.phase === 'AIRBORNE_TIMING') {
      ctx.save();
      ctx.translate(physics.gilli.x, physics.gilli.y);

      if (isTailwind) {
        // Positive Wind (Tailwind): Flowing ALONG with Gilli (Left to Right ->)
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)'; // Warm Gold
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);

        // Draw forward thrust air streams pushing along behind Gilli
        for (let wIdx = -2; wIdx <= 2; wIdx++) {
          ctx.beginPath();
          ctx.moveTo(-45, wIdx * 12);
          ctx.quadraticCurveTo(-15, wIdx * 8, 25, wIdx * 14);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      } else {
        // Negative Wind (Headwind): Pushing AGAINST Gilli (Right to Left <-)
        ctx.strokeStyle = 'rgba(100, 220, 255, 0.75)'; // Cool Cyan Resistance
        ctx.lineWidth = 2.5;

        // Draw opposing air resistance shockwave arcs pressing against the front of Gilli
        for (let wIdx = -2; wIdx <= 2; wIdx++) {
          ctx.beginPath();
          ctx.arc(20 + Math.abs(wIdx) * 6, wIdx * 10, 16, Math.PI * 0.7, Math.PI * 1.3);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(physics.gilli.x, physics.gilli.y);
    ctx.rotate(physics.gilli.angle);

    const gLen = physics.gilli.length;
    const gW = physics.gilli.width;

    ctx.fillStyle = '#e6c8a0';
    ctx.beginPath();
    ctx.moveTo(-gLen, 0);                 // Left tip
    ctx.lineTo(-gLen + 6, -gW / 2);       // Taper up
    ctx.lineTo(gLen - 6, -gW / 2);        // Top edge
    ctx.lineTo(gLen, 0);                  // Right tip
    ctx.lineTo(gLen - 6, gW / 2);         // Bottom edge
    ctx.lineTo(-gLen + 6, gW / 2);        // Taper down
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5c3016';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // 10b. Render Environmental Wind Breeze Streaks across sky and field
    ctx.save();
    this.windStreaks.forEach(s => {
      const screenX = s.x - camX;
      ctx.strokeStyle = isTailwind ? `rgba(255, 225, 140, ${s.alpha})` : `rgba(140, 220, 255, ${s.alpha + 0.1})`;
      ctx.lineWidth = isTailwind ? 1.5 : 2;
      ctx.beginPath();
      if (isTailwind) {
        ctx.moveTo(screenX, s.y);
        ctx.lineTo(screenX + s.len, s.y);
      } else {
        ctx.moveTo(screenX, s.y);
        ctx.lineTo(screenX - s.len, s.y);
      }
      ctx.stroke();
    });
    ctx.restore();

    // 11. Render Particles (Impact sparks / pot shards)
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.rot !== undefined) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    ctx.restore(); // Restore camera translation
  }
}

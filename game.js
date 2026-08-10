// ==========================================
// 🪵 Gilli Danda — Heritage Strike
// Combined Standalone Game Script
// Compatible with file:// local opening and HTTP servers
// ==========================================

// 1. GAME CONFIGURATION
const GAME_CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  WORLD_WIDTH: 8000,
  PIXELS_PER_METER: 20,
  
  ATTEMPTS_PER_PLAYER: 3,
  
  PHYSICS: {
    GRAVITY: 600,
    AIR_DRAG_X: 0.992,
    AIR_DRAG_Y: 0.998,
    BOUNCE_RESTITUTION: 0.45,
    GROUND_FRICTION: 0.92,
    MIN_VELOCITY_STOP: 8
  },

  AIM: {
    MAX_DRAG_DISTANCE: 140,
    MAX_LAUNCH_SPEED_X: 420,
    MAX_LAUNCH_SPEED_Y: 520,
    MIN_LAUNCH_POWER: 0.15
  },

  STRIKE_TIMING: {
    PERFECT_MIN: 0.82,
    GOOD_MIN: 0.58,
    POOR_MIN: 0.30,

    PERFECT_BONUS_PTS: 25,
    GOOD_BONUS_PTS: 10,
    POOR_BONUS_PTS: 0,
    MISS_BONUS_PTS: 0,

    PERFECT_SPEED_MULT: 1.45,
    GOOD_SPEED_MULT: 1.15,
    POOR_SPEED_MULT: 0.75,
    MISS_SPEED_MULT: 0.00
  },

  URI: {
    POINTS_PER_POT: 25,
    DISTANCES: [20, 45, 75, 110, 150, 195, 250, 310]
  },

  WIND: {
    MIN_WIND: -5,
    MAX_WIND: 5,
    WIND_ACCELERATION_FACTOR: 18
  }
};

// 2. DANDAS DATA
const DANDAS = [
  {
    id: 'bamboo',
    name: 'Classic Bamboo',
    tamilName: 'மூங்கில் தண்டு',
    powerMultiplier: 1.00,
    cost: 0,
    unlockedByDefault: true,
    description: 'Traditional lightweight bamboo stick. Agile and reliable for beginners.',
    woodColor: 0xCFBA70,
    accentColor: 0x8B7536,
    ringColor: 0x5D4037
  },
  {
    id: 'teakwood',
    name: 'Teakwood Striker',
    tamilName: 'தேக்கு தண்டு',
    powerMultiplier: 1.15,
    cost: 250,
    unlockedByDefault: false,
    description: 'Sturdy Tamil Nadu teakwood with enhanced density for powerful hits.',
    woodColor: 0x8D5B38,
    accentColor: 0x5A361D,
    ringColor: 0xD4AF37
  },
  {
    id: 'rosewood',
    name: 'Rosewood Champion',
    tamilName: 'ஈட்டிமர தண்டு',
    powerMultiplier: 1.30,
    cost: 500,
    unlockedByDefault: false,
    description: 'Premium dark rosewood engineered for maximum strike speed and leverage.',
    woodColor: 0x4A2322,
    accentColor: 0x2C1211,
    ringColor: 0xC0C0C0
  },
  {
    id: 'royal_brass',
    name: 'Royal Brass Rim',
    tamilName: 'பித்தளை தண்டு',
    powerMultiplier: 1.50,
    cost: 1000,
    unlockedByDefault: false,
    description: 'Ancient ceremonial Danda reinforced with engraved royal brass bands.',
    woodColor: 0x3E2723,
    accentColor: 0xD4AF37,
    ringColor: 0xFFD700
  }
];

// 3. HERITAGE DATA
const HERITAGE_DATA = {
  title: 'Gilli Danda (Kitti Pul / Killi Thandu)',
  tamilTitle: 'கிட்டிப்புள் / கில்லி தண்டு',
  subtitle: 'The Heritage & Cultural Significance of Tamil Traditional Sports',

  sections: [
    {
      heading: 'Origins & Nomenclature',
      tamilHeading: 'தோற்றமும் பெயர்களும்',
      content: `Gilli Danda is one of the oldest recorded street sports originating in the Indian subcontinent, dating back over 2,500 years to ancient Tamilakam and Vedic eras. In Tamil Nadu, it is historically known as Kitti Pul (கிட்டிப்புள்) or Killi Thandu (கில்லி தண்டு). 'Kitti' or 'Gilli' refers to the short wooden peg tapered at both ends, while 'Pul' or 'Danda' refers to the longer striking stick.`
    },
    {
      heading: 'Equipment & Crafting',
      tamilHeading: 'கருவிகள் செய்முறை',
      content: `The sport requires minimal equipment—making it historically accessible to rural youth across villages. The Danda is typically a 1.5 to 2-foot cylindrical wooden stick carved from native woods like Bamboo or Teak. The Gilli is a 4 to 5-inch wooden spindle crafted with tapered cone tips so that striking one tip flicks it into the air.`
    },
    {
      heading: 'Uri Adi Tradition',
      tamilHeading: 'உறி அடி மரபு',
      content: `Uri Adi (உறி அடி) is a vibrant traditional festival game played during Pongal (Tamil harvest festival) and Krishna Jayanthi. A terracotta pot (Uri) containing coins, turmeric, or butter is suspended from a height on a rope. Participants are blindfolded or challenged to strike the swinging pot using a long wooden pole while onlookers splash water.`
    },
    {
      heading: 'Cultural Value & Preservation',
      tamilHeading: 'பண்பாட்டு மதிப்பு',
      content: `Traditional games foster physical agility, spatial coordination, camaraderie, and strategic judgment without expensive equipment. Digital preservation through Heritage Strike aims to introduce these ancient roots to modern generations in an engaging, interactive format.`
    }
  ]
};

// 4. SAVE SYSTEM
const STORAGE_KEY = 'GILLI_DANDA_SAVE_V1';
const DEFAULT_SAVE = {
  highScore: 0,
  bestDistance: 0,
  totalPoints: 0,
  unlockedDandas: ['bamboo'],
  selectedDanda: 'bamboo',
  soundMuted: false
};

class SaveSystem {
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return { ...DEFAULT_SAVE, ...JSON.parse(data) };
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
    return { ...DEFAULT_SAVE };
  }

  static save(data) {
    try {
      const current = this.load();
      const updated = { ...current, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
      return null;
    }
  }

  static getSelectedDanda() {
    return this.load().selectedDanda || 'bamboo';
  }

  static setSelectedDanda(dandaId) {
    const save = this.load();
    save.selectedDanda = dandaId;
    this.save(save);
  }

  static unlockDanda(dandaId, cost) {
    const save = this.load();
    if (!save.unlockedDandas.includes(dandaId) && save.totalPoints >= cost) {
      save.totalPoints -= cost;
      save.unlockedDandas.push(dandaId);
      save.selectedDanda = dandaId;
      this.save(save);
      return true;
    }
    return false;
  }

  static recordScore(score, distance, pointsEarned) {
    const save = this.load();
    if (score > save.highScore) save.highScore = score;
    if (distance > save.bestDistance) save.bestDistance = distance;
    save.totalPoints += pointsEarned;
    this.save(save);
    return save;
  }
}

// 5. AUDIO SYSTEM (Web Audio API Synthesizer)
class AudioSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playLaunch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playSwing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);
    filter.Q.value = 3;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playStrike(quality = 'PERFECT') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const pitchMap = {
      PERFECT: { freq: 480, duration: 0.25, volume: 0.5 },
      GOOD: { freq: 380, duration: 0.20, volume: 0.4 },
      POOR: { freq: 260, duration: 0.18, volume: 0.3 },
      MISS: { freq: 150, duration: 0.15, volume: 0.2 }
    };
    const config = pitchMap[quality] || pitchMap.GOOD;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(config.freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + config.duration);
    gain.gain.setValueAtTime(config.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + config.duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + config.duration);
  }

  playBounce() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playUriSmash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.1;
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }
}
const audioSystem = new AudioSystem();

// 6. WIND SYSTEM
class WindSystem {
  constructor() {
    this.currentWind = 0;
  }
  randomizeWind() {
    const min = GAME_CONFIG.WIND.MIN_WIND;
    const max = GAME_CONFIG.WIND.MAX_WIND;
    this.currentWind = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.currentWind;
  }
  getWind() { return this.currentWind; }
  getWindForce() { return this.currentWind * GAME_CONFIG.WIND.WIND_ACCELERATION_FACTOR; }
  getWindText() {
    if (this.currentWind === 0) return 'WIND: CALM (0 m/s)';
    if (this.currentWind > 0) return `WIND: → ${this.currentWind} m/s (TAILWIND)`;
    return `WIND: ← ${Math.abs(this.currentWind)} m/s (HEADWIND)`;
  }
}

// 7. SCORE SYSTEM
class ScoreSystem {
  static convertPixelsToMeters(pixelDistance) {
    if (pixelDistance <= 0) return 0;
    return Math.max(0, Math.floor(pixelDistance / GAME_CONFIG.PIXELS_PER_METER));
  }
  static calculateAttemptScore(distanceMeters, strikeBonus, potsSmashed) {
    const uriBonus = potsSmashed * GAME_CONFIG.URI.POINTS_PER_POT;
    const totalScore = distanceMeters + strikeBonus + uriBonus;
    return { distanceMeters, strikeBonus, potsSmashed, uriBonus, totalScore };
  }
}

// 8. PHYSICS SYSTEM
class PhysicsSystem {
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

// 9. GAME OBJECTS
class Gilli {
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

class Danda {
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

  getPowerMultiplier() { return this.dandaData.powerMultiplier || 1.0; }
}

class Uri {
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

class Player {
  constructor(name = 'Player 1', id = 1) {
    this.id = id;
    this.name = name;
    this.reset();
  }

  reset() {
    this.currentAttempt = 1;
    this.attempts = [];
    this.totalScore = 0;
    this.bestDistance = 0;
    this.potsSmashedTotal = 0;
  }

  recordAttempt(distanceMeters, strikeQuality, strikeBonus, potsSmashed, totalScore) {
    const attemptRecord = {
      attemptNumber: this.currentAttempt,
      distanceMeters,
      strikeQuality,
      strikeBonus,
      potsSmashed,
      totalScore
    };
    this.attempts.push(attemptRecord);
    this.totalScore += totalScore;
    if (distanceMeters > this.bestDistance) this.bestDistance = distanceMeters;
    this.potsSmashedTotal += potsSmashed;
    this.currentAttempt++;
    return attemptRecord;
  }

  isFinished() { return this.attempts.length >= GAME_CONFIG.ATTEMPTS_PER_PLAYER; }
}

// 10. SCENES
// BOOT SCENE
class BootScene extends window.Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x3E2723, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 20, 320, 40, 10);

    this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: '🪵 Gilli Danda — Heritage Strike',
      style: { font: '24px Outfit, sans-serif', fill: '#EEDC9A', fontWeight: 'bold' }
    }).setOrigin(0.5, 0.5);

    this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: 'Preparing Tamil Village & Wooden Peg Assets...',
      style: { font: '14px Noto Sans Tamil, sans-serif', fill: '#C85A32' }
    }).setOrigin(0.5, 0.5);

    this.createProceduralTextures();

    progressBar.fillStyle(0xC85A32, 1);
    progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 10, 300, 20, 5);
  }

  createProceduralTextures() {
    // Gilli
    const gilliCanvas = this.textures.createCanvas('gilli', 36, 16);
    const ctxGilli = gilliCanvas.context;
    ctxGilli.fillStyle = '#D7B168';
    ctxGilli.beginPath();
    ctxGilli.moveTo(0, 8); ctxGilli.lineTo(8, 2); ctxGilli.lineTo(28, 2);
    ctxGilli.lineTo(36, 8); ctxGilli.lineTo(28, 14); ctxGilli.lineTo(8, 14);
    ctxGilli.closePath(); ctxGilli.fill();
    ctxGilli.strokeStyle = '#5D4037'; ctxGilli.lineWidth = 1.5; ctxGilli.stroke();
    ctxGilli.fillStyle = '#8B6A2B'; ctxGilli.fillRect(7, 2, 2, 12); ctxGilli.fillRect(27, 2, 2, 12);
    gilliCanvas.refresh();

    // Dandas
    const dandaConfigs = [
      { id: 'bamboo', bodyColor: '#CFBA70', darkColor: '#8B7536', bandColor: '#5D4037' },
      { id: 'teakwood', bodyColor: '#8D5B38', darkColor: '#5A361D', bandColor: '#D4AF37' },
      { id: 'rosewood', bodyColor: '#4A2322', darkColor: '#2C1211', bandColor: '#C0C0C0' },
      { id: 'royal_brass', bodyColor: '#3E2723', darkColor: '#D4AF37', bandColor: '#FFD700' }
    ];
    dandaConfigs.forEach(cfg => {
      const canvas = this.textures.createCanvas(`danda_${cfg.id}`, 24, 110);
      const ctx = canvas.context;
      ctx.fillStyle = cfg.bodyColor;
      ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(17, 0); ctx.lineTo(21, 102); ctx.lineTo(3, 102); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = cfg.darkColor; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = cfg.bandColor;
      ctx.fillRect(4, 75, 15, 6); ctx.fillRect(4, 85, 15, 6); ctx.fillRect(4, 95, 15, 6);
      canvas.refresh();
    });

    // Uri Pot
    const potCanvas = this.textures.createCanvas('uri_pot', 36, 40);
    const ctxPot = potCanvas.context;
    ctxPot.fillStyle = '#B84A28'; ctxPot.beginPath(); ctxPot.arc(18, 24, 14, 0, Math.PI * 2); ctxPot.fill();
    ctxPot.strokeStyle = '#6E250E'; ctxPot.lineWidth = 2; ctxPot.stroke();
    ctxPot.fillStyle = '#8E3414'; ctxPot.fillRect(10, 4, 16, 6);
    ctxPot.fillStyle = '#D4AF37'; ctxPot.fillRect(8, 2, 20, 4);
    ctxPot.fillStyle = '#FFFFFF'; ctxPot.beginPath(); ctxPot.arc(18, 22, 2.5, 0, Math.PI * 2); ctxPot.arc(12, 24, 2, 0, Math.PI * 2); ctxPot.arc(24, 24, 2, 0, Math.PI * 2); ctxPot.fill();
    potCanvas.refresh();

    // Clay Fragment
    const fragCanvas = this.textures.createCanvas('clay_fragment', 8, 8);
    const ctxFrag = fragCanvas.context;
    ctxFrag.fillStyle = '#A33D1C'; ctxFrag.beginPath(); ctxFrag.moveTo(1, 1); ctxFrag.lineTo(7, 2); ctxFrag.lineTo(5, 7); ctxFrag.closePath(); ctxFrag.fill();
    fragCanvas.refresh();

    // Palmyra Tree
    const treeCanvas = this.textures.createCanvas('palmyra_tree', 120, 240);
    const ctxTree = treeCanvas.context;
    ctxTree.fillStyle = '#4A3525'; ctxTree.beginPath(); ctxTree.moveTo(54, 240); ctxTree.lineTo(66, 240); ctxTree.lineTo(63, 60); ctxTree.lineTo(57, 60); ctxTree.closePath(); ctxTree.fill();
    ctxTree.strokeStyle = '#2D1F15'; ctxTree.lineWidth = 1.5;
    for (let y = 70; y < 240; y += 14) { ctxTree.beginPath(); ctxTree.arc(60, y, 5, 0, Math.PI); ctxTree.stroke(); }
    ctxTree.fillStyle = '#2E7D32';
    [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].forEach(deg => {
      const rad = deg * (Math.PI / 180);
      const ex = 60 + Math.cos(rad) * 45; const ey = 55 + Math.sin(rad) * 40;
      ctxTree.beginPath(); ctxTree.moveTo(60, 55); ctxTree.lineTo(ex, ey); ctxTree.lineWidth = 4; ctxTree.strokeStyle = '#1B5E20'; ctxTree.stroke();
    });
    treeCanvas.refresh();

    // Gopuram Silhouette
    const gopuramCanvas = this.textures.createCanvas('gopuram_silhouette', 140, 200);
    const ctxGop = gopuramCanvas.context;
    ctxGop.fillStyle = '#2C1B14';
    let w = 120, h = 22, curY = 190;
    for (let tier = 0; tier < 6; tier++) {
      ctxGop.fillRect((140 - w) / 2, curY - h, w, h);
      curY -= (h + 2); w -= 16; h -= 2;
    }
    ctxGop.fillStyle = '#D4AF37'; ctxGop.fillRect(66, curY - 12, 8, 12); ctxGop.fillRect(58, curY - 10, 6, 10); ctxGop.fillRect(76, curY - 10, 6, 10);
    gopuramCanvas.refresh();
  }

  create() { this.scene.start('MenuScene'); }
}

// MENU SCENE
class MenuScene extends window.Phaser.Scene {
  constructor() { super('MenuScene'); }

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
    ground.fillStyle(0x2B1810, 1); ground.fillRect(0, height - 60, width, 60);
    ground.fillStyle(0xC85A32, 1); ground.fillRect(0, height - 64, width, 4);

    this.add.rectangle(width / 2, 20, width, 6, 0xD4AF37);

    this.add.text(width / 2, 85, '🪵 GILLI DANDA', {
      fontFamily: 'Outfit, sans-serif', fontSize: '48px', fontWeight: '900', fill: '#EEDC9A', stroke: '#3E2723', strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 135, 'HERITAGE STRIKE • கிட்டிப்புள் / கில்லி தண்டு', {
      fontFamily: 'Noto Sans Tamil, Outfit, sans-serif', fontSize: '20px', fontWeight: '700', fill: '#C85A32', stroke: '#1A0C08', strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 175, `🏆 BEST DISTANCE: ${this.saveData.bestDistance}m  |  POINTS: 🪙 ${this.saveData.totalPoints}`, {
      fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '600', fill: '#D4AF37'
    }).setOrigin(0.5, 0.5);

    this.createMenuButton(width / 2, 235, 'PLAY SINGLE PLAYER', '#C85A32', () => {
      audioSystem.playClick(); this.scene.start('GameScene', { mode: 'SINGLE_PLAYER' });
    });

    this.createMenuButton(width / 2, 295, 'LOCAL 2-PLAYER MATCH', '#8E3414', () => {
      audioSystem.playClick(); this.scene.start('GameScene', { mode: 'TWO_PLAYER' });
    });

    this.createMenuButton(width / 2, 355, '🪵 DANDA SHOP', '#5D4037', () => {
      audioSystem.playClick(); this.scene.start('ShopScene');
    });

    this.createMenuButton(width / 2, 415, '🏛️ HERITAGE & RULES', '#3E2723', () => {
      audioSystem.playClick(); this.scene.start('HeritageScene');
    });

    this.createMenuButton(width / 2, 475, '❓ HOW TO PLAY', '#2E7D32', () => {
      audioSystem.playClick(); this.showHowToPlayModal();
    });

    this.muteBtn = this.add.text(width - 40, 40, audioSystem.muted ? '🔇' : '🔊', { fontSize: '28px' }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', () => {
      const isMuted = audioSystem.toggleMute();
      this.muteBtn.setText(isMuted ? '🔇' : '🔊');
    });
  }

  createMenuButton(x, y, labelText, bgColorHex, onClick) {
    const btnWidth = 320; const btnHeight = 46;
    const container = this.add.container(x, y);
    const shadow = this.add.rectangle(2, 4, btnWidth, btnHeight, 0x000000, 0.4).setOrigin(0.5, 0.5);
    const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, window.Phaser.Display.Color.HexStringToColor(bgColorHex).color).setOrigin(0.5, 0.5);
    bg.setStrokeStyle(2, 0xEEDC9A, 0.8);
    const text = this.add.text(0, 0, labelText, { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#F7F0D4' }).setOrigin(0.5, 0.5);

    container.add([shadow, bg, text]);
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => { bg.setScale(1.04); text.setStyle({ fill: '#FFD700' }); });
    bg.on('pointerout', () => { bg.setScale(1.0); text.setStyle({ fill: '#F7F0D4' }); });
    bg.on('pointerdown', onClick);
    return container;
  }

  showHowToPlayModal() {
    const width = this.scale.width; const height = this.scale.height;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setInteractive();
    const panel = this.add.rectangle(width / 2, height / 2, 700, 480, 0x2B1810).setStrokeStyle(4, 0xD4AF37);
    const title = this.add.text(width / 2, height / 2 - 200, '📖 HOW TO PLAY GILLI DANDA', { fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '900', fill: '#EEDC9A' }).setOrigin(0.5, 0.5);

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

    const bodyText = this.add.text(width / 2, height / 2 - 20, instructions, { fontFamily: 'Outfit, sans-serif', fontSize: '16px', lineSpacing: 4, fill: '#F7F0D4' }).setOrigin(0.5, 0.5);
    const closeBtn = this.add.text(width / 2, height / 2 + 190, '[ CLOSE TUTORIAL ]', { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#C85A32' }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      audioSystem.playClick();
      overlay.destroy(); panel.destroy(); title.destroy(); bodyText.destroy(); closeBtn.destroy();
    });
  }
}

// GAME SCENE
class GameScene extends window.Phaser.Scene {
  constructor() { super('GameScene'); }

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

    this.gilli.onLandedCallback = () => { this.handleAttemptEnd(); };

    this.aimGraphics = this.add.graphics().setDepth(12);
    this.isAiming = false;
    this.dragStart = new window.Phaser.Math.Vector2();
    this.dragCurrent = new window.Phaser.Math.Vector2();

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
    ground.fillStyle(0x3B2317, 1); ground.fillRect(0, this.groundY, width, height - this.groundY);
    ground.fillStyle(0xC85A32, 1); ground.fillRect(0, this.groundY - 4, width, 4);

    for (let m = 25; m <= 350; m += 25) {
      const x = this.originX + m * GAME_CONFIG.PIXELS_PER_METER;
      ground.fillStyle(0x5D4037, 1); ground.fillRect(x - 2, this.groundY - 30, 4, 30);
      ground.fillStyle(0xD4AF37, 1); ground.beginPath(); ground.moveTo(x, this.groundY - 30); ground.lineTo(x + 20, this.groundY - 22); ground.lineTo(x, this.groundY - 14); ground.closePath(); ground.fill();
      this.add.text(x, this.groundY + 10, `${m}m`, { fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: '800', fill: '#EEDC9A' }).setOrigin(0.5, 0);
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
      if (this.isAiming) this.dragCurrent.set(pointer.worldX, pointer.worldY);
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
    const dragVector = new window.Phaser.Math.Vector2(
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
    const colorMap = { PERFECT: '#FFD700', GOOD: '#4CAF50', POOR: '#FF9800', MISS: '#F44336' };
    const text = this.add.text(x, y, quality + '!', {
      fontFamily: 'Outfit, sans-serif', fontSize: '26px', fontWeight: '900', fill: colorMap[quality] || '#FFFFFF', stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5, 0.5).setDepth(20);

    this.tweens.add({
      targets: text, y: y - 50, alpha: 0, scale: 1.3, duration: 1000, ease: 'Quad.easeOut', onComplete: () => text.destroy()
    });
  }

  createStrikeSpark(x, y) {
    for (let i = 0; i < 16; i++) {
      const spark = this.add.circle(x, y, window.Phaser.Math.Between(2, 5), 0xFFD700).setDepth(15);
      const angle = window.Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = window.Phaser.Math.FloatBetween(100, 300);
      this.tweens.add({
        targets: spark, x: x + Math.cos(angle) * speed * 0.3, y: y + Math.sin(angle) * speed * 0.3, alpha: 0, duration: 400, onComplete: () => spark.destroy()
      });
    }
  }

  createLandingDust(x, y) {
    for (let i = 0; i < 8; i++) {
      const dust = this.add.circle(x + window.Phaser.Math.Between(-10, 10), y, window.Phaser.Math.Between(4, 8), 0xD7B168, 0.7).setDepth(12);
      this.tweens.add({
        targets: dust, y: y - window.Phaser.Math.Between(15, 35), alpha: 0, scale: 1.5, duration: 600, onComplete: () => dust.destroy()
      });
    }
  }

  update(time, delta) {
    const deltaSec = delta / 1000;
    if (this.isAiming) this.renderAimLine();

    if (this.gilli.state === 'LAUNCHED' || this.gilli.state === 'AIRBORNE') {
      this.airborneTime += deltaSec;
      if (this.airborneTime > 0.1 && this.gilli.state === 'LAUNCHED') this.gilli.state = 'AIRBORNE';
    }

    PhysicsSystem.updateGilliTrajectory(this.gilli, deltaSec, this.windSystem.getWindForce(), this.groundY);
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
    const dragVec = new window.Phaser.Math.Vector2(this.dragStart.x - this.dragCurrent.x, this.dragStart.y - this.dragCurrent.y);
    const dist = Math.min(dragVec.length(), GAME_CONFIG.AIM.MAX_DRAG_DISTANCE);
    if (dist < 15) return;

    const angle = Math.atan2(dragVec.y, dragVec.x);
    const endX = this.gilli.x + Math.cos(angle) * dist * 1.2;
    const endY = this.gilli.y + Math.sin(angle) * dist * 1.2;

    this.aimGraphics.lineStyle(4, 0xFFD700, 0.9);
    this.aimGraphics.beginPath(); this.aimGraphics.moveTo(this.gilli.x, this.gilli.y); this.aimGraphics.lineTo(endX, endY); this.aimGraphics.strokePath();
    this.aimGraphics.fillStyle(0xC85A32, 1); this.aimGraphics.fillCircle(endX, endY, 6);
  }

  handleAttemptEnd() {
    const finalDistPx = Math.max(0, this.gilli.x - this.originX);
    const finalMeters = ScoreSystem.convertPixelsToMeters(finalDistPx);
    const quality = this.lastStrikeQuality || 'MISS';
    const strikeBonus = GAME_CONFIG.STRIKE_TIMING[`${quality}_BONUS_PTS`] || 0;

    const attemptResult = ScoreSystem.calculateAttemptScore(finalMeters, strikeBonus, this.potsSmashedCurrentAttempt);
    this.activePlayer.recordAttempt(finalMeters, quality, strikeBonus, this.potsSmashedCurrentAttempt, attemptResult.totalScore);
    this.showAttemptResultModal(attemptResult);
  }

  showAttemptResultModal(result) {
    const width = this.scale.width; const height = this.scale.height;
    this.cameras.main.stopFollow();
    this.cameras.main.pan(this.originX + 200, height / 2, 800, 'Power2');

    const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(30);
    const bgDim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    const card = this.add.rectangle(width / 2, height / 2, 420, 360, 0x2B1810).setStrokeStyle(3, 0xD4AF37);

    const titleText = `${this.activePlayer.name} — ATTEMPT ${this.activePlayer.currentAttempt - 1} COMPLETE`;
    const title = this.add.text(width / 2, height / 2 - 140, titleText, { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#EEDC9A' }).setOrigin(0.5, 0.5);

    const breakdownText = [
      `📏 Distance Travelled: ${result.distanceMeters} m`,
      `🎯 Timing Quality: ${this.lastStrikeQuality || 'MISS'} (+${result.strikeBonus} pts)`,
      `🏺 Uri Pots Smashed: ${result.potsSmashed} (+${result.uriBonus} pts)`,
      `---------------------------------------`,
      `⭐ ATTEMPT SCORE: ${result.totalScore} POINTS`
    ].join('\n\n');

    const breakdown = this.add.text(width / 2, height / 2 - 10, breakdownText, { fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '600', fill: '#F7F0D4', align: 'center' }).setOrigin(0.5, 0.5);

    const nextBtn = this.add.rectangle(width / 2, height / 2 + 130, 240, 44, 0xC85A32).setInteractive({ useHandCursor: true });
    nextBtn.setStrokeStyle(2, 0xEEDC9A);

    const isPlayerFinished = this.activePlayer.isFinished();
    const btnLabelText = isPlayerFinished
      ? (this.gameMode === 'TWO_PLAYER' && this.activePlayer.id === 1 ? 'PASS TO PLAYER 2 →' : 'SEE FINAL MATCH RESULT 🏆')
      : 'NEXT ATTEMPT →';

    const btnText = this.add.text(width / 2, height / 2 + 130, btnLabelText, { fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '800', fill: '#F7F0D4' }).setOrigin(0.5, 0.5);

    overlay.add([bgDim, card, title, breakdown, nextBtn, btnText]);

    nextBtn.on('pointerdown', () => {
      audioSystem.playClick();
      overlay.destroy();
      if (isPlayerFinished) {
        if (this.gameMode === 'TWO_PLAYER' && this.activePlayer.id === 1) {
          this.activePlayer = this.player2;
          this.startAttempt();
        } else {
          this.scene.start('ResultScene', { mode: this.gameMode, player1: this.player1, player2: this.player2 });
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
      fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#FFD700', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(20);

    this.tweens.add({ targets: this.instrText, alpha: { from: 1, to: 0.3 }, duration: 1500, yoyo: true, repeat: 2 });
  }

  createHUD() {
    const width = this.scale.width;
    this.hudContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(25);

    const bar = this.add.rectangle(width / 2, 28, width - 40, 46, 0x1A0C08, 0.85);
    bar.setStrokeStyle(2, 0xD4AF37, 0.6);

    this.hudPlayerText = this.add.text(40, 28, `${this.activePlayer.name}`, { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#EEDC9A' }).setOrigin(0, 0.5);
    this.hudAttemptText = this.add.text(width / 2, 28, `ATTEMPT 1 / ${GAME_CONFIG.ATTEMPTS_PER_PLAYER}`, { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#C85A32' }).setOrigin(0.5, 0.5);
    this.hudDistText = this.add.text(width - 40, 28, `0 m`, { fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: '900', fill: '#FFD700' }).setOrigin(1, 0.5);

    this.hudWindText = this.add.text(40, this.scale.height - 30, this.windSystem.getWindText(), {
      fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '700', fill: '#F7F0D4', backgroundColor: '#1A0C08', padding: { x: 10, y: 6 }
    }).setOrigin(0, 0.5);

    this.hudScoreText = this.add.text(width - 40, this.scale.height - 30, `SCORE: 0`, {
      fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#EEDC9A', backgroundColor: '#1A0C08', padding: { x: 10, y: 6 }
    }).setOrigin(1, 0.5);

    this.strikeBtn = this.add.rectangle(width / 2, this.scale.height - 40, 160, 48, 0xC85A32).setInteractive({ useHandCursor: true });
    this.strikeBtn.setStrokeStyle(2, 0xFFD700);
    this.strikeBtnLabel = this.add.text(width / 2, this.scale.height - 40, '⚡ STRIKE (SPACE)', {
      fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '800', fill: '#FFFFFF'
    }).setOrigin(0.5, 0.5);

    this.strikeBtn.on('pointerdown', () => {
      if (this.gilli.state === 'LAUNCHED' || this.gilli.state === 'AIRBORNE') this.performStrike();
    });

    this.hudContainer.add([bar, this.hudPlayerText, this.hudAttemptText, this.hudDistText, this.hudWindText, this.hudScoreText, this.strikeBtn, this.strikeBtnLabel]);
  }

  updateHUD(currentDistanceMeters) {
    this.hudPlayerText.setText(`${this.activePlayer.name}`);
    this.hudAttemptText.setText(`ATTEMPT ${Math.min(3, this.activePlayer.currentAttempt)} / ${GAME_CONFIG.ATTEMPTS_PER_PLAYER}`);
    this.hudDistText.setText(`${currentDistanceMeters} m`);
    this.hudWindText.setText(this.windSystem.getWindText());
    this.hudScoreText.setText(`SCORE: ${this.activePlayer.totalScore}`);
  }
}

// SHOP SCENE
class ShopScene extends window.Phaser.Scene {
  constructor() { super('ShopScene'); }

  create() {
    const width = this.scale.width; const height = this.scale.height;
    this.saveData = SaveSystem.load();

    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x3E2723, 0x3E2723, 0x1A0C08, 0x1A0C08, 1);
    bgGraphics.fillRect(0, 0, width, height);

    this.add.text(width / 2, 45, '🪵 DANDA SHOP — POUCH & EQUIPMENT', {
      fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: '900', fill: '#EEDC9A', stroke: '#3E2723', strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.pointsText = this.add.text(width / 2, 85, `YOUR BALANCE: 🪙 ${this.saveData.totalPoints} POINTS`, {
      fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: '800', fill: '#D4AF37'
    }).setOrigin(0.5, 0.5);

    const cardWidth = 260; const cardHeight = 360;
    const startX = (width - (4 * cardWidth + 3 * 30)) / 2 + cardWidth / 2;
    const cardY = 320;

    DANDAS.forEach((danda, idx) => {
      const cardX = startX + idx * (cardWidth + 30);
      this.createDandaCard(cardX, cardY, cardWidth, cardHeight, danda);
    });

    const backBtn = this.add.rectangle(width / 2, height - 45, 200, 44, 0xC85A32).setInteractive({ useHandCursor: true });
    backBtn.setStrokeStyle(2, 0xEEDC9A);

    this.add.text(width / 2, height - 45, '← MAIN MENU', {
      fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#F7F0D4'
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
      isEquipped ? 4 : 2, isEquipped ? 0xFFD700 : (isUnlocked ? 0xC85A32 : 0x5D4037)
    );

    const sprite = this.add.image(0, -90, `danda_${danda.id}`).setScale(1.2).setAngle(45);
    const title = this.add.text(0, -20, danda.name, { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#EEDC9A' }).setOrigin(0.5, 0.5);
    const tamilTitle = this.add.text(0, 5, danda.tamilName, { fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '14px', fill: '#C85A32' }).setOrigin(0.5, 0.5);
    const powerText = this.add.text(0, 35, `POWER: ×${danda.powerMultiplier.toFixed(2)}`, { fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '800', fill: '#4CAF50' }).setOrigin(0.5, 0.5);
    const desc = this.add.text(0, 75, danda.description, { fontFamily: 'Outfit, sans-serif', fontSize: '12px', fill: '#F7F0D4', align: 'center', wordWrap: { width: w - 30 } }).setOrigin(0.5, 0.5);

    let btnColor = 0xC85A32; let btnTextStr = `UNLOCK (${danda.cost} pts)`;
    if (isEquipped) { btnColor = 0x2E7D32; btnTextStr = '✓ EQUIPPED'; }
    else if (isUnlocked) { btnColor = 0x8E3414; btnTextStr = 'EQUIP'; }

    const btn = this.add.rectangle(0, 140, w - 40, 36, btnColor);
    if (!isEquipped) btn.setInteractive({ useHandCursor: true });

    const btnLabel = this.add.text(0, 140, btnTextStr, { fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: '800', fill: '#FFFFFF' }).setOrigin(0.5, 0.5);

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

// HERITAGE SCENE
class HeritageScene extends window.Phaser.Scene {
  constructor() { super('HeritageScene'); }

  create() {
    const width = this.scale.width; const height = this.scale.height;
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x3E2723, 0x3E2723, 0x1A0C08, 0x1A0C08, 1);
    bgGraphics.fillRect(0, 0, width, height);

    this.add.text(width / 2, 45, `🏛️ ${HERITAGE_DATA.title}`, {
      fontFamily: 'Outfit, sans-serif', fontSize: '30px', fontWeight: '900', fill: '#EEDC9A', stroke: '#3E2723', strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 85, HERITAGE_DATA.tamilTitle, {
      fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '22px', fontWeight: '700', fill: '#C85A32'
    }).setOrigin(0.5, 0.5);

    const cardWidth = 560; const cardHeight = 110; const startY = 180;
    HERITAGE_DATA.sections.forEach((sec, idx) => {
      const cardY = startY + idx * (cardHeight + 15);
      const container = this.add.container(width / 2, cardY);
      const panel = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x2B1810).setStrokeStyle(2, 0xD4AF37, 0.7);
      const heading = this.add.text(-cardWidth / 2 + 20, -cardHeight / 2 + 15, `${sec.heading} (${sec.tamilHeading})`, { fontFamily: 'Noto Sans Tamil, Outfit, sans-serif', fontSize: '16px', fontWeight: '800', fill: '#D4AF37' }).setOrigin(0, 0);
      const body = this.add.text(-cardWidth / 2 + 20, -cardHeight / 2 + 42, sec.content, { fontFamily: 'Outfit, sans-serif', fontSize: '13px', fill: '#F7F0D4', wordWrap: { width: cardWidth - 40 }, lineSpacing: 2 }).setOrigin(0, 0);
      container.add([panel, heading, body]);
    });

    const backBtn = this.add.rectangle(width / 2, height - 40, 200, 42, 0xC85A32).setInteractive({ useHandCursor: true });
    backBtn.setStrokeStyle(2, 0xEEDC9A);

    this.add.text(width / 2, height - 40, '← MAIN MENU', { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#F7F0D4' }).setOrigin(0.5, 0.5);
    backBtn.on('pointerdown', () => { audioSystem.playClick(); this.scene.start('MenuScene'); });
  }
}

// RESULT SCENE
class ResultScene extends window.Phaser.Scene {
  constructor() { super('ResultScene'); }

  init(data) {
    this.mode = data.mode || 'SINGLE_PLAYER';
    this.player1 = data.player1;
    this.player2 = data.player2;
  }

  create() {
    const width = this.scale.width; const height = this.scale.height;
    const p1PointsEarned = this.player1.totalScore;
    const p2PointsEarned = this.player2 ? this.player2.totalScore : 0;
    const totalEarned = p1PointsEarned + p2PointsEarned;

    SaveSystem.recordScore(this.player1.totalScore, this.player1.bestDistance, totalEarned);
    audioSystem.playFanfare();

    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x3E2723, 0x3E2723, 0x1A0C08, 0x1A0C08, 1);
    bgGraphics.fillRect(0, 0, width, height);

    this.add.text(width / 2, 50, '🏆 MATCH COMPLETE', {
      fontFamily: 'Outfit, sans-serif', fontSize: '36px', fontWeight: '900', fill: '#EEDC9A', stroke: '#3E2723', strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    if (this.mode === 'SINGLE_PLAYER') this.renderSinglePlayerResult();
    else this.renderTwoPlayerResult();

    const replayBtn = this.add.rectangle(width / 2 - 120, height - 60, 200, 46, 0xC85A32).setInteractive({ useHandCursor: true });
    replayBtn.setStrokeStyle(2, 0xEEDC9A);
    this.add.text(width / 2 - 120, height - 60, '🔄 PLAY AGAIN', { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#FFFFFF' }).setOrigin(0.5, 0.5);

    const menuBtn = this.add.rectangle(width / 2 + 120, height - 60, 200, 46, 0x5D4037).setInteractive({ useHandCursor: true });
    menuBtn.setStrokeStyle(2, 0xEEDC9A);
    this.add.text(width / 2 + 120, height - 60, '🏠 MAIN MENU', { fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', fill: '#FFFFFF' }).setOrigin(0.5, 0.5);

    replayBtn.on('pointerdown', () => { audioSystem.playClick(); this.scene.start('GameScene', { mode: this.mode }); });
    menuBtn.on('pointerdown', () => { audioSystem.playClick(); this.scene.start('MenuScene'); });
  }

  renderSinglePlayerResult() {
    const width = this.scale.width; const height = this.scale.height;
    this.add.rectangle(width / 2, height / 2 - 20, 520, 360, 0x2B1810).setStrokeStyle(3, 0xD4AF37);
    this.add.text(width / 2, height / 2 - 160, `${this.player1.name} PERFORMANCE`, { fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: '800', fill: '#D4AF37' }).setOrigin(0.5, 0.5);

    let attemptLines = this.player1.attempts.map(a =>
      `Attempt ${a.attemptNumber}:  Distance: ${a.distanceMeters}m | Hit: ${a.strikeQuality} | Score: ${a.totalScore}`
    ).join('\n\n');

    const bodyText = [
      attemptLines,
      '------------------------------------------------',
      `🏆 TOTAL SCORE: ${this.player1.totalScore}`,
      `📏 BEST DISTANCE: ${this.player1.bestDistance} m`,
      `🏺 URI POTS SMASHED: ${this.player1.potsSmashedTotal}`
    ].join('\n\n');

    this.add.text(width / 2, height / 2 - 10, bodyText, { fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: '600', fill: '#F7F0D4', align: 'center' }).setOrigin(0.5, 0.5);
  }

  renderTwoPlayerResult() {
    const width = this.scale.width; const height = this.scale.height;
    const p1Score = this.player1.totalScore; const p2Score = this.player2.totalScore;

    let winnerStr = 'IT IS A DRAW!';
    if (p1Score > p2Score) winnerStr = `🏆 ${this.player1.name.toUpperCase()} WINS!`;
    else if (p2Score > p1Score) winnerStr = `🏆 ${this.player2.name.toUpperCase()} WINS!`;

    this.add.text(width / 2, 110, winnerStr, { fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: '900', fill: '#FFD700', stroke: '#000000', strokeThickness: 5 }).setOrigin(0.5, 0.5);

    this.createPlayerSummaryCard(width / 2 - 190, height / 2 + 10, this.player1, p1Score >= p2Score);
    this.createPlayerSummaryCard(width / 2 + 190, height / 2 + 10, this.player2, p2Score >= p1Score);
  }

  createPlayerSummaryCard(x, y, player, isWinner) {
    const card = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 320, 320, 0x2B1810).setStrokeStyle(isWinner ? 4 : 2, isWinner ? 0xFFD700 : 0x5D4037);
    const name = this.add.text(0, -120, player.name, { fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: '800', fill: isWinner ? '#FFD700' : '#EEDC9A' }).setOrigin(0.5, 0.5);

    const statsText = [
      `⭐ Total Score: ${player.totalScore}`,
      `📏 Best Distance: ${player.bestDistance}m`,
      `🏺 Uri Smashed: ${player.potsSmashedTotal}`,
      '',
      `Attempt 1: ${player.attempts[0] ? player.attempts[0].totalScore : 0} pts`,
      `Attempt 2: ${player.attempts[1] ? player.attempts[1].totalScore : 0} pts`,
      `Attempt 3: ${player.attempts[2] ? player.attempts[2].totalScore : 0} pts`
    ].join('\n');

    const details = this.add.text(0, 10, statsText, { fontFamily: 'Outfit, sans-serif', fontSize: '15px', fill: '#F7F0D4', align: 'center', lineSpacing: 4 }).setOrigin(0.5, 0.5);
    card.add([bg, name, details]);
  }
}

// 11. GAME INITIALIZATION
window.addEventListener('load', () => {
  const config = {
    type: window.Phaser.AUTO,
    width: GAME_CONFIG.CANVAS_WIDTH,
    height: GAME_CONFIG.CANVAS_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1F1512',
    scale: {
      mode: window.Phaser.Scale.FIT,
      autoCenter: window.Phaser.Scale.CENTER_BOTH
    },
    scene: [
      BootScene,
      MenuScene,
      GameScene,
      ShopScene,
      HeritageScene,
      ResultScene
    ]
  };

  new window.Phaser.Game(config);
});

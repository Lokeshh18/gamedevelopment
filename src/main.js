// main.js - Core Entry Point & Event Controller

import { PhysicsEngine, GAME_PHASES } from './PhysicsEngine.js';
import { Renderer } from './Renderer.js';
import { SoundManager } from './SoundManager.js';
import { GameModeManager, MODES } from './GameModes.js';
import { StorageManager, DANDA_TYPES } from './Storage.js';

class GameController {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    this.physics = new PhysicsEngine();
    this.sound = new SoundManager();
    this.modeManager = new GameModeManager();

    this.isRunning = false;
    this.lastTime = 0;
    this.equippedDanda = StorageManager.getEquippedDanda();
    this.attemptHandled = false;

    this.initDOM();
    this.initEvents();
    this.resizeCanvas();
  }

  initDOM() {
    // Cache DOM Elements
    this.views = {
      menu: document.getElementById('menu-view'),
      hud: document.getElementById('game-hud-view')
    };

    this.hudText = {
      mode: document.getElementById('hud-mode-text'),
      score: document.getElementById('hud-score-text'),
      attempts: document.getElementById('hud-attempts-text'),
      wind: document.getElementById('hud-wind-text'),
      equipped: document.getElementById('hud-equipped-danda'),
      instruction: document.getElementById('instruction-text'),
      activePlayer: document.getElementById('hud-active-player')
    };

    this.modals = {
      info: document.getElementById('modal-info'),
      shop: document.getElementById('modal-shop'),
      result: document.getElementById('modal-result'),
      playerSelect: document.getElementById('modal-player-select'),
      turnTransition: document.getElementById('modal-turn-transition')
    };

    this.pendingMode = MODES.FAR_LAUNCH;
    this.isMultiplayerTab = true;
  }

  resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.resize(w, h);
    this.physics.reset(h - 120);
  }

  initEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Exit & Return to Main Menu Buttons (all home / exit buttons across HUD & modals)
    const handleExit = (e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.showMenuView();
    };

    const bottomExitBtn = document.getElementById('bottom-exit-btn');
    if (bottomExitBtn) bottomExitBtn.onclick = handleExit;

    document.querySelectorAll('.modal-home-btn').forEach(btn => {
      btn.onclick = handleExit;
    });

    // Navigation Header Buttons
    const infoBtn = document.getElementById('info-btn');
    if (infoBtn) infoBtn.onclick = () => this.showModal('info');

    document.getElementById('open-shop-btn').onclick = () => {
      this.renderShop();
      this.showModal('shop');
    };
    document.getElementById('sound-toggle-btn').onclick = (e) => {
      const isMuted = this.sound.toggleMute();
      e.target.textContent = isMuted ? '🔇' : '🔊';
    };

    // Close Modal 'X' buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.onclick = (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        const targetId = btn.getAttribute('data-close');
        const modalEl = btn.closest('.modal') || (targetId ? document.getElementById(targetId) : null);
        if (modalEl) {
          modalEl.classList.add('hidden');
        }
      };
    });

    // Mode Selection Buttons -> Open Player Setup Dialog or Heritage Modal
    document.getElementById('mode-far-btn').onclick = () => this.openPlayerSetup(MODES.FAR_LAUNCH);
    document.getElementById('mode-pot-btn').onclick = () => this.openPlayerSetup(MODES.POT_SMASH);
    document.getElementById('mode-tutorial-btn').onclick = () => {
      this.showModal('info');
    };

    // Player Setup Modal Tabs
    const tab2P = document.getElementById('tab-2player');
    const tab1P = document.getElementById('tab-1player');
    const p2Group = document.getElementById('p2-input-group');

    tab2P.onclick = () => {
      this.isMultiplayerTab = true;
      tab2P.classList.add('active');
      tab1P.classList.remove('active');
      p2Group.style.display = 'flex';
    };

    tab1P.onclick = () => {
      this.isMultiplayerTab = false;
      tab1P.classList.add('active');
      tab2P.classList.remove('active');
      p2Group.style.display = 'none';
    };

    // Submit Player Registration Form
    document.getElementById('player-setup-form').onsubmit = (e) => {
      e.preventDefault();
      const p1Name = document.getElementById('input-p1-name').value.trim() || 'Striker 1';
      const p2Name = document.getElementById('input-p2-name').value.trim() || 'Striker 2';

      this.hideModal('playerSelect');
      this.startMatch(this.pendingMode, p1Name, p2Name, this.isMultiplayerTab);
    };

    // Begin Player 2 Turn Button
    document.getElementById('start-next-turn-btn').onclick = () => {
      this.hideModal('turnTransition');
      this.resetRound();
      this.updateHUD();
    };

    // HUD Strike Button
    const triggerStrike = () => {
      if (this.physics.phase === GAME_PHASES.AIRBORNE_TIMING) {
        const result = this.physics.swingDanda(this.equippedDanda.powerMultiplier);
        if (result && result.hit) {
          this.sound.playWoodHit(result.sweetSpot ? 1.4 : 1.0);
          this.renderer.addSparks(
            this.physics.gilli.x,
            this.physics.gilli.y,
            result.sweetSpot ? '#ffd700' : '#f4b41a',
            result.sweetSpot ? 30 : 15
          );
          this.hudText.instruction.textContent = result.sweetSpot ?
            '🌟 SUPER STRIKE! PERFECT TIMING!' : '💥 GREAT HIT! GILLI IN FLIGHT!';
        }
      }
    };

    document.getElementById('strike-space-btn').onclick = () => triggerStrike();

    // Keyboard Shortcuts (Spacebar & Enter to Strike)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        triggerStrike();
      }
    });

    // Retry / Return buttons on result modal
    document.getElementById('result-retry-btn').onclick = () => {
      this.hideModal('result');
      this.openPlayerSetup(this.modeManager.currentMode);
    };
    document.getElementById('result-menu-btn').onclick = () => {
      this.hideModal('result');
      this.showMenuView();
    };

    // Canvas Mouse / Touch Controls
    const onPointerDown = (e) => {
      if (this.views.menu.classList.contains('active')) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left + this.renderer.cameraX;
      const y = clientY - rect.top;

      if (this.physics.phase === GAME_PHASES.PIT_FLICK_AIM) {
        this.physics.startAim(x, y);
      } else if (this.physics.phase === GAME_PHASES.AIRBORNE_TIMING) {
        triggerStrike();
      }
    };

    const onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left + this.renderer.cameraX;
      const y = clientY - rect.top;

      if (this.physics.phase === GAME_PHASES.PIT_FLICK_AIM) {
        this.physics.updateAim(x, y);
      } else if (this.physics.phase === GAME_PHASES.AIRBORNE_TIMING) {
        this.physics.updateDandaCursor(x, y);
      }
    };

    const onPointerUp = () => {
      if (this.physics.phase === GAME_PHASES.PIT_FLICK_AIM) {
        const flicked = this.physics.releaseFlick();
        if (flicked) {
          this.sound.playFlick();
          this.hudText.instruction.textContent = 'PHASE 2: Press SPACE / Click anywhere to Strike!';
        }
      }
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    this.canvas.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    this.canvas.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Start render loop
    requestAnimationFrame((t) => this.loop(t));
  }

  openPlayerSetup(modeType) {
    this.pendingMode = modeType;
    this.showModal('playerSelect');
  }

  showMenuView() {
    // Unconditionally hide all modals
    Object.values(this.modals).forEach(m => {
      if (m) m.classList.add('hidden');
    });

    const headerTitle = document.getElementById('app-header-title');
    if (headerTitle) headerTitle.textContent = 'Gilli Danda';

    this.views.menu.classList.add('active');
    this.views.hud.classList.add('hidden');
    this.views.hud.classList.remove('active');
    this.physics.reset(this.canvas.height - 120);
    this.renderer.cameraX = 0;
  }

  startMatch(modeType, p1Name, p2Name, isMultiplayer) {
    this.views.menu.classList.remove('active');
    this.views.hud.classList.remove('hidden');
    this.views.hud.classList.add('active');

    // Update Header Title according to selected mode
    const headerTitle = document.getElementById('app-header-title');
    if (headerTitle) {
      if (modeType === MODES.POT_SMASH) {
        headerTitle.textContent = 'Gilli Danda - Uri Smash Mode';
      } else if (modeType === MODES.FAR_LAUNCH) {
        headerTitle.textContent = 'Gilli Danda - Far Launch Mode';
      } else {
        headerTitle.textContent = 'Gilli Danda - Heritage';
      }
    }

    this.modeManager.initMatch(modeType, this.canvas.height - 120, p1Name, p2Name, isMultiplayer);
    this.equippedDanda = StorageManager.getEquippedDanda();
    this.hudText.equipped.textContent = this.equippedDanda.name;

    this.resetRound();
    this.updateHUD();
  }

  resetRound() {
    const groundY = this.canvas.height - 120;
    this.physics.reset(groundY);
    this.renderer.cameraX = 0;
    this.attemptHandled = false;
    const curP = this.modeManager.getCurrentPlayer();
    this.hudText.instruction.textContent = `${curP.name}'s Turn: Click & Drag backwards from the Gilli Pit (Dhar) to flick!`;
  }

  updateHUD() {
    const modeNames = {
      [MODES.FAR_LAUNCH]: 'Far Launch Mode',
      [MODES.POT_SMASH]: 'Uri Smash Mode (உறி)',
      [MODES.TUTORIAL]: 'Heritage Tutorial'
    };

    const curP = this.modeManager.getCurrentPlayer();
    this.hudText.mode.textContent = modeNames[this.modeManager.currentMode];
    this.hudText.attempts.textContent = `${curP.attemptsLeft} Left`;

    // Active player badge
    if (curP.id === 1) {
      this.hudText.activePlayer.textContent = `🔴 ${curP.name}`;
      this.hudText.activePlayer.className = 'hud-val player-1-color';
    } else {
      this.hudText.activePlayer.textContent = `🔵 ${curP.name}`;
      this.hudText.activePlayer.className = 'hud-val player-2-color';
    }

    const windVal = (this.physics.wind / 20).toFixed(1);
    this.hudText.wind.textContent = `💨 ${windVal} m/s`;

    if (this.modeManager.currentMode === MODES.POT_SMASH) {
      this.hudText.score.textContent = `${curP.potsSmashed} Pots`;
    } else {
      this.hudText.score.textContent = `${this.physics.distanceTraveled.toFixed(1)} m`;
    }
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    // Update Physics & Wind Particles
    const physicsRes = this.physics.update(dt);
    this.renderer.updateParticles(dt, this.physics.wind);

    // Play pleasant wooden bounce sound when Gilli impacts ground
    if (physicsRes && physicsRes.bounced) {
      this.sound.playBounce(physicsRes.velocity);
    }

    // Update Camera position to follow Gilli
    if (this.views.hud.classList.contains('active')) {
      this.renderer.updateCamera(this.physics.gilli.x);
      this.updateHUD();

      // Check Pot collision in Pot Smash mode during flight or airborne motion
      if (this.modeManager.currentMode === MODES.POT_SMASH &&
         (this.physics.phase === GAME_PHASES.FLIGHT_AND_ROLL || this.physics.phase === GAME_PHASES.AIRBORNE_TIMING)) {
        const smashedPot = this.modeManager.checkPotCollisions(this.physics.gilli.x, this.physics.gilli.y);
        if (smashedPot) {
          this.sound.playPotSmash();
          this.renderer.addPotFragments(smashedPot.x, smashedPot.y);
          // Realistic energy loss / deflection when hitting terracotta pot
          this.physics.gilli.vx *= 0.65;
          this.physics.gilli.vy += 70;
        }
      }

      // Check round completion once per throw when Gilli lands
      if (this.physics.phase === GAME_PHASES.LANDED && !this.attemptHandled) {
        this.attemptHandled = true;
        this.onAttemptFinished();
      }
    }

    // Render Canvas
    this.renderer.render(
      this.physics,
      this.modeManager.pots,
      this.equippedDanda,
      this.hudText.instruction.textContent
    );

    requestAnimationFrame((t) => this.loop(t));
  }

  onAttemptFinished() {
    const dist = this.physics.distanceTraveled;
    const attemptsLeft = this.modeManager.recordAttempt(dist);

    // Add cumulative distance to player stats for shop unlocks
    StorageManager.addDistance(dist);

    if (attemptsLeft > 0) {
      // Prompt for next attempt after a brief delay
      setTimeout(() => {
        this.resetRound();
      }, 1800);
    } else {
      // Current player finished all 3 attempts!
      const switched = this.modeManager.advanceTurn();
      if (switched) {
        // Player 1 finished -> Trigger Turn Transition to Player 2
        setTimeout(() => {
          const p1 = this.modeManager.players[0];
          const p2 = this.modeManager.players[1];
          document.getElementById('turn-complete-subtitle').textContent = `🎉 ${p1.name} completed 3 attempts!`;
          document.getElementById('turn-next-player-name').textContent = `🔵 ${p2.name}`;
          this.sound.playVictoryJingle();
          this.showModal('turnTransition');
        }, 1200);
      } else {
        // Match completed -> Show Head to Head Comparison Leaderboard
        setTimeout(() => {
          this.showHeadToHeadComparison();
        }, 1000);
      }
    }
  }

  showHeadToHeadComparison() {
    const modeName = this.modeManager.currentMode === MODES.POT_SMASH ? 'Uri Smash' : 'Far Launch';
    const isMulti = this.modeManager.isMultiplayer && this.modeManager.players.length > 1;
    const p1 = this.modeManager.players[0];
    const p2 = isMulti ? this.modeManager.players[1] : null;

    const { winner, isTie } = this.modeManager.getWinner();

    // Announce Winner / Result Header
    const winnerText = document.getElementById('winner-announce-text');
    const vsDivider = document.getElementById('res-vs-divider');

    if (!isMulti) {
      winnerText.textContent = `MATCH COMPLETED! 🌟`;
      if (vsDivider) vsDivider.style.display = 'none';
    } else {
      if (vsDivider) vsDivider.style.display = 'block';
      if (isTie) {
        winnerText.textContent = `MATCH TIED! BOTH PLAYERS EXCELLED! 🤝`;
      } else {
        winnerText.textContent = `WINNER: ${winner.name.toUpperCase()}! 👑`;
      }
    }

    // Helper to render 3-attempt chips
    const renderAttemptChips = (containerId, history = []) => {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const val = history[i] !== undefined ? `${history[i].toFixed(1)}m` : '-';
        const chip = document.createElement('div');
        chip.className = 'attempt-chip';
        chip.innerHTML = `<span>Attempt ${i + 1}</span><strong>${val}</strong>`;
        el.appendChild(chip);
      }
    };

    // Toggle Pots Smashed row display (only visible in Uri Smash mode)
    const isUriSmash = this.modeManager.currentMode === MODES.POT_SMASH;
    const p1PotsRow = document.getElementById('res-p1-pots-row');
    const p2PotsRow = document.getElementById('res-p2-pots-row');
    if (p1PotsRow) p1PotsRow.style.display = isUriSmash ? 'flex' : 'none';
    if (p2PotsRow) p2PotsRow.style.display = isUriSmash ? 'flex' : 'none';

    // Populate P1 Card
    document.getElementById('res-p1-name').textContent = p1.name;
    document.getElementById('res-p1-best').textContent = `${p1.bestScore.toFixed(1)} m`;
    document.getElementById('res-p1-total').textContent = `${p1.totalScore.toFixed(0)} pts`;
    document.getElementById('res-p1-pots').textContent = `${p1.potsSmashed}`;
    renderAttemptChips('res-p1-attempts', p1.attemptsHistory || []);

    const p2Card = document.getElementById('res-p2-card');
    if (isMulti && p2) {
      p2Card.style.display = 'flex';
      document.getElementById('res-p2-name').textContent = p2.name;
      document.getElementById('res-p2-best').textContent = `${p2.bestScore.toFixed(1)} m`;
      document.getElementById('res-p2-total').textContent = `${p2.totalScore.toFixed(0)} pts`;
      document.getElementById('res-p2-pots').textContent = `${p2.potsSmashed}`;
      renderAttemptChips('res-p2-attempts', p2.attemptsHistory || []);
    } else {
      p2Card.style.display = 'none';
    }

    // Save winner to persistent state
    const scoreVal = this.modeManager.currentMode === MODES.POT_SMASH ? winner.potsSmashed : winner.bestScore.toFixed(1);
    const scoreText = this.modeManager.currentMode === MODES.POT_SMASH ? `${winner.potsSmashed} Pots` : `${winner.bestScore.toFixed(1)} m`;
    StorageManager.saveHighScore(winner.name, modeName, scoreVal, scoreText);

    this.sound.playVictoryJingle();
    this.showModal('result');
  }

  renderShop() {
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    const totalDist = StorageManager.getTotalDistance();
    const unlocked = StorageManager.getUnlockedDandas();
    const equipped = StorageManager.getEquippedDanda();

    Object.values(DANDA_TYPES).forEach(danda => {
      const isUnlocked = unlocked.includes(danda.id);
      const isEquipped = equipped.id === danda.id;
      const canUnlock = totalDist >= danda.cost;

      const card = document.createElement('div');
      card.className = `shop-card ${isEquipped ? 'equipped' : ''}`;

      card.innerHTML = `
        <div class="shop-card-icon">${danda.icon}</div>
        <div class="shop-card-title">${danda.name}</div>
        <div class="shop-card-desc">${danda.desc}</div>
        <div class="shop-card-stat">Power: +${((danda.powerMultiplier - 1) * 100).toFixed(0)}%</div>
        ${
          isEquipped ?
          `<button class="btn btn-gold btn-sm" disabled>Equipped ✓</button>` :
          isUnlocked ?
          `<button class="btn btn-secondary btn-sm select-btn">Equip Stick</button>` :
          `<button class="btn btn-gold btn-sm unlock-btn" ${canUnlock ? '' : 'disabled'}>
            ${canUnlock ? 'Unlock Now' : `Need ${danda.cost}m (${totalDist.toFixed(0)}m)`}
           </button>`
        }
      `;

      if (!isEquipped && isUnlocked) {
        card.querySelector('.select-btn').onclick = () => {
          StorageManager.setEquippedDanda(danda.id);
          this.equippedDanda = danda;
          this.renderShop();
        };
      } else if (!isUnlocked && canUnlock) {
        card.querySelector('.unlock-btn').onclick = () => {
          StorageManager.unlockDanda(danda.id);
          StorageManager.setEquippedDanda(danda.id);
          this.equippedDanda = danda;
          this.renderShop();
        };
      }

      grid.appendChild(card);
    });
  }

  showModal(id) {
    const modalEl = this.modals[id] || document.getElementById(id) || document.getElementById(`modal-${id}`);
    if (modalEl) modalEl.classList.remove('hidden');
  }

  hideModal(id) {
    const modalEl = this.modals[id] || document.getElementById(id) || document.getElementById(`modal-${id}`);
    if (modalEl) modalEl.classList.add('hidden');
  }
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  new GameController();
});


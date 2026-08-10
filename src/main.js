import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { HeritageScene } from './scenes/HeritageScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { GAME_CONFIG } from './data/gameConfig.js';

const Phaser = window.Phaser;

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.CANVAS_WIDTH,
  height: GAME_CONFIG.CANVAS_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1F1512',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
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

window.addEventListener('load', () => {
  new Phaser.Game(config);
});

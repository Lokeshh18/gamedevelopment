const Phaser = window.Phaser;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

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

    const potCanvas = this.textures.createCanvas('uri_pot', 36, 40);
    const ctxPot = potCanvas.context;
    ctxPot.fillStyle = '#B84A28'; ctxPot.beginPath(); ctxPot.arc(18, 24, 14, 0, Math.PI * 2); ctxPot.fill();
    ctxPot.strokeStyle = '#6E250E'; ctxPot.lineWidth = 2; ctxPot.stroke();
    ctxPot.fillStyle = '#8E3414'; ctxPot.fillRect(10, 4, 16, 6);
    ctxPot.fillStyle = '#D4AF37'; ctxPot.fillRect(8, 2, 20, 4);
    ctxPot.fillStyle = '#FFFFFF'; ctxPot.beginPath(); ctxPot.arc(18, 22, 2.5, 0, Math.PI * 2); ctxPot.arc(12, 24, 2, 0, Math.PI * 2); ctxPot.arc(24, 24, 2, 0, Math.PI * 2); ctxPot.fill();
    potCanvas.refresh();

    const fragCanvas = this.textures.createCanvas('clay_fragment', 8, 8);
    const ctxFrag = fragCanvas.context;
    ctxFrag.fillStyle = '#A33D1C'; ctxFrag.beginPath(); ctxFrag.moveTo(1, 1); ctxFrag.lineTo(7, 2); ctxFrag.lineTo(5, 7); ctxFrag.closePath(); ctxFrag.fill();
    fragCanvas.refresh();

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

  create() {
    this.scene.start('MenuScene');
  }
}

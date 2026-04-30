class NarrativeScene extends Phaser.Scene {
  constructor() {
    super('NarrativeScene');
  }

  init(data) {
    this.nextScene = data.next;
    this.nextData  = data.nextData || null;
    this.narrativeText = data.text;
    this.subtext = data.subtext || null;
    this.copyText = data.copyText || null;
    this.showChars = data.showChars || false;
  }

  create() {
    MobileControls.hide();
    MobileControls.hideHud();
    this.cameras.main.setBackgroundColor('#0d1b2a');

    const mainY = this.showChars ? 80 : (this.subtext ? 150 : 190);

    this.add.text(400, mainY, this.narrativeText, {
      fontSize: '22px',
      fill: '#e0e0e0',
      align: 'center',
      wordWrap: { width: 680 }
    }).setOrigin(0.5);

    if (this.subtext) {
      this.add.text(400, 260, this.subtext, {
        fontSize: '18px',
        fill: '#ffd60a',
        align: 'center'
      }).setOrigin(0.5);
    }

    if (this.showChars) {
      // Backdrop behind the characters - three-stop vertical gradient: green → yellow → red.
      // Drawn as a stack of thin horizontal stripes (Phaser graphics has no native gradient fill).
      const backdrop = this.add.graphics();
      const stops = [
        { r: 0xbc, g: 0x3a, b: 0x3a }, // clear red, not neon
        { r: 0xec, g: 0xc6, b: 0x40 }, // warm gold
        { r: 0x3d, g: 0x75, b: 0x55 }, // richer forest green
      ];
      const yStart = 170, yEnd = 320, steps = 60;
      const stripeH = (yEnd - yStart) / steps;
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);                // 0..1 across the whole gradient
        const segT = t * (stops.length - 1);      // 0..2 across the two segments
        const seg = Math.min(Math.floor(segT), stops.length - 2);
        const localT = segT - seg;
        const a = stops[seg], b = stops[seg + 1];
        const r = Math.round(a.r * (1 - localT) + b.r * localT);
        const g = Math.round(a.g * (1 - localT) + b.g * localT);
        const bl = Math.round(a.b * (1 - localT) + b.b * localT);
        backdrop.fillStyle((r << 16) | (g << 8) | bl, 1);
        backdrop.fillRect(0, yStart + i * stripeH, 800, Math.ceil(stripeH) + 1);
      }

      // Each character has a different native aspect - Spanner/Keir are tall
      // portraits, Ed/John include the paddleboard or unicorn underneath.
      // Show each at its natural aspect so nothing gets stretched.
      const chars = [
        // poleX/poleY: where the pole BOTTOM sits, relative to the character's centre.
        { key: 'spanner', w: 70,  h: 115, label: 'Spanner Spencer', flag: 'flag-uk',       poleX: 23, poleY: 26 },
        { key: 'ed',      w: 219, h: 119, label: 'Ed Davey',         flag: 'flag-uk',       poleX: 70, poleY: 33 },
        { key: 'keir',    w: 84,  h: 126, label: 'Keir Toolson',     flag: 'flag-uk',       poleX: 28, poleY: 24 },
        { key: 'john',    w: 200, h: 132, label: 'John McWho?',      flag: 'flag-scotland', poleX: 30, poleY: -6 },
      ];
      const xPositions = [80, 300, 500, 690];
      chars.forEach((c, i) => {
        const cx = xPositions[i];
        const cy = 245;
        this.add.image(cx, cy, c.key).setDisplaySize(c.w, c.h);
        this.add.text(cx, 335, c.label, {
          fontSize: '14px', fill: '#ffd60a', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5);

        // Flag on a pole, placed at the character's hand
        const poleHeight = 36;
        const poleX = cx + c.poleX;
        const poleBottom = cy + c.poleY;
        const poleTop = poleBottom - poleHeight;

        const pole = this.add.graphics();
        pole.fillStyle(0x6b4220, 1);
        pole.fillRect(poleX - 1, poleTop, 2, poleHeight);
        // Tiny gold finial on top
        pole.fillStyle(0xffd60a, 1);
        pole.fillCircle(poleX, poleTop, 2);

        // Flag attached just below the finial, fluttering to the right of the pole
        const flagW = 30, flagH = 18;
        this.add.image(poleX + flagW / 2, poleTop + flagH / 2 + 2, c.flag).setDisplaySize(flagW, flagH);
      });
    }

    if (this.copyText) {
      const copyData = this.copyText;
      const btn = this.add.text(400, 320, '[ Copy score to clipboard ]', {
        fontSize: '15px',
        fill: '#ffffff',
        backgroundColor: '#1a5276',
        padding: { x: 14, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setStyle({ fill: '#ffd60a' }));
      btn.on('pointerout',  () => btn.setStyle({ fill: '#ffffff' }));
      btn.on('pointerdown', () => {
        navigator.clipboard.writeText(copyData).then(() => {
          btn.setText('[ Copied! ]');
        });
      });
    }

    this.add.text(400, 400, MobileControls.isTouch() ? 'Tap to continue' : 'Press SPACE or click to continue', {
      fontSize: '15px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => this.advance());
    // Only use click-to-advance when there's no interactive button on screen
    if (!this.copyText) {
      this.input.once('pointerdown', () => this.advance());
    }
  }

  advance() {
    this.scene.start(this.nextScene, this.nextData);
  }
}

class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  init(data) {
    this.card = (data && data.card) ? data.card : 'tally';
    // Capture the run time once on first entry to the tally card.
    if (this.card === 'tally' && !this.registry.get('completionTime')) {
      const start = this.registry.get('gameStart') || Date.now();
      const elapsed = Date.now() - start;
      const mins = Math.floor(elapsed / 60000);
      const secs = Math.floor((elapsed % 60000) / 1000);
      this.registry.set('completionTime', `${mins}m ${String(secs).padStart(2, '0')}s`);
    }
  }

  create() {
    MobileControls.hide();
    MobileControls.hideHud();
    this.cameras.main.setBackgroundColor('#0d1b2a');
    if      (this.card === 'tally')  this.cardTally();
    else if (this.card === 'farage') this.cardFarage();
    else if (this.card === 'twist')  this.cardTwist();
  }

  cardTally() {
    // Rain confetti behind the tally text so the celebration sits in the
    // background and doesn't fight the score for attention.
    this.spawnConfetti();

    const time = this.registry.get('completionTime') || '?m ??s';

    this.add.text(400, 50, `Hooray! You found 32 votes in ${time}!`, {
      fontSize: '24px', fill: '#ffd60a', fontStyle: 'bold',
      align: 'center', wordWrap: { width: 760 }
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Spanner Spencer got 8', {
      fontSize: '20px', fill: '#5cce4d'
    }).setOrigin(0.5);
    this.add.text(400, 162, 'Ed Davey got 8', {
      fontSize: '20px', fill: '#f2a225'
    }).setOrigin(0.5);
    this.add.text(400, 194, 'Keir Toolson got 8', {
      fontSize: '20px', fill: '#e63946'
    }).setOrigin(0.5);
    this.add.text(400, 226, 'John McWho? got 8', {
      fontSize: '20px', fill: '#3a8acc'
    }).setOrigin(0.5);

    this.add.text(400, 295, 'But hang on - Reform got 15 votes.', {
      fontSize: '22px', fill: '#12b5cb', fontStyle: 'bold',
      align: 'center', wordWrap: { width: 740 }
    }).setOrigin(0.5);

    this.add.text(400, 335, 'No one has enough votes to beat them on their own…', {
      fontSize: '18px', fill: '#ffd60a', fontStyle: 'bold',
      align: 'center', wordWrap: { width: 720 }
    }).setOrigin(0.5);

    // Highlighted continue button - yellow chip with hover
    const continueBtn = this.add.text(400, 400,
      MobileControls.isTouch() ? 'Tap to continue ▶' : 'Press SPACE to continue ▶', {
        fontSize: '18px', fill: '#0d1b2a', fontStyle: 'bold',
        backgroundColor: '#ffd60a',
        padding: { x: 22, y: 12 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    continueBtn.on('pointerover', () => continueBtn.setStyle({ fill: '#1a5276' }));
    continueBtn.on('pointerout',  () => continueBtn.setStyle({ fill: '#0d1b2a' }));
    continueBtn.on('pointerdown', () => this.scene.restart({ card: 'farage' }));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart({ card: 'farage' }));
  }

  cardFarage() {
    // Floating cash drifting up around Posh Nige - his "billionaire mates"
    // made visible. Drawn first so it sits behind everything else.
    this.spawnCash();

    // Posh Nige cackling on the left
    const farage = this.add.image(220, 155, 'farage');
    farage.setScale(2.0);

    // Speech bubble to the right of him
    const bubbleX = 370, bubbleY = 90, bubbleW = 380, bubbleH = 130;
    const bubble = this.add.graphics();
    bubble.fillStyle(0xffffff, 1);
    bubble.fillRoundedRect(bubbleX, bubbleY, bubbleW, bubbleH, 16);
    // Tail pointing back at Farage
    bubble.fillTriangle(bubbleX, bubbleY + 60, bubbleX, bubbleY + 90, bubbleX - 22, bubbleY + 88);
    // Slim outline so the bubble pops on the dark navy background
    bubble.lineStyle(2, 0x0d1b2a, 1);
    bubble.strokeRoundedRect(bubbleX, bubbleY, bubbleW, bubbleH, 16);

    this.add.text(bubbleX + bubbleW / 2, bubbleY + 38,
      'Posh Nige:', {
        fontSize: '15px', fill: '#333333', fontStyle: 'bold'
      }).setOrigin(0.5);
    this.add.text(bubbleX + bubbleW / 2, bubbleY + 78,
      '"You can\'t beat me and\nmy billionaire mates!"', {
        fontSize: '20px', fill: '#0d1b2a', fontStyle: 'bold',
        align: 'center', wordWrap: { width: bubbleW - 30 }
      }).setOrigin(0.5);

    // Simple bar chart sitting below Nige's bubble - Reform's bar towers over the
    // opposition parties' bars. No labels or numbers, just the visual.
    const chartCx = bubbleX + bubbleW / 2;
    const baseline = 305;
    const barW = 26, barGap = 14;
    // Opposition parties all got 8 votes each in the tally, Reform got 15.
    // Equal-height opposition bars + a much taller Reform bar makes that read at a glance.
    const oppH = 35, reformH = 65;
    const bars = [
      { color: 0xe63946, h: oppH },     // red
      { color: 0xffd60a, h: oppH },     // yellow
      { color: 0xf2a225, h: oppH },     // orange
      { color: 0x5cce4d, h: oppH },     // green
      { color: 0x12b5cb, h: reformH },  // Reform teal - towering over the rest
    ];
    const totalBarsW = bars.length * barW + (bars.length - 1) * barGap;
    const barsStartX = chartCx - totalBarsW / 2;
    const chart = this.add.graphics();
    // Thin baseline so the bars look like they're standing on something.
    chart.fillStyle(0xffffff, 1);
    chart.fillRect(barsStartX - 8, baseline + 1, totalBarsW + 16, 2);
    bars.forEach((b, i) => {
      chart.fillStyle(b.color, 1);
      chart.fillRect(barsStartX + i * (barW + barGap), baseline - b.h, barW, b.h);
    });

    this.add.text(400, 335, 'If only there was something we could do...', {
      fontSize: '20px', fill: '#ffd60a', fontStyle: 'italic',
      align: 'center', wordWrap: { width: 720 }
    }).setOrigin(0.5);

    // Highlighted continue button at the bottom - same style as the tally card's
    const continueBtn = this.add.text(400, 390,
      MobileControls.isTouch()
        ? 'Tap to find out how to stop Reform ▶'
        : 'Press SPACE to find out how to stop Reform ▶', {
        fontSize: '15px', fill: '#0d1b2a', fontStyle: 'bold',
        backgroundColor: '#ffd60a',
        padding: { x: 18, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    continueBtn.on('pointerover', () => continueBtn.setStyle({ fill: '#1a5276' }));
    continueBtn.on('pointerout',  () => continueBtn.setStyle({ fill: '#0d1b2a' }));
    continueBtn.on('pointerdown', () => this.scene.restart({ card: 'twist' }));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart({ card: 'twist' }));
  }

  cardTwist() {
    // Character lineup (left -> right: John, Keir, Ed, Spanner) each delivering one line
    // of the tactical-voting reveal in a speech bubble above their head.
    const lineup = [
      { key: 'john',    x: 100, w: 120, h: 79, text: 'We have:\n8 + 8 + 8 + 8 = 32' },
      { key: 'keir',    x: 290, w: 50,  h: 76, text: 'Posh Nige\nonly has 15!' },
      { key: 'ed',      x: 480, w: 131, h: 71, text: 'If we combine our votes we have more than enough to beat Reform!' },
      { key: 'spanner', x: 680, w: 42,  h: 69, text: 'Tactical voting for the win!' },
    ];
    const charY = 170;
    const bubbleW = 170, bubbleH = 80, bubbleY = 30;

    lineup.forEach(c => {
      const bx = c.x - bubbleW / 2;
      const by = bubbleY;
      const charTop = charY - c.h / 2;

      // Bubble background, drawn as a single Graphics object per character.
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(bx, by, bubbleW, bubbleH, 12);
      // Tail pointing down to the top of the character's head.
      g.fillTriangle(c.x - 8, by + bubbleH, c.x + 8, by + bubbleH, c.x, charTop - 2);
      g.lineStyle(2, 0x0d1b2a, 1);
      g.strokeRoundedRect(bx, by, bubbleW, bubbleH, 12);

      // Bubble text - centred, wraps to fit.
      this.add.text(c.x, by + bubbleH / 2, c.text, {
        fontSize: '12px', fill: '#0d1b2a', fontStyle: 'bold',
        align: 'center', wordWrap: { width: bubbleW - 16 }
      }).setOrigin(0.5);

      // Character below the bubble.
      this.add.image(c.x, charY, c.key).setDisplaySize(c.w, c.h);
    });

    // "Visit [StopReformUK.vote] for the latest..." block sits in the middle
    // of the page now that the explainer paragraph above it is gone.
    const linkY = 235;
    const visitTxt = this.add.text(0, linkY, 'Visit ', {
      fontSize: '17px', fill: '#ffd60a'
    }).setOrigin(0, 0.5);
    const urlTxt = this.add.text(0, linkY, 'StopReformUK.vote', {
      fontSize: '17px', fill: '#ff66ff'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    // Open in a new tab - passing 'noopener,noreferrer' makes the new tab
    // independent of this one (no window.opener handle back).
    urlTxt.on('pointerdown', () => window.open('https://StopReformUK.vote', '_blank', 'noopener,noreferrer'));
    urlTxt.on('pointerover', () => urlTxt.setStyle({ fill: '#ffffff' }));
    urlTxt.on('pointerout',  () => urlTxt.setStyle({ fill: '#ff66ff' }));
    // Centre "Visit StopReformUK.vote" as one block on the canvas
    const totalW = visitTxt.width + urlTxt.width;
    const startX = (800 - totalW) / 2;
    visitTxt.setX(startX);
    urlTxt.setX(startX + visitTxt.width);
    // Underline the URL
    const ul = this.add.graphics();
    ul.lineStyle(1, 0xff66ff, 1);
    ul.lineBetween(
      startX + visitTxt.width + 1, linkY + 10,
      startX + visitTxt.width + urlTxt.width - 1, linkY + 10
    );

    this.add.text(400, 270,
      'for the latest unbiased tactical voting advice for the\nelections on 7th May 2026',
      { fontSize: '17px', fill: '#ffd60a',
        align: 'center', wordWrap: { width: 760 } }
    ).setOrigin(0.5);

    this.makeShareButton(400, 340);

    const playPrompt = this.add.text(400, 410, MobileControls.isTouch() ? 'Tap here to play again' : 'Press SPACE to play again', {
      fontSize: '15px', fill: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    playPrompt.on('pointerdown', () => this.scene.start('BootScene'));

    // Bottom-right "tip jar" link to the developer's Ko-fi page. Underlined manually
    // so it reads as a clickable link.
    const coffeeY = 437;
    const coffee = this.add.text(790, coffeeY, 'Help fuel my coffee habit', {
      fontSize: '12px', fill: '#ffd60a'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    coffee.on('pointerover', () => coffee.setStyle({ fill: '#ffffff' }));
    coffee.on('pointerout',  () => coffee.setStyle({ fill: '#ffd60a' }));
    coffee.on('pointerdown', () => window.open('https://ko-fi.com/chickabiddybex', '_blank', 'noopener,noreferrer'));
    const coffeeUL = this.add.graphics();
    coffeeUL.lineStyle(1, 0xffd60a, 1);
    coffeeUL.lineBetween(coffee.x - coffee.width, coffeeY + 9, coffee.x, coffeeY + 9);

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('BootScene'));
  }

  // Five party-coloured confetti streamers raining down from the top.
  // Generates the small rectangle textures lazily on first call, then attaches
  // a particle emitter per colour so the screen fills with mixed-colour confetti.
  spawnConfetti() {
    const confettiColors = [
      { key: 'confetti-red',    color: 0xe63946 },
      { key: 'confetti-orange', color: 0xf2a225 },
      { key: 'confetti-green',  color: 0x5cce4d },
      { key: 'confetti-blue',   color: 0x3a8acc },
      { key: 'confetti-yellow', color: 0xffd60a },
    ];
    confettiColors.forEach(({ key, color }) => {
      if (!this.textures.exists(key)) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(color, 1);
        g.fillRect(0, 0, 6, 10);
        g.generateTexture(key, 6, 10);
        g.destroy();
      }
      this.add.particles(0, -20, key, {
        x: { min: 0, max: 800 },
        speedY: { min: 80, max: 180 },
        speedX: { min: -50, max: 50 },
        rotate: { min: 0, max: 360 },
        angularVelocity: { min: -180, max: 180 },
        scale: { min: 0.8, max: 1.4 },
        lifespan: 5000,
        frequency: 120,
        duration: 2500,   // emit for 2.5s, then existing pieces drift down and fade
      });
    });
  }

  // Cash bills floating slowly upward around Posh Nige - drawn procedurally as
  // little green rectangles with a darker centre so they read as banknotes.
  spawnCash() {
    if (!this.textures.exists('cash')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Bill body (money green) and darker border
      g.fillStyle(0x4a7a3a, 1);
      g.fillRect(0, 0, 22, 12);
      g.fillStyle(0x85bb65, 1);
      g.fillRect(1, 1, 20, 10);
      // Centre "portrait" oval
      g.fillStyle(0x4a7a3a, 1);
      g.fillCircle(11, 6, 3);
      // Corner numerals (just darker squares as a hint)
      g.fillRect(3, 3, 2, 2);
      g.fillRect(17, 7, 2, 2);
      g.generateTexture('cash', 22, 12);
      g.destroy();
    }
    this.add.particles(0, 0, 'cash', {
      x: { min: 80, max: 360 },     // a band roughly under and beside Farage
      y: { min: 260, max: 340 },
      speedY: { min: -60, max: -25 },   // float up gently
      speedX: { min: -25, max: 25 },    // light horizontal drift
      rotate: { min: -25, max: 25 },
      angularVelocity: { min: -60, max: 60 },
      scale: { min: 0.9, max: 1.4 },
      alpha: { start: 1, end: 0 },      // fade as it rises
      lifespan: 3500,
      frequency: 220,
    });
  }

  // Single copy-to-clipboard button so the player can paste their score anywhere.
  makeShareButton(x, y) {
    const time = this.registry.get('completionTime') || '?m ??s';
    const shareText = `I helped save the country in ${time} on Campaign Trail! 🎉\nCan you beat my time? 🗳️🏃‍♂️\nPlay here: tacticalvote.co.uk/game`;

    const btn = this.add.text(x, y, `${time} ⏱️  Copy your score🏆`, {
      fontSize: '17px', fill: '#ffffff',
      backgroundColor: '#1a5276',
      padding: { x: 18, y: 10 },
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ fill: '#ffd60a' }));
    btn.on('pointerout',  () => btn.setStyle({ fill: '#ffffff' }));
    btn.on('pointerdown', () => {
      navigator.clipboard.writeText(shareText).then(() => {
        Sfx.copy();
        btn.setText('Copied! Paste it anywhere to share');
      }).catch(() => {
        btn.setText('Copy failed - please share StopReformUK.vote');
      });
    });
  }
}

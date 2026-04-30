class Level3Keir extends Phaser.Scene {
  constructor() {
    super('Level3Keir');
  }

  create() {
    MobileControls.show('platformer', { actionLabel: '📜' });

    const W = 1200;
    const H = 450;

    this.physics.world.setBounds(0, 0, W, H);
    // Keir's a heavy bloke - stronger gravity so his jumps don't float.
    this.physics.world.gravity.y = 900;

    // ── Welsh forest background ──────────────────────────────────────────
    const bg = this.add.graphics().setScrollFactor(0);

    // Sky: pale grey-blue (overcast Wales) fading to soft mossy green at horizon
    bg.fillGradientStyle(0xa8bcc8, 0xa8bcc8, 0x7a9968, 0x7a9968, 1);
    bg.fillRect(0, 0, 800, 450);

    // Soft sun behind cloud
    bg.fillStyle(0xfff4d8, 0.6);
    bg.fillCircle(660, 80, 38);

    // Distant rolling Welsh hills
    bg.fillStyle(0x4a6055, 1);
    bg.fillPoints([
      {x:0,y:300},{x:60,y:250},{x:140,y:280},{x:220,y:240},{x:320,y:270},
      {x:430,y:235},{x:540,y:265},{x:640,y:240},{x:740,y:270},{x:800,y:255},
      {x:800,y:450},{x:0,y:450}
    ], true);

    // Distant Welsh castle perched on the hill near x=620 (the higher peak
    // around x=640 in the hill polygon). Drawn in the same grey-green as the
    // hills so the castle reads as part of the same distant layer.
    {
      const cx = 505, base = 266;
      bg.fillStyle(0x4a6055, 1);
      // Curtain wall (bottom flush with the hill)
      bg.fillRect(cx, base - 14, 38, 14);
      // Wall crenellations
      [cx, cx+8, cx+16, cx+24, cx+32].forEach(x => bg.fillRect(x, base - 18, 4, 4));
      // Left keep (taller, square - also flush to base)
      bg.fillRect(cx - 6, base - 28, 10, 28);
      bg.fillRect(cx - 6, base - 32, 3, 4);
      bg.fillRect(cx + 1, base - 32, 3, 4);
      // Right tower
      bg.fillRect(cx + 32, base - 24, 8, 24);
      bg.fillRect(cx + 32, base - 28, 3, 4);
      bg.fillRect(cx + 37, base - 28, 3, 4);
    }

    // Distant sheep grazing on the Welsh hills - small white silhouettes with
    // darker heads and legs. Grouped in two clusters on hill slopes so they
    // read as flocks rather than scattered dots.
    const drawSheep = (x, y) => {
      bg.fillStyle(0xeeeeee, 1);
      bg.fillRect(x, y, 5, 3);          // body
      bg.fillStyle(0x444444, 1);
      bg.fillRect(x + 5, y + 1, 1, 1);  // head
      bg.fillRect(x + 1, y + 3, 1, 1);  // front leg
      bg.fillRect(x + 3, y + 3, 1, 1);  // back leg
    };
    // Left cluster on the rise toward x=220
    drawSheep(165, 274);
    drawSheep(173, 276);
    drawSheep(181, 272);
    // Right cluster on the rise toward x=640
    drawSheep(603, 273);
    drawSheep(611, 275);
    drawSheep(619, 271);

    // Mid treeline - deep oak/conifer green
    bg.fillStyle(0x1f3a25, 1);
    bg.fillPoints([
      {x:0,y:380},{x:20,y:340},{x:45,y:360},{x:70,y:308},{x:95,y:348},
      {x:120,y:300},{x:150,y:344},{x:180,y:295},{x:210,y:354},{x:240,y:305},
      {x:270,y:356},{x:300,y:302},{x:330,y:350},{x:360,y:300},{x:390,y:354},
      {x:420,y:308},{x:450,y:350},{x:480,y:302},{x:510,y:354},{x:540,y:300},
      {x:570,y:350},{x:600,y:306},{x:630,y:354},{x:660,y:302},{x:690,y:350},
      {x:720,y:306},{x:750,y:354},{x:780,y:302},{x:800,y:320},
      {x:800,y:450},{x:0,y:450}
    ], true);

    // Foreground bracken
    bg.fillStyle(0x2a5028, 1);
    bg.fillRect(0, 410, 800, 12);

    // Daffodils scattered along the bracken - the unmistakable Welsh "spring
    // in the hedgerows" look. Yellow petals around an orange trumpet on a
    // dark green stem, drawn big enough to actually read as flowers.
    const drawDaffodil = (x) => {
      // Stem (dark green) - runs from above the bracken down through it
      bg.fillStyle(0x2a4a18, 1);
      bg.fillRect(x + 3, 405, 2, 16);
      // Petal body (yellow)
      bg.fillStyle(0xffd60a, 1);
      bg.fillRect(x, 397, 8, 6);          // main 8x6 yellow blob
      bg.fillRect(x + 1, 396, 6, 1);      // top edge
      bg.fillRect(x + 1, 403, 6, 1);      // bottom edge
      // Trumpet (orange)
      bg.fillStyle(0xf2a225, 1);
      bg.fillRect(x + 2, 398, 4, 4);
      // Trumpet rim (darker orange) for depth
      bg.fillStyle(0xc7651a, 1);
      bg.fillRect(x + 2, 398, 4, 1);
    };
    [20, 170, 300, 430, 560, 690].forEach(x => drawDaffodil(x));

    // Earthy ground strip (Welsh peat brown)
    bg.fillStyle(0x4a3322, 1);
    bg.fillRect(0, 422, 800, 28);
    // ── End background ───────────────────────────────────────────────────

    const makeTexture = (key, w, h, color) => {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, 0, w, h);
      gfx.generateTexture(key, w, h);
      gfx.destroy();
    };

    // Welsh forest floor - peat soil with grass tufts, moss patches and pebbles
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Base earthy peat
      g.fillStyle(0x4a3322, 1);
      g.fillRect(0, 0, W, 20);
      // Grass tufts along the very top
      for (let x = 0; x < W; x += 6) {
        const variant = Math.floor(x / 6) % 5;
        if (variant < 3) {
          g.fillStyle(0x3a6028, 1);
          g.fillRect(x, 0, 1, 2);
          g.fillRect(x + 2, 0, 1, 1);
        } else if (variant === 4) {
          g.fillStyle(0x4a7a32, 1);
          g.fillRect(x + 1, 0, 1, 3);
        }
      }
      // Soil junction (darker line just under the grass)
      g.fillStyle(0x2e2014, 1);
      g.fillRect(0, 3, W, 1);
      // Moss patches
      g.fillStyle(0x4a7a34, 0.6);
      for (let i = 0; i < 30; i++) {
        g.fillRect((i * 41 + 13) % W, 4, 5, 1);
      }
      // Pebbles scattered through the soil
      for (let i = 0; i < 60; i++) {
        const cx = (i * 23 + 9) % W;
        const cy = 7 + (i % 7);
        g.fillStyle((i % 2) === 0 ? 0x6a5040 : 0x8a7060, 1);
        g.fillEllipse(cx, cy, 3, 2);
      }
      // Soil flecks
      g.fillStyle(0x5a3f2a, 0.5);
      for (let i = 0; i < 100; i++) {
        g.fillRect((i * 17) % W, 6 + (i % 11), 2, 1);
      }
      // Deeper darker soil at the bottom
      g.fillStyle(0x2a1c10, 1);
      g.fillRect(0, 16, W, 4);
      g.generateTexture('keir-ground', W, 20);
      g.destroy();
    }

    // Red brick wall textures (varying heights) - staggered brick pattern with Reform-blue cracks.
    // Last arg shifts the crack horizontally so the four wall types don't all crack down the middle.
    this.makeBrickWall('wall-short',     50,  60, 14);  // a bit to the left
    this.makeBrickWall('wall-medium',    50, 100, 25);  // centred
    this.makeBrickWall('wall-tall',      50, 140, 34);  // a bit to the right
    this.makeBrickWall('wall-extratall', 50, 180, 22);  // just left of centre

    // Wall burst particle - green (the rhetoric biting through)
    makeTexture('particle', 8, 8, 0x5cce4d);

    // Ballot paper texture
    this.makeBallotTexture();

    // --- Ground (no platforms - walls reach all the way down) ---
    const platforms = this.physics.add.staticGroup();
    platforms.create(W / 2, 440, 'keir-ground');

    // --- Walls (8 of them, varying heights, each with a ballot on top) ---
    this.walls = this.physics.add.staticGroup();
    this.ballots = this.physics.add.staticGroup();
    this.voteCount = 0;
    this.totalVotes = 8;

    // [x, height, textureKey, airOffset]
    // airOffset > 0 = ballot floats this many px above the wall top (only reachable by jumping from the wall, not from the ground).
    // airOffset = 0 = ballot sits directly on top of the wall.
    const wallSpec = [
      [180,   60, 'wall-short',        0],
      [320,  140, 'wall-tall',       135],   // air ballot at y=155, climb the wall first
      [460,   60, 'wall-short',        0],
      [600,  180, 'wall-extratall',   95],   // air ballot at y=155
      [740,  100, 'wall-medium',       0],
      [880,  180, 'wall-extratall',   95],   // air ballot at y=155
      [1020,  60, 'wall-short',        0],
      [1160, 100, 'wall-medium',       0],
    ];
    const wallSprites = [];
    const ballotInfo = [];
    wallSpec.forEach(([x, h, key, airOffset], i) => {
      const w = this.walls.create(x, 430 - h / 2, key);
      wallSprites.push(w);
      const ballotY = airOffset > 0 ? (430 - h - airOffset) : (430 - h - 12);
      const b = this.ballots.create(x, ballotY, 'marble');
      ballotInfo.push({ ballot: b, isAir: airOffset > 0, index: i });
    });

    // For each air ballot, remember the three walls that make it reachable
    // (directly below + immediate left + immediate right). If a player smashes
    // all three of those walls, that ballot is stranded - we softlock the
    // level and surface a "try again" message.
    this.airClusters = ballotInfo
      .filter(bi => bi.isAir)
      .map(bi => ({
        ballot: bi.ballot,
        support: [wallSprites[bi.index - 1], wallSprites[bi.index], wallSprites[bi.index + 1]]
          .filter(Boolean)
      }));
    this.softlocked = false;

    // --- Player ---
    this.player = this.physics.add.sprite(60, 390, 'keir');
    this.player.setDisplaySize(33, 50);
    this.player.body.setSize(28, 42);
    this.player.body.setCollideWorldBounds(true);
    this.player.facing = 'right';
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.player, this.walls);

    // --- Right-wing rhetoric scrolls (projectiles) ---
    this.scrolls = this.physics.add.group();
    this.physics.add.overlap(this.scrolls, this.walls, (scroll, wall) => {
      Sfx.smash();
      const burst = this.add.particles(wall.x, wall.y, 'particle', { speed: { min: 60, max: 180 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 400, emitting: false });
      burst.explode(14);
      this.time.delayedCall(500, () => burst.destroy());
      scroll.destroy();
      wall.destroy();
      this.checkSoftlock();
    });

    // Direct ballot pickups (player jumps on top of wall)
    this.physics.add.overlap(this.player, this.ballots, (_, ballot) => {
      this.collectBallot(ballot);
    });

    // --- Camera ---
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Controls ---
    Controls.bindKeyboard(this);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    MobileControls.setResetHandler(() => this.scene.restart());
    // TEMP: dev skip - remove before ship
    this.nKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

    // --- UI ---
    MobileControls.showHud({ totalVotes: this.totalVotes });
    MobileControls.setControlsHint(['Arrows: move / jump', 'Z: throw manifesto', 'R: restart']);
  }

  collectBallot(ballot) {
    ballot.destroy();
    this.voteCount++;
    Sfx.collect();
    MobileControls.setVotes(this.voteCount);
    if (this.voteCount >= this.totalVotes) this.levelComplete();
  }

  // Has the player smashed every supporting wall under an uncollected air ballot?
  // If so the ballot is now unreachable - flag the level as softlocked.
  checkSoftlock() {
    if (this.softlocked) return;
    const stranded = this.airClusters.some(c =>
      c.ballot.active && c.support.every(w => !w.active)
    );
    if (stranded) {
      this.softlocked = true;
      // Hold the message back briefly so the player has a moment to notice
      // they can't reach the ballot before the game tells them.
      this.time.delayedCall(1000, () => this.showSoftlockMessage());
    }
  }

  showSoftlockMessage() {
    this.physics.pause();
    // Dim backdrop fixed to the camera so it covers the visible play area
    this.add.rectangle(400, 225, 800, 450, 0x000000, 0.78)
      .setScrollFactor(0).setDepth(100);

    this.add.text(400, 160,
      "Turns out spewing right wing rhetoric\ndoesn't help save the red walls.", {
        fontSize: '22px', fill: '#ffffff', fontStyle: 'bold',
        align: 'center', wordWrap: { width: 720 }
      }).setScrollFactor(0).setOrigin(0.5).setDepth(101);

    this.add.text(400, 215, 'Now some ballots are out of reach!', {
      fontSize: '18px', fill: '#ffffff',
      align: 'center', wordWrap: { width: 720 }
    }).setScrollFactor(0).setOrigin(0.5).setDepth(101);

    const tryAgain = this.add.text(400, 275, 'Try again without doing that', {
      fontSize: '22px', fill: '#ffd60a', fontStyle: 'bold'
    }).setScrollFactor(0).setOrigin(0.5).setDepth(101)
      .setInteractive({ useHandCursor: true });

    // Manual underline matching the link colour
    const ul = this.add.graphics().setScrollFactor(0).setDepth(101);
    ul.lineStyle(2, 0xffd60a, 1);
    ul.lineBetween(
      tryAgain.x - tryAgain.width / 2, tryAgain.y + 14,
      tryAgain.x + tryAgain.width / 2, tryAgain.y + 14
    );

    tryAgain.on('pointerover', () => tryAgain.setStyle({ fill: '#ffffff' }));
    tryAgain.on('pointerout',  () => tryAgain.setStyle({ fill: '#ffd60a' }));
    tryAgain.on('pointerdown', () => this.scene.restart());
  }

  // Red brick wall texture with staggered courses, mortar lines and green cracks.
  // crackX is the horizontal centre line of the zigzag crack, so different
  // walls can have cracks in different places rather than all down the middle.
  makeBrickWall(key, w, h, crackX = 22) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Base red brick fill
    g.fillStyle(0xa8301c, 1);
    g.fillRect(0, 0, w, h);
    // Subtle texture variation
    g.fillStyle(0xbf3a24, 0.4);
    g.fillRect(0, 0, w, h / 2);
    // Mortar lines
    g.fillStyle(0x3a1810, 1);
    const brickH = 12;
    const brickW = 25;
    // Horizontal mortar
    for (let y = 0; y < h; y += brickH) {
      g.fillRect(0, y, w, 2);
    }
    // Vertical mortar (staggered every other row)
    let row = 0;
    for (let y = 0; y < h; y += brickH) {
      const offset = row % 2 === 0 ? 0 : Math.floor(brickW / 2);
      for (let x = offset; x < w; x += brickW) {
        g.fillRect(x, y, 2, brickH);
      }
      row++;
    }
    // Brick highlights (warm tone on the top of each brick to look weathered)
    g.fillStyle(0xd06040, 0.35);
    row = 0;
    for (let y = 0; y < h; y += brickH) {
      const offset = row % 2 === 0 ? 0 : Math.floor(brickW / 2);
      for (let x = offset; x < w; x += brickW) {
        g.fillRect(x + 2, y + 2, brickW - 4, 2);
      }
      row++;
    }

    // Reform-blue crack - the right-wing rhetoric biting into the red wall.
    // Only runs from the top down to roughly the wall's halfway point.
    g.lineStyle(2, 0x12b5cb, 0.95);
    g.beginPath();
    const crackEnd = Math.floor(h / 2);
    let zx = crackX, zy = 6;
    g.moveTo(zx, zy);
    while (zy < crackEnd) {
      zy += 9;
      zx = (Math.floor(zy / 9) % 2 === 0) ? crackX - 4 : crackX + 4;
      g.lineTo(zx, Math.min(zy, crackEnd));
    }
    g.strokePath();
    // Single small offshoot near the bottom of the visible crack, only on taller walls
    if (h >= 120) {
      g.beginPath();
      const tipY = Math.floor(crackEnd * 0.85);
      g.moveTo(crackX, tipY);
      g.lineTo(crackX + 12, tipY + 4);
      g.strokePath();
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }

  makeBallotTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xfafafa, 1);
    g.fillRect(2, 4, 20, 16);
    g.fillStyle(0x444444, 1);
    g.fillRect(2, 4, 20, 1);
    g.fillRect(2, 19, 20, 1);
    g.fillRect(2, 4, 1, 16);
    g.fillRect(21, 4, 1, 16);
    g.fillStyle(0x1a1a1a, 1);
    [[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16]].forEach(([x,y]) => g.fillRect(x, y, 2, 2));
    [[15,8],[14,9],[13,10],[12,11],[11,12],[10,13],[9,14],[8,15],[7,16]].forEach(([x,y]) => g.fillRect(x, y, 2, 2));
    g.generateTexture('marble', 24, 24);
    g.destroy();
  }

  throwManifesto() {
    Sfx.throwSfx();
    const dir = this.player.facing === 'left' ? -1 : 1;
    const scroll = this.scrolls.create(
      this.player.x + dir * 22,
      this.player.y,
      'pizza'
    );
    scroll.setDisplaySize(22, 22);
    scroll.body.setSize(22, 22);
    scroll.body.allowGravity = false;
    scroll.setVelocityX(dir * 450);
    scroll.setAngularVelocity(dir * 720);

    this.time.delayedCall(1500, () => {
      if (scroll.active) scroll.destroy();
    });
  }

  update() {
    if (!this.player.active) return;

    const onGround = this.player.body.blocked.down;

    if (Controls.left()) {
      this.player.setVelocityX(-200);
      this.player.facing = 'left';
      this.player.setFlipX(true);
    } else if (Controls.right()) {
      this.player.setVelocityX(200);
      this.player.facing = 'right';
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (Controls.up() && onGround) {
      this.player.setVelocityY(-620);
      Sfx.jump();
    }

    if (Controls.actionJustDown()) {
      this.throwManifesto();
    }

    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.scene.restart();
      return;
    }

    // TEMP: dev skip - remove before ship
    if (Phaser.Input.Keyboard.JustDown(this.nKey)) {
      this.skipLevel();
      return;
    }
  }

  goNext() {
    this.scene.start('NarrativeScene', {
      text: 'Some votes have floated up into the sky over Glasgow. Only John McWho? on his unicorn can reach them.\n\nWatch out for dodgy bar charts trying to mislead him!',
      next: 'Level4John'
    });
  }

  skipLevel() {
    this.physics.pause();
    this.goNext();
  }

  levelComplete() {
    this.physics.pause();
    Sfx.complete();
    this.add.text(400, 180, 'Level Complete!', {
      fontSize: '40px', fill: '#ffd60a', stroke: '#000000', strokeThickness: 4
    }).setScrollFactor(0).setOrigin(0.5);
    this.add.text(400, 235, MobileControls.isTouch() ? 'Tap to continue' : 'Press SPACE to continue', {
      fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
    }).setScrollFactor(0).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.goNext());
    this.input.once('pointerdown', () => this.goNext());
  }
}

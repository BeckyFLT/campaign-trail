class Level1Spanner extends Phaser.Scene {
  constructor() {
    super('Level1Spanner');
  }

  create() {
    // Start the run timer the first time Spanner's level loads. Don't reset on
    // mid-level restarts (death/respawn) - those should still count toward the run.
    if (!this.registry.get('gameStart')) {
      this.registry.set('gameStart', Date.now());
    }

    MobileControls.show('platformer', { actionLabel: '🔧' });

    const W = 1200;
    const H = 450;

    this.physics.world.setBounds(0, 0, W, H);
    this.physics.world.gravity.y = 600;

    // ── Manchester skyline background ────────────────────────────────────
    // Cloudy-Manchester sky gradient drawn first (pale grey-blue at the top,
    // warm grey-orange at the horizon). Becky's hand-painted skyline PNG is
    // layered on top - its sky pixels are transparent so the gradient shows
    // through, while the silhouette, hills and street are opaque.
    const bg = this.add.graphics().setScrollFactor(0);
    bg.fillGradientStyle(0x9bb3c4, 0x9bb3c4, 0xc4a880, 0xc4a880, 1);
    bg.fillRect(0, 0, 800, 450);
    this.add.image(400, 225, 'manchester-skyline').setScrollFactor(0);

    // Cover the lighter "pavement" strip painted at the bottom of the
    // manchester-skyline PNG with the silhouette dark brown so it doesn't
    // read as a separate band below the silhouette.
    const skylineCover = this.add.graphics().setScrollFactor(0);
    skylineCover.fillStyle(0x2c1c14, 1);
    skylineCover.fillRect(0, 400, 800, 50);

    // Coronation Street-style terraced houses lining the back of the street.
    // Drawn on a separate Graphics layer (after the skyline image) so they
    // sit in front of the painted skyline but behind the play layer.
    const houses = this.add.graphics().setScrollFactor(0);
    const houseW = 50;
    const houseH = 60;
    const houseBase = 435;
    const roofTop = houseBase - houseH;
    const doorColour = 0x2a4868;

    const drawTerraceHouse = (x, hasChimney) => {
      // Brick wall - desaturated brown-red so it sits back into the grey-blue sky
      houses.fillStyle(0x7a5448, 1);
      houses.fillRect(x, roofTop + 10, houseW, houseH - 10);
      // Subtle horizontal mortar courses
      houses.fillStyle(0x504038, 0.35);
      for (let y = roofTop + 14; y < houseBase; y += 5) {
        houses.fillRect(x, y, houseW, 1);
      }
      // Slate roof
      houses.fillStyle(0x383840, 1);
      houses.fillRect(x, roofTop, houseW, 10);
      // Roof highlight (lighter top edge)
      houses.fillStyle(0x5a5a62, 0.6);
      houses.fillRect(x, roofTop, houseW, 2);

      // Front door (lower-left of unit) - all doors the same Corrie blue
      houses.fillStyle(doorColour, 1);
      houses.fillRect(x + 6, houseBase - 22, 10, 22);
      // Doorstep (light stone)
      houses.fillStyle(0xc4b89c, 1);
      houses.fillRect(x + 5, houseBase - 1, 12, 1);

      // Upper-left bedroom window - darker glass, frame muted to warm grey,
      // moved 3 px outward so the two windows sit further apart
      houses.fillStyle(0x807870, 1);
      houses.fillRect(x + 3, roofTop + 16, 14, 14);
      houses.fillStyle(0x2a3848, 1);
      houses.fillRect(x + 4, roofTop + 17, 12, 12);
      houses.fillStyle(0x807870, 1);
      houses.fillRect(x + 9, roofTop + 17, 1, 12);
      houses.fillRect(x + 4, roofTop + 22, 12, 1);

      // Upper-right bedroom window
      houses.fillStyle(0x807870, 1);
      houses.fillRect(x + 33, roofTop + 16, 14, 14);
      houses.fillStyle(0x2a3848, 1);
      houses.fillRect(x + 34, roofTop + 17, 12, 12);
      houses.fillStyle(0x807870, 1);
      houses.fillRect(x + 39, roofTop + 17, 1, 12);
      houses.fillRect(x + 34, roofTop + 22, 12, 1);

      // Chimney (every other house) with slate cap and a hint of soot
      if (hasChimney) {
        houses.fillStyle(0x7a5448, 1);
        houses.fillRect(x + 38, roofTop - 8, 6, 8);
        houses.fillStyle(0x383840, 1);
        houses.fillRect(x + 37, roofTop - 9, 8, 2);
        houses.fillStyle(0x222222, 0.5);
        houses.fillRect(x + 39, roofTop - 6, 4, 1);
      }
    };

    const nHouses = Math.ceil(800 / houseW);
    for (let i = 0; i < nHouses; i++) {
      drawTerraceHouse(i * houseW, i % 2 === 0);
    }
    // Atmospheric haze - knocks the houses back so they read as background
    // rather than competing with the play layer.
    houses.setAlpha(0.3);
    // ── End background ───────────────────────────────────────────────────

    const makeTexture = (key, w, h, color) => {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, 0, w, h);
      gfx.generateTexture(key, w, h);
      gfx.destroy();
    };

    // Cobblestone street - the main collision ground
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x3a322c, 1);
      g.fillRect(0, 0, W, 20);
      // Top row of cobbles
      const cobble = [0x5a4a40, 0x4a4038, 0x6a5a48, 0x504638];
      for (let x = 0; x < W; x += 14) {
        g.fillStyle(cobble[Math.floor(x / 14) % cobble.length], 1);
        g.fillEllipse(x + 7, 6, 12, 8);
      }
      // Mortar gaps
      g.fillStyle(0x1a1410, 1);
      for (let x = 14; x < W; x += 14) {
        g.fillRect(x - 1, 3, 2, 8);
      }
      // Tiny highlight catching the light on top of each cobble
      g.fillStyle(0x9a8878, 0.5);
      for (let x = 0; x < W; x += 14) {
        g.fillRect(x + 4, 2, 5, 1);
      }
      // Compacted earth substrate under the cobbles
      g.fillStyle(0x2a221c, 1);
      g.fillRect(0, 12, W, 8);
      // Specks of grit in the substrate
      g.fillStyle(0x4a3a30, 1);
      for (let i = 0; i < 80; i++) {
        g.fillRect((i * 19 + 7) % W, 13 + (i % 6), 1, 1);
      }
      g.generateTexture('ground', W, 20);
      g.destroy();
    }

    // Brick warehouse platform
    {
      const pw = 150, ph = 18;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x6a3820, 1);
      g.fillRect(0, 0, pw, ph);
      // Mortar courses (horizontal)
      g.fillStyle(0x3a1810, 1);
      for (let y = 5; y < ph; y += 6) {
        g.fillRect(0, y, pw, 1);
      }
      // Vertical mortar - staggered every other row
      let row = 0;
      for (let y = 0; y < ph; y += 6) {
        const offset = row % 2 === 0 ? 0 : 12;
        for (let x = offset; x < pw; x += 24) {
          g.fillRect(x, y, 1, 6);
        }
        row++;
      }
      // Warm highlight on the top of each brick
      g.fillStyle(0x9a5638, 0.4);
      row = 0;
      for (let y = 1; y < ph; y += 6) {
        const offset = row % 2 === 0 ? 2 : 14;
        for (let x = offset; x < pw; x += 24) {
          g.fillRect(x, y, 20, 1);
        }
        row++;
      }
      // Sun-lit edge along the very top
      g.fillStyle(0xb05838, 1);
      g.fillRect(0, 0, pw, 1);
      g.generateTexture('platform', pw, ph);
      g.destroy();
    }

    // Reform bot enemy - grey body, teal-blue Reform accent. 28x32.
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x444444, 1);
      g.fillRect(13, 0, 2, 4);
      g.fillStyle(0xff3333, 1);
      g.fillCircle(14, 1, 2);
      g.fillStyle(0x999999, 1);
      g.fillRect(4, 4, 20, 10);
      g.fillStyle(0x12b5cb, 1);
      g.fillRect(8, 7, 4, 3);
      g.fillRect(16, 7, 4, 3);
      g.fillStyle(0x333333, 1);
      g.fillRect(10, 12, 8, 1);
      g.fillStyle(0x777777, 1);
      g.fillRect(2, 14, 24, 16);
      g.fillStyle(0x12b5cb, 1);
      g.fillRect(2, 17, 24, 2);
      g.fillStyle(0xaaaaaa, 1);
      g.fillRect(11, 22, 6, 4);
      g.generateTexture('enemy', 28, 32);
      g.destroy();
    }

    // Electric-bolt particle (cyan/white). 8x8.
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 0, 2, 2);
      g.fillStyle(0x66ccff, 1);
      g.fillRect(2, 2, 4, 2);
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 4, 2, 2);
      g.fillStyle(0x66ccff, 1);
      g.fillRect(2, 6, 4, 2);
      g.generateTexture('particle', 8, 8);
      g.destroy();
    }

    // Ballot paper (replaces marble)
    this.makeBallotTexture();

    // --- Platforms ---
    const platforms = this.physics.add.staticGroup();
    platforms.create(W / 2, 440, 'ground');
    platforms.create(160,   355, 'platform');
    platforms.create(360,   275, 'platform');
    platforms.create(580,   205, 'platform');
    platforms.create(790,   295, 'platform');
    platforms.create(1050,  380, 'platform');

    // --- Player (Spanner - taller sprite to fit her ponytail) ---
    this.player = this.physics.add.sprite(60, 384, 'spanner');
    this.player.setDisplaySize(30, 50);
    this.player.body.setSize(28, 46);
    this.player.body.setCollideWorldBounds(true);
    this.player.facing = 'right';
    this.physics.add.collider(this.player, platforms);

    // --- Reform bots (no gravity, patrol) ---
    // y values place each bot's feet flush with the platform top:
    // platform_top - half_bot_height (32/2 = 16) + body_y_offset_in_texture (2 px empty below feet)
    this.enemies = this.physics.add.group();
    this.addEnemy(360, 252, 290, 430);   // platform centre y=275, top y=266
    this.addEnemy(790, 272, 720, 860);   // platform centre y=295, top y=286

    // --- Ballots (8 total) ---
    this.voteCount = 0;
    this.ballots = this.physics.add.staticGroup();
    [
      [120,  423], [200,  338], [430,  258], [580,  188],
      [690,  423], [870,  278], [950,  423], [1100, 363],
    ].forEach(([x, y]) => this.ballots.create(x, y, 'marble'));
    this.totalVotes = this.ballots.getChildren().length;

    this.physics.add.overlap(this.player, this.ballots, (_, ballot) => {
      ballot.destroy();
      this.voteCount++;
      Sfx.collect();
      MobileControls.setVotes(this.voteCount);
      if (this.voteCount >= this.totalVotes) this.levelComplete();
    });

    // Touch bot without active spanner = respawn at start
    this.spannerActive = false;
    this.physics.add.overlap(this.player, this.enemies, () => {
      if (!this.spannerActive) {
        Sfx.hit();
        this.resetPlayer();
      }
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
    MobileControls.setControlsHint(['Arrows: move / jump', 'Z: spanner attack', 'R: restart']);
  }

  // Ballot paper - white rectangle with an X.
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

  addEnemy(x, y, minX, maxX) {
    const e = this.enemies.create(x, y, 'enemy');
    e.setVelocityX(70);
    e.patrolMin = minX;
    e.patrolMax = maxX;
    e.body.allowGravity = false;
    e.body.setCollideWorldBounds(true);
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
      this.player.setVelocityY(-520);
      Sfx.jump();
    }

    if (Controls.actionJustDown()) {
      this.swingSpanner();
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

    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (e.x <= e.patrolMin) e.setVelocityX(70);
      else if (e.x >= e.patrolMax) e.setVelocityX(-70);
    });
  }

  swingSpanner() {
    if (this.spannerActive) return;
    this.spannerActive = true;
    Sfx.swing();

    const dir = this.player.facing === 'left' ? -1 : 1;
    const hitX = this.player.x + dir * 36;
    const hitY = this.player.y;

    // Open-end spanner: thin handle, chunky head, and jaws that taper to a
    // rounded tip (3-row stepped curve on the outer corners). Inner gripping
    // edge stays straight where the nut would seat.
    const swing = this.add.graphics();
    const drawSpannerShape = (color, yOff) => {
      swing.fillStyle(color, 1);
      if (dir > 0) {
        swing.fillRect(hitX - 22, hitY - 2 + yOff, 22, 5);   // handle
        swing.fillRect(hitX,      hitY - 6 + yOff, 8, 12);   // head
        // Top jaw - left edge anchored to head, right tip rounds inward
        swing.fillRect(hitX + 8,  hitY - 4 + yOff, 8, 2);
        swing.fillRect(hitX + 8,  hitY - 5 + yOff, 7, 1);
        swing.fillRect(hitX + 8,  hitY - 6 + yOff, 6, 1);
        // Bottom jaw - mirrored vertically
        swing.fillRect(hitX + 8,  hitY + 2 + yOff, 8, 2);
        swing.fillRect(hitX + 8,  hitY + 4 + yOff, 7, 1);
        swing.fillRect(hitX + 8,  hitY + 5 + yOff, 6, 1);
      } else {
        swing.fillRect(hitX,      hitY - 2 + yOff, 22, 5);
        swing.fillRect(hitX - 8,  hitY - 6 + yOff, 8, 12);
        swing.fillRect(hitX - 16, hitY - 4 + yOff, 8, 2);
        swing.fillRect(hitX - 15, hitY - 5 + yOff, 7, 1);
        swing.fillRect(hitX - 14, hitY - 6 + yOff, 6, 1);
        swing.fillRect(hitX - 16, hitY + 2 + yOff, 8, 2);
        swing.fillRect(hitX - 15, hitY + 4 + yOff, 7, 1);
        swing.fillRect(hitX - 14, hitY + 5 + yOff, 6, 1);
      }
    };
    drawSpannerShape(0x808080, 1);   // shadow, offset 1 px down
    drawSpannerShape(0xc8c8c8, 0);   // silver body
    // Bright highlight along the very top edge for metallic sheen
    swing.fillStyle(0xeeeeee, 1);
    if (dir > 0) {
      swing.fillRect(hitX - 22, hitY - 2, 22, 1);
      swing.fillRect(hitX,      hitY - 6, 8, 1);
      swing.fillRect(hitX + 8,  hitY - 6, 6, 1);
    } else {
      swing.fillRect(hitX,      hitY - 2, 22, 1);
      swing.fillRect(hitX - 8,  hitY - 6, 8, 1);
      swing.fillRect(hitX - 14, hitY - 6, 6, 1);
    }

    // Zap any bot in range
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (Math.abs(e.x - hitX) < 50 && Math.abs(e.y - hitY) < 40) {
        Sfx.zap();
        const burst = this.add.particles(e.x, e.y, 'particle', { speed: { min: 60, max: 180 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 400, emitting: false });
        burst.explode(12);
        this.time.delayedCall(500, () => burst.destroy());
        e.destroy();
      }
    });

    this.time.delayedCall(200, () => {
      swing.destroy();
      this.spannerActive = false;
    });
  }

  resetPlayer() {
    this.player.setPosition(60, 384);
    this.player.setVelocity(0, 0);
  }

  goNext() {
    this.scene.start('NarrativeScene', {
      text: 'Some votes drifted down the River Thames. Only Ed Davey on his trusty paddleboard can fish them out.\n\nWatch out for the billionaires in their yachts trying to stop you!',
      next: 'Level2Ed'
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

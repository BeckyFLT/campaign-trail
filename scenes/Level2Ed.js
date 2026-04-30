class Level2Ed extends Phaser.Scene {
  constructor() {
    super('Level2Ed');
  }

  create() {
    MobileControls.show('autoscroller');

    const W = 800;
    const H = 450;

    const makeTexture = (key, w, h, color) => {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, 0, w, h);
      gfx.generateTexture(key, w, h);
      gfx.destroy();
    };

    // Thames water - murky green-brown
    makeTexture('water-bg', W, H, 0x4a6048);

    // Billionaire yacht (replaces shark sprite). 40x40.
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Hull (white)
      g.fillStyle(0xffffff, 1);
      g.fillRect(2, 26, 30, 8);
      // Bow (pointy front)
      g.fillTriangle(32, 26, 32, 34, 38, 30);
      // Hull gold money-stripe
      g.fillStyle(0xd4a017, 1);
      g.fillRect(2, 25, 30, 1);
      // Lower cabin
      g.fillStyle(0xffffff, 1);
      g.fillRect(8, 18, 18, 8);
      // Cabin window strip (dark tint)
      g.fillStyle(0x224466, 1);
      g.fillRect(9, 20, 16, 3);
      // Upper / fly bridge
      g.fillStyle(0xffffff, 1);
      g.fillRect(12, 12, 12, 6);
      g.fillStyle(0x224466, 1);
      g.fillRect(14, 13, 8, 2);
      // Antenna mast
      g.fillStyle(0x222222, 1);
      g.fillRect(17, 4, 1, 8);
      // Tiny flag - drawn on the left of the mast in the source texture so that
      // after the sprite is flipped (so the bow leads the direction of travel),
      // the flag flutters out behind the yacht rather than in front of it.
      g.fillStyle(0xff3333, 1);
      g.fillRect(13, 4, 4, 3);
      // Waterline
      g.fillStyle(0x66aacc, 0.5);
      g.fillRect(0, 33, 40, 4);
      g.generateTexture('shark', 40, 40);
      g.destroy();
    }

    // Ballot paper texture (white rect with X)
    this.makeBallotTexture();

    // Wave shapes - small ~~ tildes and short dashes scattered across the
    // water surface, so the river reads as a wavy moving sheet rather than
    // a flat colour with white squares on it.
    {
      const w = this.make.graphics({ x: 0, y: 0, add: false });
      w.fillStyle(0xffffff, 1);
      // Two full sine cycles across 16 px: peaks at the top, troughs at the bottom
      w.fillRect( 0, 1, 2, 1);
      w.fillRect( 2, 0, 2, 1);
      w.fillRect( 4, 1, 2, 1);
      w.fillRect( 6, 2, 2, 1);
      w.fillRect( 8, 1, 2, 1);
      w.fillRect(10, 0, 2, 1);
      w.fillRect(12, 1, 2, 1);
      w.fillRect(14, 2, 2, 1);
      w.generateTexture('wave-tilde', 16, 3);
      w.destroy();
    }
    {
      const w = this.make.graphics({ x: 0, y: 0, add: false });
      w.fillStyle(0xffffff, 1);
      w.fillRect(0, 0, 8, 1);
      w.generateTexture('wave-dash', 8, 1);
      w.destroy();
    }

    // Soft puffy cloud - flat-ish bottom, bumpy top - drifts in the sky band
    {
      const c = this.make.graphics({ x: 0, y: 0, add: false });
      c.fillStyle(0xffffff, 1);
      c.fillRect(2, 8, 22, 4);
      c.fillCircle( 5, 8, 4);
      c.fillCircle(11, 5, 5);
      c.fillCircle(17, 6, 4);
      c.fillCircle(21, 9, 3);
      c.generateTexture('cloud', 26, 14);
      c.destroy();
    }

    // Water wake - small foam pixels to trail behind the paddleboard.
    makeTexture('wake-foam',  4, 3, 0xffffff);
    makeTexture('wake-froth', 3, 2, 0xc8e8d8);

    // Water background fills the screen
    this.add.image(W / 2, H / 2, 'water-bg');

    // Daylight sky band sitting above the embankment line. Without this the
    // dark silhouette would float against the murky water - it also gives
    // the dark HUD text a light backdrop to read against.
    const skyBlue = 0x87ceeb;
    this.add.rectangle(W / 2, 40, W, 80, skyBlue);

    // Drifting clouds tucked into the sky band - sit behind the silhouette
    // (they appear in gaps between buildings, not in front of them).
    this.skyClouds = [];
    [
      { x:  60, y: 12, alpha: 0.9  },
      { x: 240, y: 22, alpha: 0.75 },
      { x: 410, y:  8, alpha: 0.85 },
      { x: 560, y: 18, alpha: 0.7  },
      { x: 720, y: 14, alpha: 0.85 },
    ].forEach(p => {
      const c = this.add.image(p.x, p.y, 'cloud');
      c.setAlpha(p.alpha);
      c.scrollSpeed = Phaser.Math.FloatBetween(0.15, 0.35);
      this.skyClouds.push(c);
    });

    // London skyline silhouette - a left-to-right march of the city's most
    // recognisable landmarks along the Thames: Westminster Abbey, the Houses
    // of Parliament with Big Ben, the London Eye, St Paul's Cathedral, the
    // Gherkin, the Shard, the Walkie-Talkie, the Cheesegrater, Tower Bridge,
    // and the Canary Wharf cluster on the eastern horizon.
    const skyline = this.add.graphics();
    const skyCol  = 0x2c3845;   // building silhouette
    const accent  = 0xf2e8b8;   // warm cream for clock face / pinnacle lights
    const cutout  = skyBlue;    // matches the sky behind the Eye, for "cutting" the wheel ring

    // Embankment running across the whole bank
    skyline.fillStyle(skyCol, 1);
    skyline.fillRect(0, 80, 800, 12);

    // ── Westminster Abbey (twin Gothic Western Towers + connecting nave) ─
    // Tower 1 (left)
    skyline.fillRect( 4, 40, 12, 40);                               // body
    skyline.fillRect( 4, 36, 12,  4);                               // cap (body width - no floating ledges)
    skyline.fillRect( 7, 28,  6,  8);                               // lantern atop the cap
    skyline.fillTriangle( 7, 28, 13, 28, 10, 22);                   // pyramid spire
    // Tower 2 (right)
    skyline.fillRect(20, 40, 12, 40);
    skyline.fillRect(20, 36, 12,  4);
    skyline.fillRect(23, 28,  6,  8);
    skyline.fillTriangle(23, 28, 29, 28, 26, 22);
    // Low connecting nave bridging the two towers down to the embankment
    skyline.fillRect(16, 60, 4, 20);

    // ── Houses of Parliament (long Gothic body, row of mini spires) ──────
    skyline.fillRect(40, 64, 168, 16);
    for (let x = 42; x <= 206; x += 5) skyline.fillRect(x, 62, 3, 2);
    [54, 78, 102, 130, 158, 186].forEach(x => {
      skyline.fillRect(x, 50, 4, 14);
      skyline.fillTriangle(x - 2, 50, x + 6, 50, x + 2, 40);
    });
    // Victoria Tower (left end - fat square tower with crenellations)
    skyline.fillRect(34, 42, 18, 22);
    skyline.fillRect(34, 39, 18,  3);                                  // cap (body width - no floating ledges)
    [36, 40, 44, 48].forEach(x => skyline.fillRect(x, 36, 2, 3));      // crenellation teeth

    // ── Big Ben / Elizabeth Tower (rises out of Parliament's east end) ───
    const bbx = 200;
    skyline.fillRect(bbx, 30, 14, 50);                                 // body, overlapping Parliament from x=200-208
    skyline.fillRect(bbx, 26, 14,  4);                                 // belfry (body width)
    skyline.fillTriangle(bbx, 26, bbx + 14, 26, bbx + 7, 12);          // pyramid spire
    // Lit clock face
    skyline.fillStyle(accent, 1);
    skyline.fillRect(bbx + 3, 38, 8, 8);
    skyline.fillStyle(skyCol, 1);
    skyline.fillRect(bbx + 6, 39, 1, 4);                               // hour hand
    skyline.fillRect(bbx + 7, 41, 4, 1);                               // minute hand

    // ── London Eye (rim, hub, spokes, pods, A-frame support) ─────────────
    const eyeX = 268, eyeY = 50, eyeR = 22;
    skyline.fillStyle(skyCol, 1);
    skyline.fillCircle(eyeX, eyeY, eyeR);                              // outer rim
    skyline.fillStyle(cutout, 1);
    skyline.fillCircle(eyeX, eyeY, eyeR - 3);                          // cut interior
    skyline.lineStyle(1, skyCol, 1);
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16;
      skyline.lineBetween(eyeX, eyeY,
        eyeX + Math.cos(a) * (eyeR - 3),
        eyeY + Math.sin(a) * (eyeR - 3));
    }
    skyline.fillStyle(skyCol, 1);
    skyline.fillCircle(eyeX, eyeY, 3);                                 // hub
    for (let i = 0; i < 16; i++) {                                     // capsule pods
      const a = (Math.PI * 2 * i) / 16;
      skyline.fillRect(
        eyeX + Math.cos(a) * eyeR - 1,
        eyeY + Math.sin(a) * eyeR - 1, 3, 3);
    }
    // A-frame support legs down to the embankment
    skyline.fillTriangle(eyeX - 1, eyeY + eyeR - 4, eyeX - 12, 80, eyeX - 9, 80);
    skyline.fillTriangle(eyeX + 1, eyeY + eyeR - 4, eyeX + 12, 80, eyeX + 9, 80);

    // ── St Paul's Cathedral (dome, lantern, cross, twin front towers) ────
    const spx = 312;
    skyline.fillRect(spx,        64, 64, 16);                          // nave
    skyline.fillRect(spx +  4, 52,  8, 14);                            // L bell tower
    skyline.fillRect(spx +  2, 50, 12,  3);
    skyline.fillTriangle(spx +  2, 50, spx + 14, 50, spx +  8, 44);
    skyline.fillRect(spx + 52, 52,  8, 14);                            // R bell tower
    skyline.fillRect(spx + 50, 50, 12,  3);
    skyline.fillTriangle(spx + 50, 50, spx + 62, 50, spx + 56, 44);
    skyline.fillRect(spx + 18, 46, 28, 18);                            // drum
    skyline.fillCircle(spx + 32, 46, 16);                              // dome
    skyline.fillRect(spx + 30, 22, 4, 8);                              // lantern
    skyline.fillRect(spx + 28, 24, 8, 2);
    skyline.fillRect(spx + 31, 14, 2, 8);                              // cross (vertical)
    skyline.fillRect(spx + 29, 16, 6, 2);                              // cross (cross-bar)

    // ── The Gherkin (30 St Mary Axe - tapered ovoid bullet) ──────────────
    const ghx = 392;
    skyline.fillRect(ghx +  2, 72, 18,  8);
    skyline.fillRect(ghx,      60, 22, 12);
    skyline.fillRect(ghx +  1, 48, 20, 12);
    skyline.fillRect(ghx +  4, 38, 14, 10);
    skyline.fillRect(ghx +  7, 30,  8,  8);
    skyline.fillRect(ghx +  9, 26,  4,  4);
    skyline.fillRect(ghx + 10, 22,  2,  4);                            // spire
    // Hint of horizontal window-bands
    skyline.fillStyle(accent, 0.18);
    [44, 52, 60, 68].forEach(y => skyline.fillRect(ghx, y, 22, 1));
    skyline.fillStyle(skyCol, 1);

    // ── The Shard (steep narrow tapering triangle) ───────────────────────
    const shx = 422;
    skyline.fillTriangle(shx, 80, shx + 30, 80, shx + 18, 6);
    skyline.fillRect(shx + 17, 0, 2, 8);                               // mast above the spire

    // ── The Walkie-Talkie (20 Fenchurch - top-heavy slab) ────────────────
    const wtx = 458;
    skyline.fillRect(wtx +  2, 56, 16, 24);
    skyline.fillRect(wtx,      50, 20,  8);
    skyline.fillRect(wtx +  1, 46, 18,  4);

    // ── The Cheesegrater (Leadenhall - sloped wedge) ─────────────────────
    const cgx = 484;
    skyline.fillTriangle(cgx, 80, cgx, 32, cgx + 24, 80);
    skyline.fillRect(cgx + 1, 26, 3, 6);                               // antenna mast

    // ── Tower Bridge (twin Gothic towers, high walkway, deck) ────────────
    const tbx  = 522;
    const tbx2 = tbx + 70;
    skyline.fillRect(tbx, 80, 96, 4);                                  // bridge deck
    [tbx, tbx2].forEach(t => {
      skyline.fillRect(t +  6, 38, 16, 42);                            // body
      skyline.fillRect(t +  4, 34, 20,  4);                            // belfry base
      skyline.fillRect(t +  8, 26, 12,  8);                            // belfry
      skyline.fillTriangle(t +  6, 26, t + 22, 26, t + 14, 12);        // spire
      skyline.fillRect(t +  4, 28,  2,  6);                            // L corner pinnacle
      skyline.fillRect(t + 22, 28,  2,  6);                            // R corner pinnacle
      skyline.fillTriangle(t +  4, 28, t +  6, 28, t +  5, 24);
      skyline.fillTriangle(t + 22, 28, t + 24, 28, t + 23, 24);
    });
    skyline.fillRect(tbx + 22, 50, 70, 5);                             // high walkway
    // Suspension chain - catenary sagging between the two tower tops, below
    // the high walkway. Sample the curve as a thin row of pixels.
    skyline.fillStyle(skyCol, 0.85);
    for (let i = 0; i <= 70; i++) {
      const t = i / 70;
      const y = 56 + Math.sin(Math.PI * t) * 8;                        // peaks at y=64 mid-span
      skyline.fillRect(tbx + 22 + i, y, 1, 1);
    }
    skyline.fillStyle(skyCol, 1);

    // ── Canary Wharf cluster (eastern horizon) ───────────────────────────
    const cwx = 666;
    skyline.fillRect(cwx,      28, 16, 52);                            // One Canada Sq
    skyline.fillTriangle(cwx, 28, cwx + 16, 28, cwx + 8, 14);          // pyramid roof
    skyline.fillStyle(accent, 0.9);
    skyline.fillRect(cwx + 7, 12, 2, 3);                               // pinnacle aviation light
    skyline.fillStyle(skyCol, 1);
    skyline.fillRect(cwx - 18, 42, 14, 38);                            // flanking tower (L)
    skyline.fillRect(cwx - 20, 39, 18,  3);
    skyline.fillRect(cwx + 22, 36, 14, 44);                            // flanking tower (R)
    skyline.fillRect(cwx + 20, 33, 18,  3);
    skyline.fillRect(cwx + 42, 54, 18, 26);                            // glass slab
    // Distant low rooftops on the far horizon
    skyline.fillRect(722, 70, 32, 10);
    skyline.fillRect(750, 64, 50, 16);

    // Scrolling waves on the river surface - alternating tildes and dashes,
    // each at varied alpha and speed, so the water looks like a moving sheet
    // of waves rather than scattered debris.
    this.waves = [];
    for (let i = 0; i < 36; i++) {
      const isTilde = i % 2 === 0;
      const w = this.add.image(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(110, H - 14),
        isTilde ? 'wave-tilde' : 'wave-dash'
      );
      w.setAlpha(Phaser.Math.FloatBetween(0.35, 0.7));
      // Foreground waves drift slightly faster - subtle parallax against the static skyline
      w.scrollSpeed = Phaser.Math.FloatBetween(0.8, 2.2);
      this.waves.push(w);
    }

    // Player (Ed Davey on his boat, fixed x, moves up/down)
    this.kayak = this.physics.add.sprite(140, H / 2, 'ed');
    this.kayak.setDisplaySize(100, 54);
    // Hitbox sized in *texture* pixels (Phaser scales it back up to world pixels).
    // The PNG is 59x32; Ed plus paddleboard fills almost all of it - we just trim
    // the transparent top strip so the paddle tip doesn't extend the hitbox.
    this.kayak.body.setSize(57, 28);
    this.kayak.body.setOffset(1, 3);
    this.kayak.body.allowGravity = false;
    this.kayak.body.setCollideWorldBounds(true);

    // Water wake - foam streaming back from behind the paddleboard.
    [
      { key: 'wake-foam',  y: 16, freq: 80 },
      { key: 'wake-froth', y: 19, freq: 110 },
    ].forEach(w => {
      this.add.particles(0, 0, w.key, {
        follow: this.kayak,
        followOffset: { x: -42, y: w.y },
        lifespan: 650,
        speedX: { min: -100, max: -60 },
        speedY: { min: -6, max: 6 },
        scale: { start: 1, end: 0.3 },
        alpha: { start: 0.8, end: 0 },
        frequency: w.freq,
      });
    });

    // Yachts
    this.yachts = this.physics.add.group();

    // Ballots
    this.voteCount = 0;
    this.ballots = this.physics.add.group();
    this.totalVotes = 8;

    // Yacht hits boat
    this.hit = false;
    this.physics.add.overlap(this.kayak, this.yachts, () => {
      if (!this.hit) this.takeDamage();
    });

    // Collect ballots
    this.physics.add.overlap(this.kayak, this.ballots, (_, ballot) => {
      ballot.destroy();
      this.voteCount++;
      Sfx.collect();
      MobileControls.setVotes(this.voteCount);
      if (this.voteCount >= this.totalVotes) this.levelComplete();
    });

    // Spawn timer - yachts and ballots arrive from the right
    this.spawnTimer = 0;
    this.yachtInterval = 1800;
    this.ballotInterval = 1200;
    this.nextYacht = this.yachtInterval;
    this.nextBallot = 600;

    // Controls
    Controls.bindKeyboard(this);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    MobileControls.setResetHandler(() => this.scene.restart());
    // TEMP: dev skip - remove before ship
    this.nKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

    // UI - info lives in the chrome bar, never on the canvas
    this.health = 3;
    MobileControls.showHud({ totalVotes: this.totalVotes, lives: this.health });
    MobileControls.setControlsHint(['UP / DOWN: dodge yachts', 'R: restart']);
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

  spawnYacht() {
    const H = 450;
    const y = Phaser.Math.Between(50, H - 50);
    const s = this.yachts.create(840, y, 'shark');
    s.setDisplaySize(60, 60);                 // upscale the 40x40 sprite for visibility
    s.setFlipX(true);                         // bow faces the direction of travel (left)
    s.body.allowGravity = false;
    // Hitbox sized in texture pixels (40x40 source). Yacht graphic fills most of the
    // frame; trim a bit of empty sky around the mast and the waterline below the hull.
    s.body.setSize(36, 30);
    s.body.setOffset(2, 5);
    s.setVelocityX(-260);

    // Wake trail behind the yacht - same foam particles as Ed's paddleboard,
    // emitted from the yacht's stern (its right side, since it's moving left)
    // and given a bit of rightward drift so they appear to streak out behind it.
    s.wakeEmitters = [
      { key: 'wake-foam',  freq: 70  },
      { key: 'wake-froth', freq: 100 },
    ].map(w => this.add.particles(0, 0, w.key, {
      follow: s,
      // Emit at the bottom of the hull (waterline), then drift right and slightly
      // down so the foam streaks out behind the left-moving yacht.
      followOffset: { x: 0, y: 22 },
      lifespan: 1100,
      speedX: { min: 0, max: 25 },
      speedY: { min: -2, max: 4 },
      scale: { start: 1, end: 0.3 },
      alpha: { start: 0.8, end: 0 },
      frequency: w.freq,
    }));
  }

  spawnBallot() {
    const H = 450;
    const y = Phaser.Math.Between(40, H - 40);
    const m = this.ballots.create(840, y, 'marble');
    m.body.allowGravity = false;
    m.setVelocityX(-180);
  }

  takeDamage() {
    this.hit = true;
    this.health--;
    Sfx.hit();
    MobileControls.setLives(this.health);
    this.kayak.setAlpha(0.3);

    this.time.delayedCall(800, () => {
      if (this.kayak.active) {
        this.kayak.setAlpha(1);
        this.hit = false;
      }
    });

    if (this.health <= 0) this.gameOver();
  }

  gameOver() {
    this.physics.pause();
    Sfx.gameOver();
    this.add.text(400, 180, 'Ed Davey fell off his paddleboard!', {
      fontSize: '32px', fill: '#ff6b6b', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);
    this.add.text(400, 230, MobileControls.isTouch() ? 'Tap to try again' : 'Press SPACE to try again', {
      fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
    this.input.once('pointerdown', () => this.scene.restart());
  }

  goNext() {
    this.scene.start('NarrativeScene', {
      text: 'Keir Toolson lost some of his votes in Wales - help him find them.\n\nAnd oh no - the red walls are crumbling! Maybe throwing right wing rhetoric at them will fix it...',
      next: 'Level3Keir'
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
    }).setOrigin(0.5);
    this.add.text(400, 235, MobileControls.isTouch() ? 'Tap to continue' : 'Press SPACE to continue', {
      fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.goNext());
    this.input.once('pointerdown', () => this.goNext());
  }

  update(time, delta) {
    // Drift waves leftward - each at its own speed for parallax
    this.waves.forEach(w => {
      w.x -= w.scrollSpeed;
      if (w.x < -16) w.x = 810;
    });
    // Drift clouds slowly across the sky
    this.skyClouds.forEach(c => {
      c.x -= c.scrollSpeed;
      if (c.x < -30) c.x = 830;
    });

    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.scene.restart();
      return;
    }

    // TEMP: dev skip - remove before ship
    if (Phaser.Input.Keyboard.JustDown(this.nKey)) {
      this.skipLevel();
      return;
    }

    if (Controls.up()) {
      this.kayak.setVelocityY(-240);
    } else if (Controls.down()) {
      this.kayak.setVelocityY(240);
    } else {
      this.kayak.setVelocityY(0);
    }

    this.spawnTimer += delta;

    if (this.spawnTimer >= this.nextYacht) {
      this.spawnYacht();
      this.nextYacht = this.spawnTimer + this.yachtInterval;
      this.yachtInterval = Math.max(800, this.yachtInterval - 40);
    }

    if (this.spawnTimer >= this.nextBallot) {
      this.spawnBallot();
      this.nextBallot = this.spawnTimer + this.ballotInterval;
    }

    this.yachts.getChildren().forEach(s => {
      if (s.x < -80) {
        if (s.wakeEmitters) s.wakeEmitters.forEach(e => e.destroy());
        s.destroy();
      }
    });
    this.ballots.getChildren().forEach(m => {
      if (m.x < -20) m.destroy();
    });
  }
}

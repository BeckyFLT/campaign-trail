class Level4John extends Phaser.Scene {
  constructor() {
    super('Level4John');
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

    makeTexture('sky-bg', W, H, 0x87ceeb);

    // Dodgy bar charts - 4 variants, each pairing Reform teal-blue against
    // a different opposition colour (red / green / yellow / orange).
    // Reform's bar is suspiciously tall in every one.
    this.makeChartTexture('chart-red',    0xc81d25);
    this.makeChartTexture('chart-green',  0x44aa44);
    this.makeChartTexture('chart-yellow', 0xf2cc1d);
    this.makeChartTexture('chart-orange', 0xf2a225);

    // Ballot paper texture
    this.makeBallotTexture();

    makeTexture('cloud', 8, 8, 0xffffff);

    // Rainbow trail particles - colours pulled from the unicorn's tail.
    makeTexture('trail-pink', 4, 4, 0xff4477);
    makeTexture('trail-gold', 4, 4, 0xffd700);
    makeTexture('trail-blue', 4, 4, 0x44aaff);

    this.add.image(W / 2, H / 2, 'sky-bg');

    // Distant horizon at the bottom - two layers of hazy hills/mountain tops
    // so John feels like he's flying high above the country, not in empty sky.
    {
      const horizon = this.add.graphics();
      // Far layer (paler, hazier sage green)
      horizon.fillStyle(0x88a880, 0.55);
      horizon.fillPoints([
        {x:0,y:430},{x:50,y:415},{x:120,y:425},{x:200,y:410},
        {x:280,y:420},{x:380,y:405},{x:480,y:418},{x:570,y:408},
        {x:680,y:425},{x:780,y:412},{x:800,y:418},
        {x:800,y:450},{x:0,y:450}
      ], true);
      // Near layer (slightly darker, closer to the player - forest green)
      horizon.fillStyle(0x507a4f, 0.7);
      horizon.fillPoints([
        {x:0,y:444},{x:60,y:436},{x:140,y:443},{x:220,y:432},
        {x:330,y:440},{x:430,y:430},{x:530,y:438},{x:640,y:428},
        {x:740,y:440},{x:800,y:435},
        {x:800,y:450},{x:0,y:450}
      ], true);
    }

    // Drifting cloud dots for speed feel
    this.clouds = [];
    for (let i = 0; i < 25; i++) {
      const c = this.add.image(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(20, H - 20),
        'cloud'
      );
      c.setAlpha(0.5);
      this.clouds.push(c);
    }

    // Player (John McWho? on unicorn - fixed x, moves up/down)
    this.unicorn = this.physics.add.sprite(140, H / 2, 'john');
    this.unicorn.setDisplaySize(100, 66);
    // Hitbox sized in texture pixels (50x33 source). Trim a couple of pixels around
    // the edges so the body matches John + unicorn but not the empty surrounding sky.
    this.unicorn.body.setSize(46, 28);
    this.unicorn.body.setOffset(2, 3);
    this.unicorn.body.allowGravity = false;
    this.unicorn.body.setCollideWorldBounds(true);

    // Rainbow magic trail - three streams of pixels (in the unicorn's tail
    // colours) emerging from across the whole unicorn body and drifting
    // backwards as it flies. Sparse so it reads as magic, not as a flame.
    [
      { key: 'trail-pink', y:  2 },
      { key: 'trail-gold', y: 10 },
      { key: 'trail-blue', y: 18 },
    ].forEach(t => {
      this.add.particles(0, 0, t.key, {
        follow: this.unicorn,
        followOffset: { x: -44, y: t.y },
        lifespan: 700,
        speedX: { min: -110, max: -70 },
        speedY: { min: -8, max: 8 },
        scale: { start: 1, end: 0.3 },
        alpha: { start: 0.85, end: 0 },
        frequency: 130,
      });
    });

    // Bar charts (obstacles)
    this.charts = this.physics.add.group();

    // Ballots
    this.voteCount = 0;
    this.ballots = this.physics.add.group();
    this.totalVotes = 8;

    // Bar chart hits unicorn
    this.hit = false;
    this.physics.add.overlap(this.unicorn, this.charts, () => {
      if (!this.hit) this.takeDamage();
    });

    // Collect ballots
    this.physics.add.overlap(this.unicorn, this.ballots, (_, ballot) => {
      ballot.destroy();
      this.voteCount++;
      Sfx.collect();
      MobileControls.setVotes(this.voteCount);
      if (this.voteCount >= this.totalVotes) this.levelComplete();
    });

    // Spawn timing
    this.spawnTimer = 0;
    this.chartInterval = 1400;
    this.ballotInterval = 900;
    this.nextChart = this.chartInterval;
    this.nextBallot = 600;

    // Controls
    Controls.bindKeyboard(this);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    MobileControls.setResetHandler(() => this.scene.restart());
    // TEMP: dev skip - remove before ship
    this.nKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

    // Health
    this.health = 3;

    // UI - info lives in the chrome bar, never on the canvas
    MobileControls.showHud({ totalVotes: this.totalVotes, lives: this.health });
    MobileControls.setControlsHint(['UP / DOWN: dodge dodgy bar charts', 'collect ballots', 'R: restart']);
  }

  // Bar-chart leaflet texture: opposition colour vs Reform teal (Reform bigger).
  // 32x32 square card so it doesn't look like a long missile.
  makeChartTexture(key, oppColor) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Leaflet background
    g.fillStyle(0xfafafa, 1);
    g.fillRect(0, 0, 32, 32);
    // Border
    g.fillStyle(0x444444, 1);
    g.fillRect(0, 0, 32, 1);
    g.fillRect(0, 31, 32, 1);
    g.fillRect(0, 0, 1, 32);
    g.fillRect(31, 0, 1, 32);
    // Header band (neutral grey - blue blended into the sky)
    g.fillStyle(0x666666, 1);
    g.fillRect(2, 2, 28, 4);
    // Both bars artificially the same height - "neck and neck!" - the dodgy bit.
    g.fillStyle(oppColor, 1);
    g.fillRect(7, 14, 6, 16);
    g.fillStyle(0x12b5cb, 1);
    g.fillRect(19, 14, 6, 16);
    g.generateTexture(key, 32, 32);
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

  spawnChart() {
    const y = Phaser.Math.Between(40, 410);
    const variants = ['chart-red', 'chart-green', 'chart-yellow', 'chart-orange'];
    if (this._chartIdx === undefined) this._chartIdx = 0;
    const key = variants[this._chartIdx];
    this._chartIdx = (this._chartIdx + 1) % variants.length;
    const c = this.charts.create(840, y, key);
    c.body.allowGravity = false;
    c.setVelocityX(-360);
  }

  spawnBallot() {
    const y = Phaser.Math.Between(40, 410);
    const m = this.ballots.create(840, y, 'marble');
    m.body.allowGravity = false;
    m.setVelocityX(-300);
  }

  takeDamage() {
    this.hit = true;
    this.health--;
    Sfx.hit();
    MobileControls.setLives(this.health);
    this.unicorn.setAlpha(0.3);
    this.time.delayedCall(800, () => {
      if (this.unicorn.active) {
        this.unicorn.setAlpha(1);
        this.hit = false;
      }
    });
    if (this.health <= 0) this.gameOver();
  }

  gameOver() {
    this.physics.pause();
    Sfx.gameOver();
    this.add.text(400, 180, 'John was tricked by a dodgy bar chart!', {
      fontSize: '24px', fill: '#e63946', stroke: '#fff', strokeThickness: 3,
      align: 'center', wordWrap: { width: 700 }
    }).setOrigin(0.5);
    this.add.text(400, 230, MobileControls.isTouch() ? 'Tap to try again' : 'Press SPACE to try again', {
      fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
    this.input.once('pointerdown', () => this.scene.restart());
  }

  goNext() {
    this.scene.start('VictoryScene', { card: 'tally' });
  }

  skipLevel() {
    this.physics.pause();
    this.goNext();
  }

  levelComplete() {
    this.physics.pause();
    Sfx.complete();
    this.add.text(400, 180, 'Level Complete!', {
      fontSize: '40px', fill: '#ffd60a', stroke: '#1a1a2e', strokeThickness: 4
    }).setOrigin(0.5);
    this.add.text(400, 235, MobileControls.isTouch() ? 'Tap to continue' : 'Press SPACE to continue', {
      fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.goNext());
    this.input.once('pointerdown', () => this.goNext());
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.scene.restart();
      return;
    }

    // TEMP: dev skip - remove before ship
    if (Phaser.Input.Keyboard.JustDown(this.nKey)) {
      this.skipLevel();
      return;
    }

    // Drift clouds
    this.clouds.forEach(c => {
      c.x -= 1.2;
      if (c.x < -10) c.x = 810;
    });

    if (Controls.up()) {
      this.unicorn.setVelocityY(-240);
    } else if (Controls.down()) {
      this.unicorn.setVelocityY(240);
    } else {
      this.unicorn.setVelocityY(0);
    }

    this.spawnTimer += delta;

    if (this.spawnTimer >= this.nextChart) {
      this.spawnChart();
      this.nextChart = this.spawnTimer + this.chartInterval;
      this.chartInterval = Math.max(800, this.chartInterval - 40);
    }

    if (this.spawnTimer >= this.nextBallot) {
      this.spawnBallot();
      this.nextBallot = this.spawnTimer + this.ballotInterval;
    }

    this.charts.getChildren().forEach(c => { if (c.x < -80) c.destroy(); });
    this.ballots.getChildren().forEach(m => { if (m.x < -20) m.destroy(); });
  }
}

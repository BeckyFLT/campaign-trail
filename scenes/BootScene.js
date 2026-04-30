class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Hand-painted character PNGs.
    this.load.image('spanner', 'assets/characters/spanner.png');
    this.load.image('ed',      'assets/characters/ed.png');
    this.load.image('keir',    'assets/characters/keir.png');
    this.load.image('john',    'assets/characters/john.png');
    // Backgrounds.
    this.load.image('manchester-skyline', 'assets/backgrounds/manchester-skyline.png');
    // Title card shown as the very first screen.
    this.load.image('first-card', 'assets/first-card.png');
  }

  create() {
    // Clear the run timer fields - Level1Spanner.create() starts the clock when
    // Spanner's level actually begins, so the narrative cards aren't counted.
    this.registry.set('gameStart', null);
    this.registry.set('completionTime', null);

    // Manifesto-scroll projectile and flag textures still drawn procedurally;
    // the four character textures come in from preload() as PNGs.
    this.drawManifesto();
    this.drawFlags();
    this.drawFarage();

    // Crisp pixel-art rendering for the character sprites only - text stays smooth.
    ['spanner', 'ed', 'keir', 'john', 'pizza', 'flag-uk', 'flag-scotland', 'farage'].forEach(key => {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    this.scene.start('IntroCardScene', {
      next: 'NarrativeScene',
      nextData: {
        text: "Nigel Farage is on the brink of taking over the UK. The opposition parties are scattered, fighting their own corners. Spanner Spencer, Ed Davey, Keir Toolson and John McWho? must collect every last vote - but watch out for in-fighting, billionaires and dodgy bar charts trying to stop them.",
        showChars: true,
        next: 'NarrativeScene',
        nextData: {
          text: "Spanner Spencer starts the hunt for votes in the streets of Manchester.\n\nMind the Reform bots!",
          next: 'Level1Spanner'
        }
      }
    });
  }

  // Rolled-up Labour manifesto scroll (replaces pizza). 22x22.
  drawManifesto() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf0e0c0, 1);
    g.fillRect(2, 5, 18, 12);
    g.fillStyle(0xc8a878, 1);
    g.fillRect(0, 5, 4, 12);
    g.fillRect(18, 5, 4, 12);
    g.fillStyle(0x444444, 1);
    g.fillRect(5, 8, 12, 1);
    g.fillRect(5, 10, 10, 1);
    g.fillRect(5, 12, 11, 1);
    g.fillRect(5, 14, 9, 1);
    g.fillStyle(0xc81d25, 1);
    g.fillRect(10, 3, 2, 16);
    g.fillStyle(0x8e0a14, 1);
    g.fillRect(9, 10, 4, 2);
    g.generateTexture('pizza', 22, 22);
    g.destroy();
  }

  // Procedural caricature of Posh Nige laughing - used on the victory cards.
  // Receding hair, scrunched-up laughter eyes, big toothy grin, Reform-teal tie.
  drawFarage() {
    const W = 84, H = 132;
    const skin       = 0xf4b890;
    const skinShade  = 0xd89070;
    const skinRosy   = 0xee8c8c;
    const hair       = 0x735a3a;
    const dark       = 0x1a1a1a;
    const suit       = 0x222a3a;
    const suitShade  = 0x141a26;
    const tie        = 0x12b5cb;

    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Suit jacket
    g.fillStyle(suit, 1);
    g.fillRect(8, 96, 68, 36);
    // Lapels
    g.fillStyle(suitShade, 1);
    g.fillTriangle(20, 96, 42, 96, 36, 116);
    g.fillTriangle(64, 96, 42, 96, 48, 116);

    // Shirt triangle
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(36, 96, 48, 96, 42, 112);

    // Reform-teal tie
    g.fillStyle(tie, 1);
    g.fillTriangle(38, 100, 46, 100, 42, 108);   // knot
    g.fillRect(40, 108, 4, 24);                  // tie body

    // Neck
    g.fillStyle(skin, 1);
    g.fillRect(34, 86, 16, 12);
    g.fillStyle(skinShade, 1);
    g.fillRect(34, 95, 16, 2);

    // Head - rounded rectangle with softened corners
    g.fillStyle(skin, 1);
    g.fillRect(20, 36, 44, 54);
    g.fillRect(18, 42, 2, 42);
    g.fillRect(64, 42, 2, 42);
    g.fillRect(22, 34, 40, 2);
    g.fillRect(24, 32, 36, 2);

    // Ears
    g.fillRect(16, 56, 4, 10);
    g.fillRect(64, 56, 4, 10);

    // Receding hair (M-shape across the top, side tufts)
    g.fillStyle(hair, 1);
    g.fillRect(20, 30, 44, 6);
    g.fillRect(18, 36, 4, 18);
    g.fillRect(62, 36, 4, 18);
    // Carve out the receding bits with skin colour
    g.fillStyle(skin, 1);
    g.fillRect(28, 30, 8, 6);
    g.fillRect(48, 30, 8, 6);
    // Tiny centre tuft
    g.fillStyle(hair, 1);
    g.fillRect(38, 30, 8, 4);

    // Eyebrows raised in laughter
    g.fillStyle(dark, 1);
    g.fillRect(28, 48, 10, 2);
    g.fillRect(46, 48, 10, 2);

    // Closed/squinting laughter eyes - drawn as up-curved arcs
    g.fillRect(29, 56, 8, 1);
    g.fillRect(28, 55, 2, 1);
    g.fillRect(36, 55, 2, 1);
    g.fillRect(47, 56, 8, 1);
    g.fillRect(46, 55, 2, 1);
    g.fillRect(54, 55, 2, 1);

    // Laugh creases under the eyes
    g.fillStyle(skinShade, 1);
    g.fillRect(28, 60, 2, 1);
    g.fillRect(54, 60, 2, 1);

    // Rosy cheeks
    g.fillStyle(skinRosy, 1);
    g.fillRect(24, 64, 4, 4);
    g.fillRect(56, 64, 4, 4);

    // Wide-open laughing mouth
    g.fillStyle(0x4a1a1a, 1);
    g.fillRect(28, 70, 28, 14);
    // Top teeth row
    g.fillStyle(0xffffff, 1);
    g.fillRect(28, 70, 28, 5);
    // Tooth gap lines
    g.fillStyle(skinShade, 1);
    for (let x = 32; x <= 52; x += 4) g.fillRect(x, 71, 1, 4);
    // Bottom teeth row
    g.fillStyle(0xffffff, 1);
    g.fillRect(32, 80, 20, 3);
    // Lower lip
    g.fillStyle(skinShade, 1);
    g.fillRect(28, 84, 28, 2);
    g.fillRect(34, 88, 16, 2);

    g.generateTexture('farage', W, H);
    g.destroy();
  }

  // Tiny Union Jack and Saltire textures for the front-card character flags.
  drawFlags() {
    const W = 60, H = 36;

    // Union Jack
    let g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x012169, 1);
    g.fillRect(0, 0, W, H);
    // White saltire (X)
    g.lineStyle(8, 0xffffff, 1);
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(W, H);
    g.moveTo(W, 0); g.lineTo(0, H);
    g.strokePath();
    // Red diagonals on top of white
    g.lineStyle(4, 0xc8102e, 1);
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(W, H);
    g.moveTo(W, 0); g.lineTo(0, H);
    g.strokePath();
    // White cross (vertical + horizontal)
    g.fillStyle(0xffffff, 1);
    g.fillRect(W / 2 - 5, 0, 10, H);
    g.fillRect(0, H / 2 - 5, W, 10);
    // Red cross on top (narrower)
    g.fillStyle(0xc8102e, 1);
    g.fillRect(W / 2 - 3, 0, 6, H);
    g.fillRect(0, H / 2 - 3, W, 6);
    g.generateTexture('flag-uk', W, H);
    g.destroy();

    // Scotland (Saltire)
    g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x005eb8, 1);
    g.fillRect(0, 0, W, H);
    g.lineStyle(6, 0xffffff, 1);
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(W, H);
    g.moveTo(W, 0); g.lineTo(0, H);
    g.strokePath();
    g.generateTexture('flag-scotland', W, H);
    g.destroy();
  }
}

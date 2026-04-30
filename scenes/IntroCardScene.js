// Static image card shown as the very first screen of the game (the "Campaign Trail"
// title page with the cast and a PLAY button drawn into the artwork). Click or SPACE
// advances to the next scene; the artwork itself is the call to action so we don't
// overlay any continue text on top of it.
class IntroCardScene extends Phaser.Scene {
  constructor() {
    super('IntroCardScene');
  }

  init(data) {
    this.nextScene = (data && data.next) || null;
    this.nextData  = (data && data.nextData) || null;
  }

  create() {
    MobileControls.hide();
    MobileControls.hideHud();
    this.cameras.main.setBackgroundColor('#0d1b2a');

    // 800x450 image fills the entire canvas
    this.add.image(400, 225, 'first-card').setDisplaySize(800, 450);

    this.input.keyboard.once('keydown-SPACE', () => this.advance());
    this.input.once('pointerdown', () => this.advance());
  }

  advance() {
    if (this.nextScene) this.scene.start(this.nextScene, this.nextData);
  }
}

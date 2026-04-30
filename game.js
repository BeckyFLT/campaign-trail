// Render every text at 2x density so it stays crisp when the 800x450 canvas
// is upscaled by the browser to fit the viewport. Without this the canvas
// upscale interpolates the text into blur on big screens / phones.
const _origAddText = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
  const merged = Object.assign({ fontFamily: 'Montserrat, sans-serif' }, style || {});
  return _origAddText.call(this, x, y, text, merged).setResolution(2);
};

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: '#2d6a4f',
  scale: {
    parent: 'game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: [BootScene, IntroCardScene, NarrativeScene, VictoryScene, Level1Spanner, Level2Ed, Level3Keir, Level4John]
};

const game = new Phaser.Game(config);

// Mobile browsers sometimes report stale viewport sizes during a rotation - the
// orientationchange event fires before the new layout has fully settled, so
// Phaser's scale manager can lock onto the old (smaller) dimensions and the
// canvas ends up tiny in landscape. Refresh the scale a couple of times after
// the rotation to catch up once the browser has actually resized.
window.addEventListener('orientationchange', () => {
  setTimeout(() => game.scale.refresh(), 250);
  setTimeout(() => game.scale.refresh(), 600);
});

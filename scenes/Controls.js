// Centralised input. Each level scene calls Controls.bindKeyboard(this) in create(),
// then reads Controls.left() etc. in update(). Touch flags are set by MobileControls overlay.
const Controls = {
  _cursors: null,
  _zKey: null,
  _touch: { left: false, right: false, up: false, down: false, action: false },
  _touchActionLatch: false,

  bindKeyboard(scene) {
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._zKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  },

  left()  { return this._cursors.left.isDown  || this._touch.left;  },
  right() { return this._cursors.right.isDown || this._touch.right; },
  up()    { return this._cursors.up.isDown    || this._touch.up;    },
  down()  { return this._cursors.down.isDown  || this._touch.down;  },

  // Edge-triggered: true once per press, for both keyboard and touch.
  actionJustDown() {
    if (Phaser.Input.Keyboard.JustDown(this._zKey)) return true;
    if (this._touch.action && !this._touchActionLatch) {
      this._touchActionLatch = true;
      return true;
    }
    return false;
  },

  setTouch(button, isDown) {
    this._touch[button] = isDown;
    if (button === 'action' && !isDown) this._touchActionLatch = false;
  }
};

// On-screen touch buttons. Touch-only - invisible on non-touch devices.
// Each level scene calls MobileControls.show('platformer'|'autoscroller', { actionLabel })
// in create(). Non-level scenes (Narrative, Victory) call MobileControls.hide().
const MobileControls = {
  _root: null,
  _buttons: {},
  _isTouch: false,

  init() {
    this._isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    document.body.classList.toggle('is-touch', this._isTouch);
    document.body.classList.toggle('is-desktop', !this._isTouch);

    // HUD reset button - wired on both desktop and touch
    const resetBtn = document.getElementById('hud-reset');
    if (resetBtn) {
      resetBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this._onReset) this._onReset();
      });
    }

    if (!this._isTouch) return;

    this._root = document.getElementById('mobile-controls');
    document.querySelectorAll('.mc-btn').forEach(btn => {
      const key = btn.dataset.key;
      this._buttons[key] = btn;

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        Controls.setTouch(key, true);
        btn.classList.add('active');
      });

      const release = () => {
        Controls.setTouch(key, false);
        btn.classList.remove('active');
      };
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);

      // Block context menu on long-press
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  },

  show(mode, opts = {}) {
    if (!this._isTouch) return;
    this._root.hidden = false;

    const visible = mode === 'platformer'
      ? ['left', 'right', 'up', 'action']
      : mode === 'autoscroller'
      ? ['up', 'down']
      : [];

    Object.entries(this._buttons).forEach(([key, btn]) => {
      btn.classList.toggle('show', visible.includes(key));
      btn.classList.remove('active');
      Controls.setTouch(key, false);
    });

    if (opts.actionLabel && this._buttons.action) {
      this._buttons.action.textContent = opts.actionLabel;
    }
  },

  hide() {
    if (!this._isTouch) return;
    if (this._root) this._root.hidden = true;
    Object.entries(this._buttons).forEach(([key, btn]) => {
      btn.classList.remove('show', 'active');
      Controls.setTouch(key, false);
    });
  },

  isTouch() { return this._isTouch; },

  showHud({ totalVotes, lives }) {
    document.getElementById('hud').hidden = false;
    document.getElementById('hud-votes-total').textContent = totalVotes;
    document.getElementById('hud-votes-current').textContent = '0';
    document.getElementById('hud-controls').textContent = '';
    const livesEl = document.getElementById('hud-lives');
    if (lives !== undefined) {
      livesEl.hidden = false;
      document.getElementById('hud-lives-count').textContent = lives;
    } else {
      livesEl.hidden = true;
    }
  },

  setVotes(n) {
    document.getElementById('hud-votes-current').textContent = n;
  },

  setLives(n) {
    document.getElementById('hud-lives-count').textContent = n;
  },

  // Level-specific controls hint - only renders on desktop (mobile has touch buttons).
  // Pass an array of segments so the bar can space them out cleanly via CSS gap.
  setControlsHint(segments) {
    if (this._isTouch) return;
    const el = document.getElementById('hud-controls');
    el.innerHTML = '';
    if (!segments) return;
    const parts = Array.isArray(segments) ? segments : [segments];
    parts.forEach(part => {
      const span = document.createElement('span');
      span.textContent = part;
      el.appendChild(span);
    });
  },

  hideHud() {
    document.getElementById('hud').hidden = true;
    this._onReset = null;
  },

  setResetHandler(fn) {
    this._onReset = fn;
  }
};

window.addEventListener('DOMContentLoaded', () => MobileControls.init());

// Try to go fullscreen on first user interaction - hides the browser address bar.
// Best-effort: works on Android Chrome; iOS Safari ignores this on iPhone.
window.addEventListener('pointerdown', function tryFullscreen() {
  if (!MobileControls.isTouch()) return;
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
  if (req && !document.fullscreenElement) {
    try { req.call(el); } catch (e) { /* user gesture or unsupported */ }
  }
}, { once: true });

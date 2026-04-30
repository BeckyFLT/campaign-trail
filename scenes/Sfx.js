// Tiny synthesized sound-effect library - uses WebAudio directly so no asset files.
// Browsers require a user gesture before AudioContext can start; we lazy-init on first use.
const Sfx = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function blip(freq, duration, type = 'square', vol = 0.08, slideTo = null, delay = 0) {
    const c = getCtx();
    const start = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, start + duration);
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  function noise(duration, vol = 0.08, filterFreq = 1000) {
    const c = getCtx();
    const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * duration)), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    src.buffer = buffer;
    src.connect(filter).connect(gain).connect(c.destination);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    src.start();
  }

  return {
    collect:  () => { blip(523.25, 0.05, 'square', 0.08); blip(659.25, 0.07, 'square', 0.08, null, 0.05); },
    jump:     () => blip(220, 0.08, 'square', 0.05, 440),
    swing:    () => { blip(180, 0.04, 'sawtooth', 0.07, 90); noise(0.04, 0.03, 2000); },
    hit:      () => blip(440, 0.18, 'sawtooth', 0.09, 110),
    zap:      () => { blip(880, 0.06, 'square', 0.08, 1760); noise(0.1, 0.05, 4000); },
    throwSfx: () => { blip(300, 0.08, 'sawtooth', 0.05, 500); noise(0.06, 0.03, 1200); },
    smash:    () => { blip(80, 0.18, 'sawtooth', 0.12, 40); noise(0.22, 0.08, 600); },
    complete: () => {
      blip(523.25, 0.1, 'square', 0.09);
      blip(659.25, 0.1, 'square', 0.09, null, 0.1);
      blip(783.99, 0.1, 'square', 0.09, null, 0.2);
      blip(1046.5, 0.3, 'square', 0.09, null, 0.3);
    },
    gameOver: () => {
      blip(440, 0.2, 'sawtooth', 0.1, 220);
      blip(220, 0.4, 'sawtooth', 0.1, 110, 0.2);
    },
    select:   () => blip(660, 0.06, 'square', 0.06),
    copy:     () => { blip(880, 0.05, 'sine', 0.06); blip(1320, 0.08, 'sine', 0.06, null, 0.05); },
  };
})();

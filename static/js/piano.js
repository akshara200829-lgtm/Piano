const WHITE_NOTES = [
  { note: 'C4', label: 'C', kbd: 'a', freq: 261.63, color: '#ff6ec7' },
  { note: 'D4', label: 'D', kbd: 's', freq: 293.66, color: '#c084fc' },
  { note: 'E4', label: 'E', kbd: 'd', freq: 329.63, color: '#818cf8' },
  { note: 'F4', label: 'F', kbd: 'f', freq: 349.23, color: '#60a5fa' },
  { note: 'G4', label: 'G', kbd: 'g', freq: 392.00, color: '#34d399' },
  { note: 'A4', label: 'A', kbd: 'h', freq: 440.00, color: '#fbbf24' },
  { note: 'B4', label: 'B', kbd: 'j', freq: 493.88, color: '#f87171' },
];

const BLACK_NOTES = [
  { note: 'C#4', label: 'C#', kbd: 'w', freq: 277.18, color: '#e879f9', afterWhite: 0 },
  { note: 'D#4', label: 'D#', kbd: 'e', freq: 311.13, color: '#a78bfa', afterWhite: 1 },
  { note: 'F#4', label: 'F#', kbd: 't', freq: 369.99, color: '#7dd3fc', afterWhite: 3 },
  { note: 'G#4', label: 'G#', kbd: 'y', freq: 415.30, color: '#86efac', afterWhite: 4 },
  { note: 'A#4', label: 'A#', kbd: 'u', freq: 466.16, color: '#fcd34d', afterWhite: 5 },
];

let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playNote(freq) {
  try {
    const ctx = getAudio();
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    gain1.gain.setValueAtTime(0.45, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    gain2.gain.setValueAtTime(0.12, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc1.start(); osc1.stop(ctx.currentTime + 1.5);
    osc2.start(); osc2.stop(ctx.currentTime + 1.0);
  } catch (e) { console.warn('Audio error:', e); }
}

function showNote(label, color) {
  const bubble = document.getElementById('note-bubble');
  bubble.textContent = label;
  bubble.style.background = 'linear-gradient(135deg, ' + color + ', #a855f7, #60a5fa)';
  bubble.classList.add('show');
  clearTimeout(bubble._hideTimer);
  bubble._hideTimer = setTimeout(() => bubble.classList.remove('show'), 750);
}

function spawnParticles(clientX, clientY, color) {
  const container = document.getElementById('particles');
  for (let i = 0; i < 7; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.background = color;
    p.style.left = (clientX + (Math.random() - 0.5) * 30) + 'px';
    p.style.top = (clientY - 10) + 'px';
    p.style.animationDelay = (Math.random() * 0.2) + 's';
    container.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

function triggerKey(el, freq, label, color) {
  el.classList.add('pressed');
  playNote(freq);
  showNote(label, color);
  const rect = el.getBoundingClientRect();
  spawnParticles(rect.left + rect.width / 2, rect.top, color);
  setTimeout(() => el.classList.remove('pressed'), 180);
}

const whiteContainer = document.getElementById('white-keys');
const blackContainer = document.getElementById('black-keys');
const keyMap = {};

WHITE_NOTES.forEach(n => {
  const key = document.createElement('div');
  key.className = 'white-key';
  key.setAttribute('role', 'button');
  key.setAttribute('aria-label', 'Note ' + n.note);
  key.innerHTML = '<span class="key-label">' + n.kbd.toUpperCase() + '</span>';
  const fire = (e) => { e.preventDefault(); triggerKey(key, n.freq, n.label, n.color); };
  key.addEventListener('mousedown', fire);
  key.addEventListener('touchstart', fire, { passive: false });
  whiteContainer.appendChild(key);
  keyMap[n.kbd] = { el: key, freq: n.freq, label: n.label, color: n.color };
});

window.addEventListener('load', function () {
  const firstWhite = whiteContainer.querySelector('.white-key');
  const keyW = firstWhite ? firstWhite.offsetWidth : 52;
  const keyGap = 4;
  BLACK_NOTES.forEach(n => {
    const key = document.createElement('div');
    key.className = 'black-key';
    key.setAttribute('role', 'button');
    key.setAttribute('aria-label', 'Note ' + n.note);
    const offset = n.afterWhite * (keyW + keyGap) + keyW * 0.65;
    key.style.left = offset + 'px';
    const fire = (e) => { e.preventDefault(); triggerKey(key, n.freq, n.label, n.color); };
    key.addEventListener('mousedown', fire);
    key.addEventListener('touchstart', fire, { passive: false });
    blackContainer.appendChild(key);
    keyMap[n.kbd] = { el: key, freq: n.freq, label: n.label, color: n.color };
  });
});

const heldKeys = new Set();
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (keyMap[k] && !heldKeys.has(k)) {
    heldKeys.add(k);
    const { el, freq, label, color } = keyMap[k];
    triggerKey(el, freq, label, color);
  }
});
document.addEventListener('keyup', (e) => { heldKeys.delete(e.key.toLowerCase()); });
import { DURATIONS, TARGET_SCORE, Session, cellsForNumber, durationForLevel } from './game.js';
import { GameAudio } from './audio.js';

const $ = (id) => document.getElementById(id);
const form = $('setup-form');
const setup = $('setup-screen');
const game = $('game-screen');
const win = $('win-screen');
const frame = $('ten-frame');
const keys = [...document.querySelectorAll('[data-answer]')];
const audio = new GameAudio();
const nativeApp = navigator.userAgent.includes('BlitzblickzahlenAndroid/');
const seconds = (ms) => `${(ms / 1000).toLocaleString('de-DE')} s`;
let level = 1;
let session = null;
let phase = 'setup';
let timer;
let paintFrame;
let resumeAction;
let deferredInstall = null;
let waitingWorker = null;
let updateRequested = false;

try {
  const saved = Number(localStorage.getItem('blitzblickzahlen.level') || 1);
  durationForLevel(saved);
  level = saved;
  audio.enabled = localStorage.getItem('blitzblickzahlen.sound') !== 'off';
} catch { /* Storage is optional. */ }

for (let index = 0; index < 10; index += 1) {
  const label = document.createElement('label');
  label.className = 'number-option';
  const input = document.createElement('input');
  input.type = 'radio'; input.name = 'level'; input.value = String(index + 1);
  input.checked = level === index + 1;
  input.setAttribute('aria-label', `Stufe ${index + 1}, ${seconds(DURATIONS[index])}`);
  const face = document.createElement('span');
  face.className = 'number-face'; face.setAttribute('aria-hidden', 'true');
  const number = document.createElement('span'); number.textContent = String(index + 1);
  const time = document.createElement('small'); time.textContent = seconds(DURATIONS[index]);
  face.append(number, time); label.append(input, face); $('level-options').append(label);
  const cell = document.createElement('span'); cell.className = 'ten-cell'; cell.setAttribute('aria-hidden', 'true'); frame.append(cell);
}

function updateSelection() {
  level = Number(new FormData(form).get('level'));
  $('selection-summary').textContent = `Stufe ${level} · ${seconds(durationForLevel(level))} Zeit zum Schauen`;
}
updateSelection();
form.addEventListener('change', updateSelection);

function cancelPending() { clearTimeout(timer); cancelAnimationFrame(paintFrame); }
function later(callback, delay) { cancelPending(); timer = setTimeout(callback, delay); }
const canAnswer = () => phase === 'show' || phase === 'answer';

function setPhase(next, title, hint, icon = '', copy = '') {
  phase = next;
  $('display-area').className = `display-area ${next}`;
  $('phase-title').textContent = title;
  $('phase-hint').textContent = hint;
  frame.hidden = next !== 'show';
  $('round-message').hidden = next === 'show';
  $('feedback-icon').textContent = icon;
  $('feedback-copy').textContent = copy;
  $('resume-button').hidden = next !== 'paused';
  for (const key of keys) key.disabled = !canAnswer();
  $('keypad-hint').textContent = next === 'show' ? 'Du kannst jetzt schon antworten.'
    : next === 'answer' ? 'Tippe auf die passende Zahl.' : 'Gleich kannst du wieder tippen.';
}

function updateProgress() {
  $('score-count').textContent = String(session.score);
  $('score-progress').setAttribute('aria-valuenow', String(session.score));
  $('progress-fill').style.width = `${session.score / TARGET_SCORE * 100}%`;
}

function showPoints() {
  cancelPending();
  const cells = cellsForNumber(session.current);
  [...frame.children].forEach((cell, index) => cell.classList.toggle('filled', cells[index]));
  // The field becomes visible inside an animation frame; no fading shortens the flash.
  paintFrame = requestAnimationFrame(() => {
    setPhase('show', 'Schau genau!', 'Tippe, sobald du die Anzahl erkennst.');
    timer = setTimeout(askForAnswer, durationForLevel(level));
  });
}

function askForAnswer() {
  setPhase('answer', 'Wie viele waren’s?', 'Du kannst dir beim Antworten Zeit lassen.', '?', 'Jetzt bist du dran.');
  // Move focus without scrolling; the answer remains secret in the accessible label.
  keys[0].focus({ preventScroll: true });
}

function nextRound() {
  session.next();
  showPoints();
}

function startCountdown(remaining = 3) {
  setPhase('countdown', 'Mach dich bereit!', 'Gleich geht’s los.', String(remaining), '');
  later(() => remaining > 1 ? startCountdown(remaining - 1) : nextRound(), 1000);
}

async function enterPortrait() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  } catch { /* Fullscreen is optional. */ }
  try { await screen.orientation?.lock?.('portrait'); } catch { /* The layout also supports manual rotation. */ }
}

function startGame() {
  cancelPending(); audio.stop(); audio.unlock();
  session = new Session();
  setup.hidden = true; win.hidden = true; game.hidden = false;
  $('end-game-button').hidden = false; $('setup-spark').hidden = true; $('app-footer').hidden = true;
  $('confetti').replaceChildren();
  document.body.classList.add('game-mode');
  $('level-badge').textContent = `Stufe ${level} · ${seconds(durationForLevel(level))}`;
  updateProgress(); startCountdown();
  $('phase-title').focus({ preventScroll: true });
  void enterPortrait();
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); updateSelection();
  try { localStorage.setItem('blitzblickzahlen.level', String(level)); } catch { /* Optional. */ }
  startGame();
});

function answer(number) {
  if (!canAnswer()) return;
  // An early answer ends the flash. Its old timeout must not reopen the keypad.
  cancelPending();
  const result = session.answer(number);
  updateProgress();
  if (result.correct) {
    setPhase('correct', 'Richtig!', 'Prima gesehen. +1 Punkt', '☺', `${result.score} von ${TARGET_SCORE} Punkten!`);
    audio.play('correct');
  } else {
    const hint = result.deducted ? `−${result.deducted} ${result.deducted === 1 ? 'Punkt' : 'Punkte'}. Weiter geht’s!` : 'Weiter geht’s!';
    setPhase('incorrect', 'Noch mal üben!', hint, '👎', `Es ${result.expected === 1 ? 'war 1 Punkt' : `waren ${result.expected} Punkte`}.`);
    audio.play('wrong');
  }
  $('phase-title').focus({ preventScroll: true });
  later(result.finished ? celebrate : nextRound, result.correct ? 650 : 1200);
}
for (const key of keys) key.addEventListener('click', () => answer(Number(key.dataset.answer)));
document.addEventListener('keydown', (event) => {
  if (!canAnswer() || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
  if (/^[0-9]$/.test(event.key)) { event.preventDefault(); answer(event.key === '0' ? 10 : Number(event.key)); }
});

function celebrate() {
  cancelPending(); phase = 'win';
  game.hidden = true; win.hidden = false; $('app-footer').hidden = false;
  document.body.classList.remove('game-mode');
  $('win-summary').textContent = `Stufe ${level} · ${seconds(durationForLevel(level))} pro Zahlbild · ${session.correct} von ${session.attempts} richtig`;
  const colors = ['#ecd88c', '#315c4c', '#a0b68a', '#cf8a62'];
  for (let index = 0; index < 36; index += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${index * 37 % 100}%`);
    piece.style.setProperty('--color', colors[index % colors.length]);
    piece.style.setProperty('--duration', `${2 + index % 5 * .25}s`);
    piece.style.setProperty('--delay', `${index % 9 * .12}s`);
    $('confetti').append(piece);
  }
  audio.play('win');
  $('win-title').focus({ preventScroll: true });
}

function showSetup() {
  cancelPending(); audio.stop(); phase = 'setup'; session = null;
  resumeAction = null;
  frame.hidden = true;
  for (const key of keys) key.disabled = true;
  setup.hidden = false; game.hidden = true; win.hidden = true;
  $('end-game-button').hidden = true; $('setup-spark').hidden = false; $('app-footer').hidden = false;
  $('confetti').replaceChildren();
  document.body.classList.remove('game-mode');
  form.querySelector('input:checked').focus({ preventScroll: true });
}
$('end-game-button').addEventListener('click', showSetup);
$('choose-level-button').addEventListener('click', showSetup);
$('replay-button').addEventListener('click', startGame);

function pauseGame() {
  if (['setup', 'win', 'paused'].includes(phase)) return;
  const previous = phase;
  cancelPending(); audio.stop();
  resumeAction = previous === 'answer' ? askForAnswer
    : previous === 'countdown' ? startCountdown
    : previous === 'correct' || previous === 'incorrect' ? (session.finished ? celebrate : nextRound)
    : showPoints;
  setPhase('paused', 'Kleine Pause', 'Tippe auf Weiter, wenn du bereit bist.', '☀', 'Wir warten auf dich.');
}
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
window.addEventListener('pagehide', pauseGame);
window.addEventListener('blitzblickpause', pauseGame);
$('resume-button').addEventListener('click', () => { audio.unlock(); resumeAction?.(); });

function updateSound() {
  $('sound-button').textContent = audio.enabled ? '♪ Ton an' : '♪ Ton aus';
  $('sound-button').setAttribute('aria-pressed', String(audio.enabled));
}
updateSound();
$('sound-button').addEventListener('click', () => {
  audio.enabled = !audio.enabled;
  if (audio.enabled) audio.unlock(); else audio.stop();
  updateSound();
  try { localStorage.setItem('blitzblickzahlen.sound', audio.enabled ? 'on' : 'off'); } catch { /* Optional. */ }
});
$('fullscreen-button').addEventListener('click', () => {
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  else void enterPortrait();
});
document.addEventListener('fullscreenchange', () => { $('fullscreen-button').textContent = document.fullscreenElement ? '⛶ Vollbild beenden' : '⛶ Vollbild'; });

const standalone = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
if (standalone() || nativeApp) $('install-button').hidden = true;
if (nativeApp) {
  $('apk-download').hidden = true;
  $('apk-zip-download').hidden = true;
  $('share-app-button').hidden = false;
  $('fullscreen-button').hidden = true;
}
$('share-app-button').addEventListener('click', () => window.BlitzblickAndroid?.shareApk());
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstall = event;
});
window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  $('install-button').hidden = true;
  $('install-dialog').close();
});
$('install-button').addEventListener('click', async () => {
  if (deferredInstall) {
    const prompt = deferredInstall;
    deferredInstall = null;
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch { $('install-dialog').showModal(); }
  } else {
    $('install-dialog').showModal();
  }
});
$('close-install').addEventListener('click', () => $('install-dialog').close());
$('install-dialog').addEventListener('click', (event) => {
  if (event.target !== $('install-dialog')) return;
  const box = event.target.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) event.target.close();
});

function offerUpdate(worker) {
  waitingWorker = worker;
  $('update-notice').hidden = false;
}
$('update-button').addEventListener('click', () => {
  if (!waitingWorker) return;
  updateRequested = true;
  $('update-button').disabled = true;
  waitingWorker.postMessage({ type: 'ACTIVATE_UPDATE' });
});

async function registerOffline() {
  if (nativeApp) { $('offline-status').textContent = 'Offline bereit'; return; }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' });
    if (registration.waiting) offerUpdate(registration.waiting);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(registration.waiting || worker);
      });
    });
    const ready = await navigator.serviceWorker.ready;
    ready.active?.postMessage({ type: 'OFFLINE_STATUS' });
    navigator.serviceWorker.controller?.postMessage({ type: 'OFFLINE_STATUS' });
  } catch { $('offline-status').textContent = 'Online spielbar'; }
}
if (!nativeApp && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'OFFLINE_READY') $('offline-status').textContent = 'Offline bereit';
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateRequested) window.location.reload();
    else navigator.serviceWorker.controller?.postMessage({ type: 'OFFLINE_STATUS' });
  });
}
void registerOffline();

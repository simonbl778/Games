import { DEFAULT_MAX_SYLLABLES } from './config.js';
import { generateChain, getMinSyllables, validateMaxSyllables } from './generator.js';
import { renderChain } from './presentation.js';
import { normalizeReadingFont, readingHeightFactor, ensureReadingFont } from './typography.js';

import { LEVELS, getLevel, readSelection, saveSelection } from './curriculum.js';
import { PracticeSession, formatPracticeTime } from './practice.js';
import { RewardAudio } from './audio.js';

const $ = (id) => document.getElementById(id);
const setup = $('setup-screen');
const game = $('game-screen');
const form = $('setup-form');
const chainButton = $('chain-button');
const chainText = $('chain-text');
const colorOption = $('alternate-colors');
let maximum = DEFAULT_MAX_SYLLABLES;
let readingFont = 'print';
let starting = false;
let previousText = '';
let deferredInstall = null;
let waitingWorker = null;
let updateRequested = false;
let resizeFrame;
let storage;
try { storage = window.localStorage; } catch { /* Optional. */ }
let selection = readSelection(storage);
const session = new PracticeSession();
const reward = new RewardAudio();
const levelSelect = $('level-select');
let clockInterval = null;
let lastAdvance = -Infinity;


try {
  const saved = localStorage.getItem('silbengenerator.maximum');
  if (saved !== null) maximum = validateMaxSyllables(Number(saved));
} catch { /* Reading works when browser storage is unavailable. */ }

for (const part of ['', 'A', 'B']) {
  const group = part ? document.createElement('optgroup') : levelSelect;
  if (part) group.label = `Arbeitsheft Teil ${part}`;
  for (const level of LEVELS.filter(level => level.part === part)) {
    const option = document.createElement('option');
    option.value = level.id;
    option.textContent = level.number ? `${level.number}. ${level.title}` : level.title;
    group.append(option);
  }
  if (part) levelSelect.append(group);
}
levelSelect.value = selection.levelId;
function renderSyllableChoices() {
  const level = getLevel(selection.levelId);
  const chosen = new Set(selection.syllables);
  $('syllable-options').replaceChildren(...level.syllables.map(syllable => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox'; input.name = 'known-syllable'; input.value = syllable; input.checked = chosen.has(syllable);
    const text = document.createElement('span'); text.textContent = syllable;
    label.append(input, text); return label;
  }));
  $('level-help').textContent = level.number ? `Neu: ${level.introduction} · Vorherige Stufen sind enthalten.` : 'Deine vertrauten Silben aus der bisherigen Version.';
  refreshSelectedSyllables();
}
function refreshSelectedSyllables() {
  selection.syllables = [...form.querySelectorAll('input[name="known-syllable"]:checked')].map(input => input.value);
  $('selected-count').textContent = `(${selection.syllables.length})`;
  $('selection-error').hidden = selection.syllables.length > 0;
  $('start-button').disabled = selection.syllables.length === 0;
  $('syllable-preview').replaceChildren(...selection.syllables.slice(0, 8).map(syllable => {
    const tile = document.createElement('span'); tile.textContent = syllable; return tile;
  }));
  if (selection.syllables.length > 8) {
    const more = document.createElement('span'); more.textContent = `+${selection.syllables.length - 8}`; $('syllable-preview').append(more);
  }
  saveSelection(storage, selection);
}
levelSelect.addEventListener('change', () => {
  selection = { levelId: levelSelect.value, syllables: [...getLevel(levelSelect.value).syllables] };
  renderSyllableChoices();
});
$('syllable-options').addEventListener('change', refreshSelectedSyllables);
for (const [id, checked] of [['select-all-syllables', true], ['select-no-syllables', false]]) {
  $(id).addEventListener('click', () => {
    for (const input of form.querySelectorAll('input[name="known-syllable"]')) input.checked = checked;
    refreshSelectedSyllables();
  });
}
renderSyllableChoices();
const initialChoice = form.querySelector(`input[value="${maximum}"]`);
if (initialChoice) initialChoice.checked = true;
form.querySelector('input[name="reading-font"][value="print"]').checked = true;
colorOption.checked = true;

function updateSelection() {
  const values = new FormData(form);
  maximum = validateMaxSyllables(Number(values.get('max-syllables')));
  readingFont = normalizeReadingFont(values.get('reading-font'));
  document.body.classList.toggle('cursive-reading', readingFont !== 'print');
  document.body.classList.toggle('la-reading', readingFont === 'la');
  document.body.classList.toggle('va-reading', readingFont === 'va');
  $('font-error').hidden = true;
  $('selection-summary').textContent = maximum === 1
    ? 'Immer eine Silbe pro Kette'
    : `Zufällig ${getMinSyllables(maximum)} bis ${maximum} Silben pro Kette`;
}
updateSelection();
form.addEventListener('change', () => {
  updateSelection();
  // Warm the local font while the parent is choosing; report failures on Start.
  void ensureReadingFont(document.fonts, readingFont).then(scheduleFit).catch(() => {});
});

function fitChain() {
  if (game.hidden || !chainText.textContent) return;
  const style = getComputedStyle(chainButton);
  const width = chainButton.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = chainButton.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  let size = Math.max(16, Math.min(readingFont === 'print' ? 240 : 400, height / readingHeightFactor(readingFont)));
  chainText.style.fontSize = `${size}px`;
  const measured = chainText.getBoundingClientRect();
  const scale = Math.min(1, width / measured.width, height / measured.height);
  if (scale < 1) {
    size *= scale;
    chainText.style.fontSize = `${Math.floor(size)}px`;
  }
}

function scheduleFit() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(fitChain);
}

function showNextChain() {
  const chain = generateChain(maximum, { previousText, syllables: selection.syllables });
  previousText = chain.text;
  renderChain(chainText, chain, colorOption.checked, readingFont);
  chainButton.setAttribute('aria-label', `${chain.text}. Antippen für die nächste Silbenkette.`);
  fitChain();
}

async function enterLandscape() {
  // Fullscreen must be requested directly from a user gesture.
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch { /* Embedded browsers may refuse fullscreen. */ }
  try {
    await screen.orientation?.lock?.('landscape');
  } catch { /* The visible portrait hint explains manual rotation. */ }
  scheduleFit();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (starting || !game.hidden) return;
  updateSelection();
  if (!selection.syllables.length) return;
  reward.enabled = $('reward-sound').checked;
  reward.unlock();
  starting = true;
  const inputs = [...form.querySelectorAll('input, select, button')];
  inputs.forEach((input) => { input.disabled = true; });
  $('start-button').disabled = true;
  $('start-button').setAttribute('aria-busy', 'true');
  // Preserve the browser's direct user gesture before awaiting the local font.
  void enterLandscape();
  try {
    await ensureReadingFont(document.fonts, readingFont);
  } catch {
    $('font-error').hidden = false;
    return;
  } finally {
    starting = false;
    inputs.forEach((input) => { input.disabled = false; });
    $('start-button').disabled = false;
    $('start-button').removeAttribute('aria-busy');
  }
  try { localStorage.setItem('silbengenerator.maximum', String(maximum)); } catch { /* Optional. */ }
  saveSelection(storage, selection);
  session.start();
  if (document.hidden) session.pause();
  previousText = ''; lastAdvance = -Infinity;
  clockInterval = setInterval(updatePracticeHud, 250);
  $('practice-count').hidden = false; $('practice-clock').hidden = false;
  updatePracticeHud();
  setup.hidden = true;
  game.hidden = false;
  $('settings-button').hidden = false;
  $('calm-badge').hidden = true;
  $('app-footer').hidden = true;
  $('limit-badge').textContent = maximum === 1 ? '1 Silbe' : `Bis zu ${maximum} Silben`;
  document.body.classList.add('game-mode');
  showNextChain();
  chainButton.focus({ preventScroll: true });
});

function updatePracticeHud() {
  const state = session.snapshot();
  const values = { 'completed-count': String(state.count), 'completed-label': state.count === 1 ? 'Kette gelesen' : 'Ketten gelesen', 'elapsed-time': formatPracticeTime(state.elapsedMs) };
  for (const [id, value] of Object.entries(values)) if ($(id).textContent !== value) $(id).textContent = value;
}
chainButton.addEventListener('click', () => {
  if (game.hidden || document.hidden || performance.now() - lastAdvance < 220) return;
  lastAdvance = performance.now();
  session.complete(); reward.play(); showNextChain(); updatePracticeHud();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { session.pause(); reward.stop(); } else if (!game.hidden) session.resume();
  updatePracticeHud();
});
window.addEventListener('pagehide', () => { session.pause(); reward.stop(); });
window.addEventListener('pageshow', () => { if (!game.hidden && !document.hidden) session.resume(); });
$('settings-button').addEventListener('click', () => {
  session.stop(); reward.stop(); clearInterval(clockInterval); clockInterval = null;
  $('practice-count').hidden = true; $('practice-clock').hidden = true;
  game.hidden = true;
  setup.hidden = false;
  $('settings-button').hidden = true;
  $('calm-badge').hidden = false;
  $('app-footer').hidden = false;
  document.body.classList.remove('game-mode');
  levelSelect.focus({ preventScroll: true });
});
$('fullscreen-button').addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    void enterLandscape();
  }
});
document.addEventListener('fullscreenchange', () => {
  $('fullscreen-button').querySelector('span').textContent = document.fullscreenElement ? 'Vollbild beenden' : 'Vollbild';
  scheduleFit();
});
window.addEventListener('resize', scheduleFit);
window.visualViewport?.addEventListener('resize', scheduleFit);
document.fonts?.addEventListener?.('loadingdone', scheduleFit);
if ('ResizeObserver' in window) new ResizeObserver(scheduleFit).observe(chainButton);

const standalone = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
if (standalone()) $('install-button').hidden = true;
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
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'OFFLINE_READY') $('offline-status').textContent = 'Offline bereit';
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateRequested) window.location.reload();
    else navigator.serviceWorker.controller?.postMessage({ type: 'OFFLINE_STATUS' });
  });
}
void registerOffline();

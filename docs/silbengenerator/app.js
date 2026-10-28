import { DEFAULT_MAX_SYLLABLES, SYLLABLES } from './config.js';
import { generateChain, validateMaxSyllables } from './generator.js';

const $ = (id) => document.getElementById(id);
const setup = $('setup-screen');
const game = $('game-screen');
const form = $('setup-form');
const chainButton = $('chain-button');
const chainText = $('chain-text');
let maximum = DEFAULT_MAX_SYLLABLES;
let previousText = '';
let deferredInstall = null;
let waitingWorker = null;
let updateRequested = false;
let resizeFrame;

try {
  const saved = localStorage.getItem('silbengenerator.maximum');
  if (saved !== null) maximum = validateMaxSyllables(Number(saved));
} catch { /* Reading works when browser storage is unavailable. */ }

for (const syllable of SYLLABLES) {
  const tile = document.createElement('span');
  tile.textContent = syllable;
  $('syllable-preview').append(tile);
}
const initialChoice = form.querySelector(`input[value="${maximum}"]`);
if (initialChoice) initialChoice.checked = true;

function updateSelection() {
  maximum = validateMaxSyllables(Number(new FormData(form).get('max-syllables')));
  $('selection-summary').textContent = maximum === 1
    ? 'Immer eine Silbe pro Kette'
    : `Zufällig 1 bis ${maximum} Silben pro Kette`;
}
updateSelection();
form.addEventListener('change', updateSelection);

function fitChain() {
  if (game.hidden || !chainText.textContent) return;
  const style = getComputedStyle(chainButton);
  const width = chainButton.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = chainButton.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  let size = Math.max(16, Math.min(240, height / 1.14));
  chainText.style.fontSize = `${size}px`;
  const measured = chainText.getBoundingClientRect().width;
  if (measured > width) {
    size *= width / measured;
    chainText.style.fontSize = `${Math.floor(size)}px`;
  }
}

function scheduleFit() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(fitChain);
}

function showNextChain() {
  const chain = generateChain(maximum, { previousText });
  previousText = chain.text;
  chainText.textContent = chain.text;
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

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateSelection();
  try { localStorage.setItem('silbengenerator.maximum', String(maximum)); } catch { /* Optional. */ }
  setup.hidden = true;
  game.hidden = false;
  $('settings-button').hidden = false;
  $('calm-badge').hidden = true;
  $('app-footer').hidden = true;
  $('limit-badge').textContent = maximum === 1 ? '1 Silbe' : `Bis zu ${maximum} Silben`;
  document.body.classList.add('game-mode');
  showNextChain();
  chainButton.focus({ preventScroll: true });
  void enterLandscape();
});

chainButton.addEventListener('click', showNextChain);
$('settings-button').addEventListener('click', () => {
  game.hidden = true;
  setup.hidden = false;
  $('settings-button').hidden = true;
  $('calm-badge').hidden = false;
  $('app-footer').hidden = false;
  document.body.classList.remove('game-mode');
  form.querySelector('input:checked').focus({ preventScroll: true });
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

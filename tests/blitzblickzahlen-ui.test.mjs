import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { Session, DURATIONS, TARGET_SCORE, cellsForNumber, durationForLevel } from '../docs/blitzblickzahlen/game.js';

// Exercise the real app controller with a monotonic clock and small DOM fixture.
// This checks what time is passed to Session.answer, including pause/resume paths.
function fixture(level = 1) {
  let now = 0;
  let nextId = 1;
  const scheduled = new Map();
  const nodes = new Map();
  const sessions = [];
  class Node {
    constructor() {
      this.children = []; this.handlers = new Map(); this.hidden = false;
      this.textContent = ''; this.style = { setProperty(name, value) { this[name] = value; } }; this.attributes = new Map(); this.dataset = {};
      const classes = new Set();
      this.classList = { add: value => classes.add(value), remove: value => classes.delete(value),
        toggle: (value, enabled) => enabled ? classes.add(value) : classes.delete(value), contains: value => classes.has(value) };
    }
    addEventListener(name, callback) {
      if (!this.handlers.has(name)) this.handlers.set(name, []);
      this.handlers.get(name).push(callback);
    }
    dispatch(name, extra = {}) {
      const event = { target: this, preventDefault() {}, ...extra };
      for (const callback of this.handlers.get(name) || []) callback(event);
    }
    click() { this.dispatch('click'); }
    focus() { document.activeElement = this; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = [...children]; }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    querySelector() { return new Node(); }
  }
  const get = id => { if (!nodes.has(id)) nodes.set(id, new Node()); return nodes.get(id); };
  const keys = Array.from({ length: 10 }, (_, index) => { const node = new Node(); node.dataset.answer = String(index + 1); return node; });
  const document = new Node();
  document.getElementById = get; document.querySelectorAll = () => keys; document.createElement = () => new Node();
  document.body = new Node(); document.documentElement = new Node(); document.hidden = false;
  get('game-screen').hidden = true; get('win-screen').hidden = true;
  class ObservedSession extends Session {
    constructor() { super(); sessions.push(this); }
    next(random = () => .45) { return super.next(random); }
  }
  const window = new Node();
  const schedule = (callback, delay) => { const id = nextId++; scheduled.set(id, { at: now + delay, callback }); return id; };
  const context = vm.createContext({
    document, window, navigator: { userAgent: 'Controller tests' }, screen: {},
    matchMedia: () => ({ matches: false }), localStorage: { getItem: () => null, setItem() {} },
    FormData: class { get() { return String(level); } },
    Session: ObservedSession, DURATIONS, TARGET_SCORE, cellsForNumber, durationForLevel,
    GameAudio: class { enabled = true; unlock() {} stop() {} play() {} },
    performance: { now: () => now }, setTimeout: schedule, clearTimeout: id => scheduled.delete(id),
    requestAnimationFrame: callback => schedule(callback, 16), cancelAnimationFrame: id => scheduled.delete(id),
  });
  const source = readFileSync(new URL('../docs/blitzblickzahlen/app.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '');
  vm.runInContext(source, context);
  const advance = duration => {
    const end = now + duration;
    let iterations = 0;
    while (true) {
      const entry = [...scheduled].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!entry) break;
      assert.ok(++iterations < 10000, 'Timer loop must remain bounded.');
      scheduled.delete(entry[0]); now = entry[1].at; entry[1].callback(now);
    }
    now = end;
  };
  return {
    get, keys, advance, window, sessions,
    start() { get('setup-form').dispatch('submit'); advance(3016); },
    answer(correct = true) {
      const current = sessions[sessions.length - 1].current;
      keys[(correct ? current : current % 10 + 1) - 1].click();
      return current;
    },
  };
}

test('die Messung beginnt am sichtbaren Zahlbild; Countdown und Rückmeldung zählen nicht', () => {
  const ui = fixture(); ui.start();
  assert.equal(ui.get('ten-frame').hidden, false);
  ui.advance(500); const first = ui.answer();
  const session = ui.sessions[0]; assert.deepEqual(session.responseTimes[first - 1], [500]);
  ui.advance(666); assert.equal(ui.get('ten-frame').hidden, false);
  ui.advance(2000); const second = ui.answer();
  assert.notEqual(second, first); assert.deepEqual(session.responseTimes[second - 1], [2000]);
  assert.ok(session.weights[second - 1] > session.weights[first - 1]);
});

test('lange Pausen während der Anzeige werden von der Lösungszeit abgezogen', () => {
  const ui = fixture(); ui.start(); ui.advance(400);
  const current = ui.sessions[0].current;
  ui.window.dispatch('blitzblickpause'); ui.advance(60000);
  assert.equal(ui.get('ten-frame').hidden, true);
  ui.get('resume-button').click(); ui.advance(16); ui.advance(800); ui.answer();
  assert.deepEqual(ui.sessions[0].responseTimes[current - 1], [1200]);
});

test('die verdeckte Antwortphase zählt mit, eine dortige Pause jedoch nicht', () => {
  const ui = fixture(10); ui.start(); ui.advance(600);
  assert.equal(ui.get('ten-frame').hidden, true);
  const current = ui.sessions[0].current;
  ui.window.dispatch('blitzblickpause'); ui.advance(100000);
  ui.get('resume-button').click(); ui.advance(900); ui.answer();
  assert.deepEqual(ui.sessions[0].responseTimes[current - 1], [1500]);
});

test('der Controller zieht weiter fünf ab, wiederholt keine Karte direkt und beendet bei 40 Punkten', () => {
  const ui = fixture(10); ui.start(); const session = ui.sessions[0];
  let previous = null;
  for (let index = 0; index < 15; index += 1) {
    assert.notEqual(session.current, previous); previous = session.current;
    ui.advance(200); ui.answer(); ui.advance(666);
  }
  assert.equal(ui.get('score-count').textContent, '15');
  previous = ui.answer(false); assert.equal(ui.get('score-count').textContent, '10');
  ui.advance(1216); assert.notEqual(session.current, previous);
  for (let index = 0; index < 30; index += 1) {
    assert.notEqual(session.current, previous); previous = session.current;
    ui.advance(200); ui.answer();
    if (index < 29) assert.equal(ui.get('win-screen').hidden, true);
    ui.advance(666);
  }
  assert.equal(ui.get('score-count').textContent, '40');
  assert.equal(ui.get('score-progress').attributes.get('aria-valuenow'), '40');
  assert.equal(ui.get('progress-fill').style.width, '100%');
  assert.equal(ui.get('win-screen').hidden, false);
});

test('eine neue Partie übernimmt keine alten Antwortzeiten', () => {
  const ui = fixture(); ui.start(); ui.advance(500); ui.answer();
  ui.get('end-game-button').click(); ui.get('setup-form').dispatch('submit');
  assert.equal(ui.sessions.length, 2);
  assert.deepEqual(ui.sessions[1].averageResponseTimes, Array(10).fill(null));
});

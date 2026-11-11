export const DURATIONS = Object.freeze([5000, 4000, 3000, 2500, 2000, 1500, 1000, 700, 500, 300]);
export const TARGET_SCORE = 40;
export const ERROR_PENALTY = 5;
const RESPONSE_HISTORY = 5;
const MIN_RESPONSE_MS = 100;
const MAX_RESPONSE_MS = 30000;

export function durationForLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > 10) throw new RangeError('Die Stufe muss zwischen 1 und 10 liegen.');
  return DURATIONS[level - 1];
}

function validateNumber(number) {
  if (!Number.isInteger(number) || number < 1 || number > 10) throw new RangeError('Die Zahl muss zwischen 1 und 10 liegen.');
}

// Row-major order: fill each pair left to right, then continue one row below.
export function cellsForNumber(number) {
  validateNumber(number);
  return Array.from({ length: 10 }, (_, index) => index < number);
}

export class Session {
  constructor() {
    this.mistakes = Array(10).fill(0);
    this.responseTimes = Array.from({ length: 10 }, () => []);
    this.score = 0;
    this.best = 0;
    this.attempts = 0;
    this.correct = 0;
    this.current = null;
    this.awaitingAnswer = false;
  }

  get finished() { return this.score >= TARGET_SCORE; }

  get averageResponseTimes() {
    return this.responseTimes.map((times) => times.length ? times.reduce((sum, time) => sum + time, 0) / times.length : null);
  }

  get weights() {
    const averages = this.averageResponseTimes;
    return this.mistakes.map((mistakes, index) => {
      const others = averages.filter((time, other) => other !== index && time !== null);
      let timeFactor = 1;
      if (averages[index] !== null && others.length) {
        const reference = others.reduce((sum, time) => sum + time, 0) / others.length;
        timeFactor += Math.min(2, Math.max(0, averages[index] / reference - 1));
      }
      // Keep unseen/faster cards available and combine slow answers with mistakes.
      return Math.min(5, (1 + Math.min(mistakes, 4) * 0.5) * timeFactor);
    });
  }

  next(random = Math.random) {
    if (this.finished || this.awaitingAnswer) throw new Error('Diese Runde kann nicht gestartet werden.');
    const draw = random();
    if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError('Ungültiger Zufallswert.');
    // Exclude the preceding number before drawing, even if it has a high weight.
    const candidates = this.weights.map((weight, index) => ({ number: index + 1, weight }))
      .filter(({ number }) => number !== this.current);
    let remaining = draw * candidates.reduce((sum, { weight }) => sum + weight, 0);
    this.current = candidates[candidates.length - 1].number;
    for (const candidate of candidates) {
      remaining -= candidate.weight;
      if (remaining < 0) { this.current = candidate.number; break; }
    }
    this.awaitingAnswer = true;
    return this.current;
  }

  answer(number, { responseMs } = {}) {
    validateNumber(number);
    if (!this.awaitingAnswer || this.finished) throw new Error('Es gibt keine offene Frage.');
    if (responseMs !== undefined && (!Number.isFinite(responseMs) || responseMs < 0)) throw new RangeError('Ungültige Lösungszeit.');
    this.awaitingAnswer = false;
    if (responseMs !== undefined) {
      const history = this.responseTimes[this.current - 1];
      // Outliers affect frequency only within bounds; answering has no time limit.
      history.push(Math.max(MIN_RESPONSE_MS, Math.min(MAX_RESPONSE_MS, responseMs)));
      if (history.length > RESPONSE_HISTORY) history.shift();
    }
    this.attempts += 1;
    const correct = number === this.current;
    const previousScore = this.score;
    if (correct) {
      this.correct += 1;
      this.score += 1;
      // Successful practice gradually lowers the extra weight again.
      this.mistakes[this.current - 1] = Math.max(0, this.mistakes[this.current - 1] - 0.5);
      this.best = Math.max(this.best, this.score);
    } else {
      this.score = Math.max(0, this.score - ERROR_PENALTY);
      this.mistakes[this.current - 1] += 1;
    }
    return { correct, expected: this.current, score: this.score, deducted: correct ? 0 : previousScore - this.score, finished: this.finished };
  }
}

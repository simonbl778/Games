export const DURATIONS = Object.freeze([5000, 4000, 3000, 2500, 2000, 1500, 1000, 700, 500, 300]);
export const TARGET_STREAK = 30;

export function durationForLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > 10) throw new RangeError('Die Stufe muss zwischen 1 und 10 liegen.');
  return DURATIONS[level - 1];
}

function validateNumber(number) {
  if (!Number.isInteger(number) || number < 1 || number > 10) throw new RangeError('Die Zahl muss zwischen 1 und 10 liegen.');
}

// One column of five, then the second: the structure of five stays recognizable.
export function cellsForNumber(number) {
  validateNumber(number);
  return Array.from({ length: 10 }, (_, index) => index < number);
}

export class Session {
  constructor() {
    this.mistakes = Array(10).fill(0);
    this.streak = 0;
    this.best = 0;
    this.attempts = 0;
    this.correct = 0;
    this.current = null;
    this.awaitingAnswer = false;
  }

  get finished() { return this.streak >= TARGET_STREAK; }

  get weights() { return this.mistakes.map((mistakes) => 1 + Math.min(mistakes, 4) * 0.5); }

  next(random = Math.random) {
    if (this.finished || this.awaitingAnswer) throw new Error('Diese Runde kann nicht gestartet werden.');
    const draw = random();
    if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError('Ungültiger Zufallswert.');
    const weights = this.weights;
    let remaining = draw * weights.reduce((sum, weight) => sum + weight, 0);
    this.current = 10;
    for (let index = 0; index < weights.length; index += 1) {
      remaining -= weights[index];
      if (remaining < 0) { this.current = index + 1; break; }
    }
    this.awaitingAnswer = true;
    return this.current;
  }

  answer(number) {
    validateNumber(number);
    if (!this.awaitingAnswer || this.finished) throw new Error('Es gibt keine offene Frage.');
    this.awaitingAnswer = false;
    this.attempts += 1;
    const correct = number === this.current;
    if (correct) {
      this.correct += 1;
      this.streak += 1;
      // Successful practice gradually lowers the extra weight again.
      this.mistakes[this.current - 1] = Math.max(0, this.mistakes[this.current - 1] - 0.5);
      this.best = Math.max(this.best, this.streak);
    } else {
      this.streak = 0;
      this.mistakes[this.current - 1] += 1;
    }
    return { correct, expected: this.current, streak: this.streak, finished: this.finished };
  }
}

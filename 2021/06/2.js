// @flow
// Pipe the input to this script to get the result

const readline = require('readline');

async function* processLineByLine() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  yield* rl;
}

function collectInitialFishes(line: string): number[] {
  return line.split(',').map((val) => +val);
}

class Fishes {
  /*
   * Map<days, count>
   */
  fishes: number[];
  constructor(initialFishes: number[]) {
    const fishes = (this.fishes = Array.from({ length: 9 }, () => 0));
    for (const days of initialFishes) {
      fishes[days]++;
    }
  }

  tickOneDay() {
    const creatingFishes = this.fishes[0];
    for (let i = 1; i <= 8; i++) {
      this.fishes[i - 1] = this.fishes[i];
    }
    this.fishes[8] = creatingFishes;
    this.fishes[6] += creatingFishes;
  }

  getFishCount() {
    return this.fishes.reduce((total, count) => total + count);
  }

  debug() {
    console.log(this.fishes);
  }
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const firstLine = (await lineIterator.next()).value;
  if (!firstLine) {
    throw new Error(`Ooops, there's no entry!`);
  }

  const initialFishes = collectInitialFishes(firstLine);
  const fishes = new Fishes(initialFishes);
  for (let i = 0; i < 256; i++) {
    fishes.tickOneDay();
  }
  printResult(fishes.getFishCount());
}

run();

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
  fishes: number[];
  constructor(initialFishes: number[]) {
    this.fishes = initialFishes;
  }

  tickOneDay() {
    for (let i = 0, l = this.fishes.length; i < l; i++) {
      const currentFish = this.fishes[i];
      if (currentFish === 0) {
        this.fishes.push(8);
        this.fishes[i] = 6;
      } else {
        this.fishes[i]--;
      }
    }
  }

  getFishCount() {
    return this.fishes.length;
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
  for (let i = 0; i < 80; i++) {
    fishes.tickOneDay();
  }
  printResult(fishes.getFishCount());
}

run();

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

function printResult(...args) {
  console.log(...args);
}

function findStart(str): number {
  if (!str) {
    throw new Error('No input!');
  }
  const matchResult = /\d+$/.exec(str);
  if (!matchResult) {
    throw new Error(`Couldn't find a match in ${str}`);
  }
  return +matchResult[0];
}

function* deterministicDie() {
  while (true) {
    for (let i = 1; i <= 100; i++) {
      yield i;
    }
  }
}

function* turnsGenerator() {
  while (true) {
    yield 0;
    yield 1;
  }
}

function advance(position: number, byValue: number): number {
  return (position + byValue) % 10;
}

// Little wrapper so that Flow is happy
function wrapEndlessGenerator<T>(
  endlessGenerator: Generator<T, any, any>
): () => T {
  // $FlowIgnoreError[incompatible-return]
  return () => endlessGenerator.next().value;
}

async function run() {
  const lineIterator = processLineByLine();

  const line1 = (await lineIterator.next()).value;
  const line2 = (await lineIterator.next()).value;
  const positions = [findStart(line1) - 1, findStart(line2) - 1];
  const die = wrapEndlessGenerator(deterministicDie());
  const turns = wrapEndlessGenerator(turnsGenerator());
  const scores = [0, 0];

  let dieCount = 0;
  while (scores.every((score) => score < 1000)) {
    const turn = turns();
    const currentPosition = positions[turn];
    const dieValues = [die(), die(), die()];
    const newPosition = advance(
      currentPosition,
      dieValues[0] + dieValues[1] + dieValues[2]
    );
    positions[turn] = newPosition;

    // The position value is the real position minus 1, so we're incrementing by 1 to account for that here.
    scores[turn] += newPosition + 1;
    dieCount += 3;
  }

  console.log(scores, dieCount);
  printResult(Math.min(...scores) * dieCount);
}

run();

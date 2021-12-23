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

const inputRe =
  /^target area: x=(?<x1>-?\d+)..(?<x2>-?\d+), y=(?<y1>-?\d+)..(?<y2>-?\d+)/;
function parseInput(input): {|
  x1: number,
  y1: number,
  x2: number,
  y2: number,
|} {
  const matchResult = inputRe.exec(input);
  if (!matchResult || !matchResult.groups) {
    throw new Error(`Couldn't parse input ${input}`);
  }

  const { x1, x2, y1, y2 } = matchResult.groups;

  return {
    x1: +x1,
    x2: +x2,
    y1: +y1,
    y2: +y2,
  };
}

async function run() {
  const lineIterator = processLineByLine();

  const input = (await lineIterator.next()).value;
  if (!input) {
    throw new Error('no input found');
  }

  const { x1, x2, y1, y2 } = parseInput(input);

  printResult(0);
}

run();

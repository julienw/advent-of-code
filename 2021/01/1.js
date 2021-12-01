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

async function collectDepths(input): Promise<number[]> {
  const result = [];
  for await (const line of input) {
    const depth = parseInt(line);
    result.push(depth);
  }

  return result;
}

function computeDeltas(depths) {
  const result = [];
  for (let i = 1; i < depths.length; i++) {
    result.push(depths[i] - depths[i - 1]);
  }
  return result;
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const depths = await collectDepths(lineIterator);
  const deltas = computeDeltas(depths);
  printResult(deltas.filter((delta) => delta > 0).length);
}

run();

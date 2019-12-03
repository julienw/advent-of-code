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

async function calculateFuel(input) {
  let sum = 0;
  for await (const line of input) {
    const mass = parseInt(line);
    const fuel = Math.floor(mass / 3) - 2;
    sum += fuel;
  }

  return sum;
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const result = await calculateFuel(lineIterator);
  printResult(result);
}

run();

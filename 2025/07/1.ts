// @flow
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

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const input = (await Array.fromAsync(lineIterator)).map((line) =>
    line.split('')
  );
  const start = input[0].indexOf('S');

  let beams = new Set([start]);
  let splitCount = 0;
  for (let i = 1; i < input.length; i++) {
    const nextBeams = new Set();
    for (const index of beams) {
      if (input[i][index] === '^') {
        nextBeams.add(index - 1);
        nextBeams.add(index + 1);
        splitCount++;
      } else {
        nextBeams.add(index);
      }
    }
    beams = nextBeams;
  }

  printResult(splitCount);
}

run();

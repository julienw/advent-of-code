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
  let currentPosition = 50;
  let positionZeroCount = 0;
  function movePosition(val) {
    const direction = Math.sign(val);
    const absolute = Math.abs(val);
    for (let i = 0; i < absolute; i++) {
      currentPosition += direction;
      if (currentPosition % 100 === 0) {
        positionZeroCount++;
      }
    }
  }

  for await (const line of lineIterator) {
    const direction = line[0];
    const strLength = line.slice(1);
    const length = direction === 'L' ? -strLength : +strLength;
    movePosition(length);
  }

  printResult(positionZeroCount);
}

run();

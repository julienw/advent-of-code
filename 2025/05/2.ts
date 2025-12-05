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
  const freshRanges = [];
  for await (const line of lineIterator) {
    if (line === '') {
      break;
    }

    const [start, end] = line.split('-');
    freshRanges.push({ start: +start, end: +end });
  }

  freshRanges.sort(({ start: startA }, { start: startB }) => startA - startB);
  console.log(freshRanges);

  let count = 0;
  let previousEnd = -1;
  for (const { start, end } of freshRanges) {
    console.log('range', start, end);
    const realStart = start > previousEnd ? start : previousEnd + 1;
    console.log('realStart', realStart);
    if (end >= realStart) {
      const diff = end - realStart + 1;
      console.log('end >= realStart: counting', diff);
      count += diff;
    }
    if (end > previousEnd) {
      console.log('new previousEnd is', end);
      previousEnd = end;
    }
  }
  printResult(count);
}

run();

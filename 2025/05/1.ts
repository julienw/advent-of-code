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
  let inputState: 'inventory' | 'ingredients' = 'inventory';
  let count = 0;
  for await (const line of lineIterator) {
    if (line === '') {
      inputState = 'ingredients';
      continue;
    }

    switch (inputState) {
      case 'inventory': {
        const [start, end] = line.split('-');
        freshRanges.push({ start: +start, end: +end });
        break;
      }
      case 'ingredients': {
        const id = +line;
        for (const { start, end } of freshRanges) {
          if (start <= id && id <= end) {
            count++;
            break;
          }
        }
        break;
      }
      default:
        throw new Error(`Unknown inputState ${inputState}`);
    }
  }

  printResult(count);
}

run();

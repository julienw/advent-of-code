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
    line.split(',')
  );

  function area(indexA, indexB) {
    const a = input[indexA];
    const b = input[indexB];

    return (Math.abs(a[0] - b[0]) + 1) * (Math.abs(a[1] - b[1]) + 1);
  }

  const allPairs = [];
  for (let i = 0; i < input.length - 1; i++) {
    for (let j = i + 1; j < input.length; j++) {
      allPairs.push({ a: i, b: j, area: area(i, j) });
    }
  }

  allPairs.sort(({ area: a }, { area: b }) => a - b);

  printResult(allPairs.at(-1));
}

run();

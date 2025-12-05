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
  const banks = [];
  const results = [];
  let result = 0;
  for await (const line of lineIterator) {
    const batteries = line.split('').map((n) => Number(n));
    banks.push(batteries);

    const maxFirst = Math.max(...batteries.slice(0, -1));
    const indexOfMax = batteries.indexOf(maxFirst);
    //console.log(batteries, maxFirst, indexOfMax);
    const maxSecond = Math.max(...batteries.slice(indexOfMax + 1));
    const joltage = Number('' + maxFirst + maxSecond);
    results.push(joltage);
    result += joltage;
  }

  //printResult(results);
  printResult(result);
}

run();

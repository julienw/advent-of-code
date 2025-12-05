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
  let result = BigInt(0);
  for await (const line of lineIterator) {
    const batteries = line.split('').map((n) => Number(n));
    banks.push(batteries);

    const digits = [];
    let previousIndex = -1;
    console.log('<- ', batteries);
    for (let i = 11; i >= 0; i--) {
      const maxDigit = Math.max(
        ...batteries.slice(previousIndex + 1, batteries.length - i)
      );
      previousIndex = batteries.indexOf(maxDigit, previousIndex + 1);
      digits.push(maxDigit);
      console.log(i, maxDigit, previousIndex);
    }
    console.log('-> ', digits);
    const joltage = BigInt(digits.join(''));
    results.push(joltage);
    result += joltage;
  }

  //printResult(results);
  printResult(result);
}

run();

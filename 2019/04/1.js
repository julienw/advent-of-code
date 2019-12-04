// @flow
// Pipe the input to this script to get the result

const readline = require('readline');
const assert = require('assert');

async function* processLineByLine() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  yield* rl;
}

const adjacentRe = /00|11|22|33|44|55|66|77|88|99/;

function hasAdjacentDigits(number: string) {
  if (number.length < 2) {
    return false;
  }

  return adjacentRe.test(number);
}

function hasIncreasingSequence(number: string) {
  if (number.length <= 1) {
    return true;
  }

  for (let i = 1; i < number.length; i++) {
    if (+number[i] - +number[i - 1] < 0) {
      return false;
    }
  }
  return true;
}

function isExpected(number) {
  const strNumber = String(number);
  return hasAdjacentDigits(strNumber) && hasIncreasingSequence(strNumber);
}

async function run() {
  assert(isExpected(111111111));
  assert(isExpected(12234589));
  assert(!isExpected(123456789));
  assert(!isExpected(1234550));

  const range = (await processLineByLine().next()).value;
  if (!range) {
    throw new Error(`Oops there's no input`);
  }

  const [start, end] = range.split('-').map(str => +str);

  let count = 0;
  for (let i = start; i <= end; i++) {
    if (isExpected(i)) {
      count++;
    }
  }
  console.log(count);
}

run();

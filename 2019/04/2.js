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

const adjacentRe = /(?<!0)00(?!0)|(?<!1)11(?!1)|(?<!2)22(?!2)|(?<!3)33(?!3)|(?<!4)44(?!4)|(?<!5)55(?!5)|(?<!6)66(?!6)|(?<!7)77(?!7)|(?<!8)88(?!8)|(?<!9)99(?!9)/;

function hasAdjacentDigits(number: string) {
  if (number.length < 2) {
    return false;
  }

  return adjacentRe.test(number);
}

const increasingRe = /^0*1*2*3*4*5*6*7*8*9*$/;
function hasIncreasingSequence(number: string) {
  if (number.length <= 1) {
    return true;
  }

  return increasingRe.test(number);
}

function isExpected(number) {
  const strNumber = String(number);
  return hasAdjacentDigits(strNumber) && hasIncreasingSequence(strNumber);
}

async function run() {
  assert(isExpected(112233));
  assert(!isExpected(123444));
  assert(isExpected(111122));

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

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

function printResult(...args) {
  console.log(...args);
}

type SnailfishNumber = [number | SnailfishNumber, number | SnailfishNumber];

function maybeExplode(
  number: SnailfishNumber,
  depth: number = 1,
  addToPrev: (number) => void = () => {},
  addToNext: (number) => void = () => {}
) {
  let hasExploded = false;
  const addToLast = (number: SnailfishNumber, toAdd: number) => {
    if (typeof number[1] === 'number') {
      number[1] += toAdd;
    } else {
      addToLast(number[1], toAdd);
    }
  };

  const addToFirst = (number: SnailfishNumber, toAdd: number) => {
    if (typeof number[0] === 'number') {
      number[0] += toAdd;
    } else {
      addToFirst(number[0], toAdd);
    }
  };

  const addToFirstOfLast = (toAdd: number) => {
    if (typeof number[1] === 'number') {
      number[1] += toAdd;
    } else {
      addToFirst(number[1], toAdd);
    }
  };

  const addToLastOfFirst = (toAdd: number) => {
    if (typeof number[0] === 'number') {
      number[0] += toAdd;
    } else {
      addToLast(number[0], toAdd);
    }
  };

  const [first, last] = number;
  if (typeof first !== 'number') {
    if (depth === 4) {
      // We need to explode the first element
      if (typeof first[0] !== 'number' || typeof first[1] !== 'number') {
        // This can not happen: depth 5 should always be a pair of numbers
        throw new Error(`Invalid pair at depth 5 ${String(first)}`);
      }
      const [firstNumber, lastNumber] = first;
      addToPrev(firstNumber);
      addToFirstOfLast(lastNumber);
      number[0] = 0;
      return true;
    }
    hasExploded = maybeExplode(first, depth + 1, addToPrev, addToFirstOfLast);
  }
  if (hasExploded) {
    return true;
  }

  if (typeof last !== 'number') {
    if (depth === 4) {
      // We need to explode the second element
      if (typeof last[0] !== 'number' || typeof last[1] !== 'number') {
        // This can not happen: depth 5 should always be a pair of numbers
        throw new Error(`Invalid pair at depth 5 ${String(last)}`);
      }
      const [firstNumber, lastNumber] = last;
      addToLastOfFirst(firstNumber);
      addToNext(lastNumber);
      number[1] = 0;
      return true;
    }
    hasExploded = maybeExplode(last, depth + 1, addToLastOfFirst, addToNext);
  }

  return hasExploded;
}

function maybeSplit(number: SnailfishNumber) {
  if (typeof number[0] === 'number') {
    if (number[0] >= 10) {
      const thisNumber = number[0];
      number[0] = [Math.floor(thisNumber / 2), Math.ceil(thisNumber / 2)];
      return true;
    }
  } else {
    const hasSplitFirstElement = maybeSplit(number[0]);
    if (hasSplitFirstElement) {
      return true;
    }
  }

  if (typeof number[1] === 'number') {
    if (number[1] >= 10) {
      const thisNumber = number[1];
      number[1] = [Math.floor(thisNumber / 2), Math.ceil(thisNumber / 2)];
      return true;
    }
  } else {
    const hasSplitSecondElement = maybeSplit(number[1]);
    if (hasSplitSecondElement) {
      return true;
    }
  }

  return false;
}

function reduceSnailfish(state: SnailfishNumber) {
  let hasExploded = false;
  let hasSplit = false;
  do {
    hasExploded = maybeExplode(state);
    if (!hasExploded) {
      hasSplit = maybeSplit(state);
    }
  } while (hasExploded || hasSplit);
  return state;
}

function computeMagnitude(number: SnailfishNumber | number) {
  if (typeof number === 'number') {
    return number;
  }

  return computeMagnitude(number[0]) * 3 + computeMagnitude(number[1]) * 2;
}

function computeMagnitudeOfSum(
  number1: SnailfishNumber,
  number2: SnailfishNumber
) {
  const number = reduceSnailfish([number1, number2]);
  return computeMagnitude(number);
}

async function run() {
  const lineIterator = processLineByLine();

  const inputs = [];
  for await (const line of lineIterator) {
    inputs.push(line);
  }

  if (inputs.length <= 2) {
    throw new Error('Please use some input file');
  }

  let bestMagnitude = -Infinity;
  for (let i = 0; i < inputs.length; i++) {
    for (let j = 0; j < inputs.length; j++) {
      if (i === j) {
        continue;
      }

      console.log('inputs i', inputs[i]);
      console.log('inputs j', inputs[j]);
      const magnitude1 = computeMagnitudeOfSum(
        JSON.parse(inputs[i]),
        JSON.parse(inputs[j])
      );
      const magnitude2 = computeMagnitudeOfSum(
        JSON.parse(inputs[j]),
        JSON.parse(inputs[i])
      );
      console.log('magnitude i+j', magnitude1);
      console.log('magnitude j+i', magnitude2);
      bestMagnitude = Math.max(bestMagnitude, magnitude1, magnitude2);
    }
  }
  printResult(bestMagnitude);
}

run();

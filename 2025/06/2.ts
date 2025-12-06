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

function transpose(matrix) {
  const rowLength = matrix.length;
  if (!rowLength) {
    return [[]];
  }

  const columnLength = matrix[0].length;

  const result = Array.from({ length: columnLength }, () => []);

  for (let i = 0; i < rowLength; i++) {
    for (let j = 0; j < columnLength; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

function sum(array) {
  return array.reduce((acc, val) => acc + +val, 0);
}

function multiply(array) {
  return array.reduce((acc, val) => acc * +val, 1);
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const input = (await Array.fromAsync(lineIterator)).map((line) => {
    return line.split('');
  });
  const transposed = transpose(input);

  let result = 0;
  let operator;
  let numbers = [];

  function applyOperation() {
    console.log(operator, numbers);
    switch (operator) {
      case '+':
        result += sum(numbers);
        break;
      case '*':
        result += multiply(numbers);
        break;
      default:
        throw new Error(`Unknown operator ${operator}`);
    }
  }

  for (const operations of transposed) {
    console.log(operations);
    if (operations.every((char) => char === ' ')) {
      // End of this operation
      applyOperation();

      numbers = [];
      continue;
    }

    if (!numbers.length) {
      operator = operations.pop();
    }

    numbers.push(+operations.join(''));
  }

  applyOperation();

  printResult(result);
}

run();

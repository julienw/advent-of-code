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
    return line.trim().split(/\s+/);
  });
  input.at(-1).map((op) => process.stdout.write(op));
  process.stdout.write('\n');
  const transposed = transpose(input);

  let result = 0;
  for (const operations of transposed) {
    const operator = operations.pop();
    switch (operator) {
      case '+':
        result += sum(operations);
        break;
      case '*':
        result += multiply(operations);
        break;
      default:
        throw new Error(`Unknown operator ${operator}`);
    }
  }

  printResult(result);
}

run();

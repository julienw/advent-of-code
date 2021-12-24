// @flow
// Pipe the input to this script to get the result

const readline = require('readline');
import { parseProgram } from './alu';

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

async function run() {
  const lineIterator = processLineByLine();

  const sourceCodeInput = [];
  for await (const line of lineIterator) {
    sourceCodeInput.push(line);
  }
  const { sourceCode, func } = parseProgram(sourceCodeInput);
  const input = process.argv.slice(2).map((val) => +val);
  console.log('input: ', input);
  if (input.length) {
    console.log('sourceCode: \n', sourceCode);
    printResult(func(input));
  } else {
    // TODO
    throw new Error(`No input??`);
  }
}

run();

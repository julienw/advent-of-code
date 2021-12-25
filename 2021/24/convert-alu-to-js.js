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

async function run() {
  const lineIterator = processLineByLine();

  const sourceCodeInput = [];
  for await (const line of lineIterator) {
    sourceCodeInput.push(line);
  }
  const { sourceCode } = parseProgram(sourceCodeInput);
  console.log(sourceCode);
}

run();

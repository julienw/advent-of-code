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

function printResult(result) {
  console.log(result);
}

type StartChar = '(' | '[' | '{' | '<';
type EndChar = ')' | ']' | '}' | '>';

const PAIRS: { [StartChar]: EndChar } = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};

const START_CHARS: StartChar[] = Object.keys(PAIRS);
// $FlowIgnoreError
const END_CHARS: EndChar[] = Object.values(PAIRS);

const SCORES_PER_BAD_CHAR: {| [EndChar]: number |} = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};

function findFirstCorruptedChar(line: string): EndChar | null {
  const stack: StartChar[] = [];

  for (const currentChar of line) {
    if (START_CHARS.includes(currentChar)) {
      // $FlowIgnoreError
      stack.push(currentChar);
      continue;
    }

    if (END_CHARS.includes(currentChar)) {
      const previousChar = stack.pop();
      if (currentChar !== PAIRS[previousChar]) {
        // Oops, wrong pair -> corrupted line
        // $FlowIgnoreError
        return currentChar;
      }
      // otherwise everything's fine!
    }
  }

  return null;
}

async function run() {
  const lineIterator = processLineByLine();
  let score = 0;
  for await (const line of lineIterator) {
    const firstCorrupted = findFirstCorruptedChar(line);
    if (firstCorrupted) {
      score += SCORES_PER_BAD_CHAR[firstCorrupted];
    }
  }
  printResult(score);
}

run();

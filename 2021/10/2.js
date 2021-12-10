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

const SCORES_PER_NEW_CHAR: {| [EndChar]: number |} = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
};

// Return the list of char if incomplete. The list will be empty if the line was
// corrupted or complete.
function processLine(line: string): EndChar[] {
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
        return [];
      }
      // otherwise everything's fine!
    }
  }

  // We looked at the full line, is it complete?
  if (!stack.length) {
    // It's complete
    return [];
  }

  // At this point the line is correct but incomplete, let's autocomplete it!
  const autocomplete = [];
  while (stack.length) {
    const startChar = stack.pop();
    autocomplete.push(PAIRS[startChar]);
  }

  return autocomplete;
}

async function run() {
  const lineIterator = processLineByLine();
  const scores = [];
  for await (const line of lineIterator) {
    const addedCharacters = processLine(line);
    const score = addedCharacters.reduce(
      (score, char) => score * 5 + SCORES_PER_NEW_CHAR[char],
      0
    );
    if (score) scores.push(score);
  }

  // sort scores, then pick the middle score
  scores.sort((a, b) => a - b);
  // $FlowIgnoreError
  const middleScore = scores.at(scores.length / 2);
  printResult(middleScore);
}

run();

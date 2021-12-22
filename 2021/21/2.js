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

function findStart(str): number {
  if (!str) {
    throw new Error('No input!');
  }
  const matchResult = /\d+$/.exec(str);
  if (!matchResult) {
    throw new Error(`Couldn't find a match in ${str}`);
  }
  return +matchResult[0];
}

function advance(position: number, byValue: number): number {
  return (position + byValue) % 10;
}

// Little wrapper so that Flow is happy
function wrapEndlessGenerator<T>(
  endlessGenerator: Generator<T, any, any>
): () => T {
  // $FlowIgnoreError[incompatible-return]
  return () => endlessGenerator.next().value;
}

type State = {|
  positions: [number, number],
  scores: [number, number],
  nextPlayer: 0 | 1,
|};

const rollFrequencies = new Uint8Array(10);
const possibleRolls = new Set();
[1, 2, 3].forEach((roll1) =>
  [1, 2, 3].forEach((roll2) =>
    [1, 2, 3].forEach((roll3) => {
      const roll = roll1 + roll2 + roll3;
      rollFrequencies[roll]++;
      possibleRolls.add(roll);
    })
  )
);

console.log(rollFrequencies);
console.log(possibleRolls);

function playState(state: State): [number, number] {
  const { positions, scores, nextPlayer } = state;
  const wins = [0, 0];
  for (const roll of possibleRolls) {
    const universes = rollFrequencies[roll];
    const newPositions = positions.slice();
    const newScores = scores.slice();

    const currentPosition = newPositions[nextPlayer];
    const newPosition = advance(currentPosition, roll);
    newPositions[nextPlayer] = newPosition;

    // The position value is the real position minus 1, so we're incrementing by 1 to account for that here.
    newScores[nextPlayer] += newPosition + 1;

    if (newScores[0] >= 21) {
      wins[0] += universes;
      continue;
    } else if (newScores[1] >= 21) {
      wins[1] += universes;
      continue;
    }

    const newState: State = {
      // $FlowIgnoreError[invalid-tuple-arity]
      positions: newPositions,
      // $FlowIgnoreError[invalid-tuple-arity]
      scores: newScores,
      // $FlowIgnoreError[incompatible-type]
      nextPlayer: 1 - nextPlayer,
    };

    const recursiveWins = playState(newState);
    wins[0] += recursiveWins[0] * universes;
    wins[1] += recursiveWins[1] * universes;
  }
  return wins;
}

async function run() {
  const lineIterator = processLineByLine();

  const line1 = (await lineIterator.next()).value;
  const line2 = (await lineIterator.next()).value;
  const initialState: State = {
    positions: [findStart(line1) - 1, findStart(line2) - 1],
    scores: [0, 0],
    nextPlayer: 0,
  };

  const wins = playState(initialState);
  printResult(Math.max(...wins));
}

run();

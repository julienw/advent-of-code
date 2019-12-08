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

function splitIntoPositions(input) {
  return input.split(',');
}

function fetch(positions, startIndex, modes, paramIndex) {
  const inputIndex = +positions[startIndex + paramIndex];
  const mode = modes[paramIndex - 1];
  return +mode === 0 ? +positions[+inputIndex] : +inputIndex;
}

function assertPosition(mode) {
  if (+mode === 1) {
    throw new Error(
      `Expected mode to be 'position', but was 'immediate' instead.`
    );
  }
}

function add(state, strModes) {
  const { positions, index } = state;
  const paramsCount = 3;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(positions, index, modes, paramIndex++);
  const input2 = fetch(positions, index, modes, paramIndex++);
  const result = input1 + input2;

  const storeIndex = +positions[index + paramIndex++];
  assertPosition(modes[2]);

  positions[storeIndex] = result;

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function multiply(state, strModes) {
  const { positions, index } = state;
  const paramsCount = 3;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(positions, index, modes, paramIndex++);
  const input2 = fetch(positions, index, modes, paramIndex++);
  const result = input1 * input2;

  const storeIndex = +positions[index + paramIndex++];
  assertPosition(modes[2]);

  positions[storeIndex] = result;

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function input(state, strModes) {
  const { positions, index, inputs } = state;
  const paramsCount = 1;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const storeIndex = +positions[index + paramIndex++];
  assertPosition(modes[0]);

  positions[storeIndex] = inputs.shift();

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function output(state, strModes) {
  const { positions, index, outputs } = state;
  const paramsCount = 1;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input = fetch(positions, index, modes, paramIndex++);
  outputs.push(input);

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function jumpIfTrue(state, strModes) {
  const { positions, index } = state;
  const paramsCount = 2;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(positions, index, modes, paramIndex++);
  const input2 = fetch(positions, index, modes, paramIndex++);

  if (input1 !== 0) {
    state.index = input2;
  } else {
    state.index += paramsCount + 1;
  }
  assert.equal(paramsCount + 1, paramIndex);
}

function jumpIfFalse(state, strModes) {
  const { positions, index } = state;
  const paramsCount = 2;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(positions, index, modes, paramIndex++);
  const input2 = fetch(positions, index, modes, paramIndex++);

  if (input1 === 0) {
    state.index = input2;
  } else {
    state.index += paramsCount + 1;
  }
  assert.equal(paramsCount + 1, paramIndex);
}

function lessThan(state, strModes) {
  const { positions, index } = state;
  const paramsCount = 3;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(positions, index, modes, paramIndex++);
  const input2 = fetch(positions, index, modes, paramIndex++);

  const storeIndex = +positions[index + paramIndex++];
  assertPosition(modes[2]);

  positions[storeIndex] = input1 < input2 ? 1 : 0;

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function equals(state, strModes) {
  const { positions, index } = state;
  const paramsCount = 3;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(positions, index, modes, paramIndex++);
  const input2 = fetch(positions, index, modes, paramIndex++);

  const storeIndex = +positions[index + paramIndex++];
  assertPosition(modes[2]);

  positions[storeIndex] = input1 === input2 ? 1 : 0;
  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

type Operation = (
  state: {|
    positions: Array<string | number>,
    index: number,
    inputs: Array<string | number>,
    outputs: Array<number>,
  |},
  modes: string
) => void;

type Opcode = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
const operations: { [opcode: Opcode]: Operation } = {
  '1': add,
  '2': multiply,
  '3': input,
  '4': output,
  '5': jumpIfTrue,
  '6': jumpIfFalse,
  '7': lessThan,
  '8': equals,
};

function processOnePosition(state) {
  const { index, positions } = state;
  if (index >= positions.length) {
    throw new Error(`Oops we don't have anymore input at position ${index}`);
  }

  const fullOpcode = positions[index];
  // This is a bit complex, but this effectively removes any possible leading 0.
  const opcode = String(+String(fullOpcode).slice(-2));
  const modes = String(fullOpcode).slice(0, -2);
  switch (opcode) {
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
      operations[opcode](state, modes);
      return true;
    case '99':
      return false;
    default:
      throw new Error(`Invalid opcode ${opcode} at position ${index}`);
  }
}

// This is used for debug only
// eslint-disable-next-line no-unused-vars
function printFullState(positions) {
  console.log(positions.join(','));
}

function runProgram(program, inputs): number[] {
  const positions: Array<string | number> = (program.slice(): any);

  const state = {
    positions,
    index: 0,
    inputs: inputs.slice(),
    outputs: [],
  };

  let continueProgram = true;
  while (continueProgram) {
    //printFullState(positions);
    continueProgram = processOnePosition(state);
  }

  return state.outputs;
}

function runProgramWithPhases(program, phases: number[]) {
  return phases.reduce((previousResult, phase) => {
    const [output] = runProgram(program, [phase, previousResult]);
    return output;
  }, 0);
}

function findPermutations(source: number[]): number[][] {
  if (source.length === 1) {
    return [source];
  }

  const result = [];

  for (let i = 0; i < source.length; i++) {
    const smallerSource = source.slice();
    const [val] = smallerSource.splice(i, 1);
    const smallerPermutations = findPermutations(smallerSource);
    result.push(
      ...smallerPermutations.map(permutation => [val, ...permutation])
    );
  }
  return result;
}

async function run() {
  const lineIterator = processLineByLine();
  const line = (await lineIterator.next()).value;
  if (!line) {
    throw new Error('No input!');
  }
  const program: string[] = splitIntoPositions(line);
  const permutations = findPermutations([0, 1, 2, 3, 4]);
  const results = new Map();
  for (const permutation of permutations) {
    const result = runProgramWithPhases(program, permutation);
    results.set(permutation.join(''), result);
  }

  const maxResult = Math.max(...results.values());
  const keyForMaxResult = [...results.keys()].find(
    key => results.get(key) === maxResult
  );

  console.log(`${String(keyForMaxResult)} => ${maxResult}`);
}

run();

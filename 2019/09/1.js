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

function fetch(
  { positions, index: startIndex, relativeBase },
  modes,
  paramIndex
) {
  const inputIndex = +positions[startIndex + paramIndex];
  const mode = +modes[paramIndex - 1];
  switch (mode) {
    case 0:
      return +positions[inputIndex] || 0;
    case 1:
      return inputIndex;
    case 2:
      return +positions[relativeBase + inputIndex] || 0;
    default:
      throw new Error(`Invalid mode ${mode}`);
  }
}

function store(value, { positions, index, relativeBase }, modes, paramIndex) {
  const mode = +modes[paramIndex - 1];

  const storeIndex = +positions[index + paramIndex];
  switch (mode) {
    case 0:
      positions[storeIndex] = value;
      break;
    case 1:
      throw new Error(
        `Expected mode to be 'position' or 'relative', but was 'immediate' instead.`
      );
    case 2:
      positions[relativeBase + storeIndex] = value;
      break;
    default:
      throw new Error(`Invalid mode ${mode}`);
  }
}

function add(state, strModes) {
  const paramsCount = 3;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(state, modes, paramIndex++);
  const input2 = fetch(state, modes, paramIndex++);
  const result = input1 + input2;

  store(result, state, modes, paramIndex++);

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function multiply(state, strModes) {
  const paramsCount = 3;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(state, modes, paramIndex++);
  const input2 = fetch(state, modes, paramIndex++);
  const result = input1 * input2;

  store(result, state, modes, paramIndex++);

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function input(state, strModes) {
  const { inputs } = state;
  const paramsCount = 1;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  store(inputs.shift(), state, modes, paramIndex++);

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function output(state, strModes) {
  const { outputs } = state;
  const paramsCount = 1;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input = fetch(state, modes, paramIndex++);
  outputs.push(input);

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function jumpIfTrue(state, strModes) {
  const paramsCount = 2;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(state, modes, paramIndex++);
  const input2 = fetch(state, modes, paramIndex++);

  if (input1 !== 0) {
    state.index = input2;
  } else {
    state.index += paramsCount + 1;
  }
  assert.equal(paramsCount + 1, paramIndex);
}

function jumpIfFalse(state, strModes) {
  const paramsCount = 2;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(state, modes, paramIndex++);
  const input2 = fetch(state, modes, paramIndex++);

  if (input1 === 0) {
    state.index = input2;
  } else {
    state.index += paramsCount + 1;
  }
  assert.equal(paramsCount + 1, paramIndex);
}

function lessThan(state, strModes) {
  const paramsCount = 3;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(state, modes, paramIndex++);
  const input2 = fetch(state, modes, paramIndex++);

  const result = input1 < input2 ? 1 : 0;
  store(result, state, modes, paramIndex++);

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function equals(state, strModes) {
  const paramsCount = 3;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input1 = fetch(state, modes, paramIndex++);
  const input2 = fetch(state, modes, paramIndex++);

  const result = input1 === input2 ? 1 : 0;
  store(result, state, modes, paramIndex++);

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

function adjustRelativeBase(state, strModes) {
  const paramsCount = 1;
  const modes = Array.from(strModes.padStart(paramsCount, '0')).reverse();

  let paramIndex = 1;
  const input = fetch(state, modes, paramIndex++);
  state.relativeBase += input;

  state.index += paramsCount + 1;
  assert.equal(paramsCount + 1, paramIndex);
}

type Operation = (
  state: {|
    positions: Array<string | number>,
    index: number,
    inputs: Array<string | number>,
    outputs: Array<number>,
    relativeBase: number,
  |},
  modes: string
) => void;

type Opcode = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
const operations: { [opcode: Opcode]: Operation } = {
  '1': add,
  '2': multiply,
  '3': input,
  '4': output,
  '5': jumpIfTrue,
  '6': jumpIfFalse,
  '7': lessThan,
  '8': equals,
  '9': adjustRelativeBase,
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
    case '9':
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
    relativeBase: 0,
  };

  let continueProgram = true;
  while (continueProgram) {
    //printFullState(positions);
    continueProgram = processOnePosition(state);
  }

  return state.outputs;
}

async function run() {
  const lineIterator = processLineByLine();
  const line = (await lineIterator.next()).value;
  if (!line) {
    throw new Error('No input!');
  }
  const program: string[] = splitIntoPositions(line);
  const result = runProgram(program, [1]);
  console.log(result);
}

run();
